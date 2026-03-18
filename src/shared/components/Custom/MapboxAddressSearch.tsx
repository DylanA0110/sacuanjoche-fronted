import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/shared/components/ui/input';
import { MdClose, MdLocationOn, MdMyLocation, MdSearch } from 'react-icons/md';
import {
  GOOGLE_MAPS_API_KEY,
  loadGoogleMapsApi,
} from '@/shared/lib/googleMapsLoader';
import { floristeriaApi } from '@/shared/api/FloristeriaApi';

interface MapboxAddressSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: MapboxAddressData) => void;
  placeholder?: string;
  className?: string;
  showMap?: boolean;
  mapHeight?: string;
}

export interface MapboxAddressData {
  formattedAddress: string;
  country: string;
  adminArea: string | null;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  referencia: string;
  lat: string;
  lng: string;
  provider: string;
  placeId: string;
  accuracy: string;
  geolocation: string;
}

interface GoogleSuggestion {
  id: string;
  label: string;
  placeId: string;
  lat: number;
  lng: number;
  country?: string;
  region?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  postalCode?: string;
  accuracy?: string;
}

interface BackendForwardGeocodeResponse {
  primary: GoogleSuggestion | null;
  results: GoogleSuggestion[];
}

interface SearchState {
  suggestions: GoogleSuggestion[];
  isLoading: boolean;
  showSuggestions: boolean;
  selectedIndex: number;
  isReverseGeocoding: boolean;
}

const DEFAULT_CENTER = { lat: 12.136389, lng: -86.251389 };

function parseAddressComponents(components: any[] | undefined) {
  const safeComponents = components || [];

  const findComponent = (type: string, short = false): string => {
    const match = safeComponents.find((component) =>
      Array.isArray(component.types) && component.types.includes(type)
    );

    if (!match) {
      return '';
    }

    const shortValue = match.short_name ?? match.shortText ?? '';
    const longValue = match.long_name ?? match.longText ?? '';

    return short ? String(shortValue) : String(longValue);
  };

  return {
    country: findComponent('country', true) || 'NIC',
    adminArea: findComponent('administrative_area_level_1') || null,
    city:
      findComponent('locality') ||
      findComponent('administrative_area_level_2') ||
      '',
    neighborhood:
      findComponent('neighborhood') || findComponent('sublocality') || '',
    street: findComponent('route') || '',
    houseNumber: findComponent('street_number') || '',
    postalCode: findComponent('postal_code') || '',
  };
}

export function MapboxAddressSearch({
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar direccion...',
  className = '',
  showMap = true,
  mapHeight = '400px',
}: MapboxAddressSearchProps) {
  const [searchState, setSearchState] = useState<SearchState>({
    suggestions: [],
    isLoading: false,
    showSuggestions: false,
    selectedIndex: -1,
    isReverseGeocoding: false,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapClickListenerRef = useRef<any>(null);
  const markerDragListenerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseGeocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const reverseGeocodeFnRef = useRef<(lat: number, lng: number) => void>(() => {
    // noop until reverseGeocode is initialized.
  });
  const lastSearchQueryRef = useRef<string>('');
  const lastReverseGeocodeRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const searchCacheRef = useRef<Map<string, GoogleSuggestion[]>>(new Map());
  const reverseGeocodeCacheRef = useRef<Map<string, MapboxAddressData>>(
    new Map()
  );

  const ensureGoogleServices = useCallback(() => {
    const gmaps = (window as any).google?.maps;
    if (!gmaps) {
      return null;
    }

    const GeocoderCtor = gmaps.Geocoder;
    if (!geocoderRef.current && typeof GeocoderCtor === 'function') {
      geocoderRef.current = new GeocoderCtor();
    }

    return gmaps;
  }, []);

  const updateMarkerAndMap = useCallback((lat: number, lng: number) => {
    const gmaps = (window as any).google?.maps;
    if (!gmaps || !mapRef.current) {
      return;
    }

    const position = new gmaps.LatLng(lat, lng);

    if (!markerRef.current) {
      markerRef.current = new gmaps.Marker({
        map: mapRef.current,
        position,
        title: 'Ubicacion seleccionada',
        draggable: true,
      });

      markerDragListenerRef.current = markerRef.current.addListener(
        'dragend',
        (event: any) => {
          const latLng = event?.latLng;
          if (!latLng) {
            return;
          }

          const draggedLat = Number(latLng.lat());
          const draggedLng = Number(latLng.lng());

          setSelectedLocation({ lat: draggedLat, lng: draggedLng });

          if (reverseGeocodeTimeoutRef.current) {
            clearTimeout(reverseGeocodeTimeoutRef.current);
          }

          reverseGeocodeTimeoutRef.current = setTimeout(() => {
            reverseGeocodeFnRef.current(draggedLat, draggedLng);
          }, 600);
        }
      );
    } else {
      markerRef.current.setPosition(position);
      markerRef.current.setMap(mapRef.current);
    }

    mapRef.current.panTo(position);
    mapRef.current.setZoom(15);
  }, []);

  const buildAddressData = useCallback(
    (args: {
      formattedAddress: string;
      lat: number;
      lng: number;
      placeId?: string;
      addressComponents?: any[];
      accuracy?: string;
    }): MapboxAddressData => {
      const parsed = parseAddressComponents(args.addressComponents);

      return {
        formattedAddress: args.formattedAddress,
        country: parsed.country || 'NIC',
        adminArea: parsed.adminArea,
        city: parsed.city,
        neighborhood: parsed.neighborhood,
        street: parsed.street,
        houseNumber: parsed.houseNumber,
        postalCode: parsed.postalCode,
        referencia: '',
        lat: args.lat.toString(),
        lng: args.lng.toString(),
        provider: 'GOOGLE MAPS',
        placeId: args.placeId || '',
        accuracy: args.accuracy || 'ROOFTOP',
        geolocation: JSON.stringify({
          accuracy: 10,
          timestamp: Date.now(),
          coordinates: [args.lng, args.lat],
        }),
      };
    },
    []
  );

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      const gmaps = ensureGoogleServices();
      if (!gmaps || !geocoderRef.current) {
        return;
      }

      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLng = Math.round(lng * 10000) / 10000;
      const cacheKey = `${roundedLat},${roundedLng}`;

      if (cacheKey === lastReverseGeocodeRef.current) {
        return;
      }
      lastReverseGeocodeRef.current = cacheKey;

      const cached = reverseGeocodeCacheRef.current.get(cacheKey);
      if (cached) {
        onSelect(cached);
        onChange(cached.formattedAddress);
        setSelectedLocation({ lat: roundedLat, lng: roundedLng });
        updateMarkerAndMap(roundedLat, roundedLng);
        return;
      }

      setSearchState((prev) => ({ ...prev, isReverseGeocoding: true }));

      try {
        const result = await new Promise<any | null>((resolve) => {
          geocoderRef.current.geocode(
            { location: { lat: roundedLat, lng: roundedLng } },
            (results: any[], status: string) => {
              if (status !== 'OK' || !Array.isArray(results) || !results[0]) {
                resolve(null);
                return;
              }
              resolve(results[0]);
            }
          );
        });

        const addressData = result
          ? buildAddressData({
              formattedAddress:
                String(result.formatted_address || '') ||
                `${roundedLat}, ${roundedLng}`,
              lat: roundedLat,
              lng: roundedLng,
              placeId: String(result.place_id || ''),
              addressComponents: result.address_components || [],
            })
          : buildAddressData({
              formattedAddress: `${roundedLat}, ${roundedLng}`,
              lat: roundedLat,
              lng: roundedLng,
              accuracy: 'APPROXIMATE',
            });

        if (reverseGeocodeCacheRef.current.size > 30) {
          const firstKey = reverseGeocodeCacheRef.current.keys().next().value;
          if (firstKey) {
            reverseGeocodeCacheRef.current.delete(firstKey);
          }
        }
        reverseGeocodeCacheRef.current.set(cacheKey, addressData);

        onSelect(addressData);
        onChange(addressData.formattedAddress);
      } finally {
        setSearchState((prev) => ({ ...prev, isReverseGeocoding: false }));
      }
    },
    [buildAddressData, ensureGoogleServices, onChange, onSelect, updateMarkerAndMap]
  );

  useEffect(() => {
    reverseGeocodeFnRef.current = (lat: number, lng: number) => {
      void reverseGeocode(lat, lng);
    };
  }, [reverseGeocode]);

  const attachMapClickListener = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    if (mapClickListenerRef.current) {
      mapClickListenerRef.current.remove();
      mapClickListenerRef.current = null;
    }

    mapClickListenerRef.current = mapRef.current.addListener(
      'click',
      (event: any) => {
        const latLng = event?.latLng;
        if (!latLng) {
          return;
        }

        const lat = Number(latLng.lat());
        const lng = Number(latLng.lng());

        setSelectedLocation({ lat, lng });
        updateMarkerAndMap(lat, lng);

        if (reverseGeocodeTimeoutRef.current) {
          clearTimeout(reverseGeocodeTimeoutRef.current);
        }

        reverseGeocodeTimeoutRef.current = setTimeout(() => {
          void reverseGeocode(lat, lng);
        }, 600);
      }
    );
  }, [reverseGeocode, updateMarkerAndMap]);

  const initializeMap = useCallback(() => {
    const gmaps = ensureGoogleServices();
    if (!gmaps || !showMap || !mapContainerRef.current) {
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new gmaps.Map(mapContainerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 12,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
      });
    }

    attachMapClickListener();
  }, [attachMapClickListener, ensureGoogleServices, showMap]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: GoogleSuggestion) => {
      if (!suggestion.placeId || !Number.isFinite(suggestion.lat) || !Number.isFinite(suggestion.lng)) {
        return;
      }

      const lat = Number(suggestion.lat);
      const lng = Number(suggestion.lng);
      const details = buildAddressData({
        formattedAddress: suggestion.label || `${lat}, ${lng}`,
        lat,
        lng,
        placeId: suggestion.placeId,
        accuracy: suggestion.accuracy || 'ROOFTOP',
      });

      details.country = suggestion.country || details.country;
      details.adminArea = suggestion.region || details.adminArea;
      details.city = suggestion.city || details.city;
      details.neighborhood = suggestion.neighborhood || details.neighborhood;
      details.street = suggestion.street || details.street;
      details.postalCode = suggestion.postalCode || details.postalCode;

      onSelect(details);
      onChange(details.formattedAddress);
      setSelectedLocation({ lat, lng });
      updateMarkerAndMap(lat, lng);

      setSearchState((prev) => ({
        ...prev,
        showSuggestions: false,
        suggestions: [],
        selectedIndex: -1,
      }));
    },
    [buildAddressData, onChange, onSelect, updateMarkerAndMap]
  );

  const searchAddresses = useCallback(
    async (query: string, autoSelectPrimary = false) => {
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < 3) {
        setSearchState((prev) => ({
          ...prev,
          suggestions: [],
          showSuggestions: false,
        }));
        return;
      }

      if (trimmed.toLowerCase() === lastSearchQueryRef.current.toLowerCase()) {
        return;
      }
      lastSearchQueryRef.current = trimmed.toLowerCase();

      const cacheKey = trimmed.toLowerCase();
      const cached = searchCacheRef.current.get(cacheKey);
      if (cached && !autoSelectPrimary) {
        setSearchState((prev) => ({
          ...prev,
          isLoading: false,
          suggestions: cached,
          showSuggestions: cached.length > 0,
        }));
        return;
      }

      setSearchState((prev) => ({ ...prev, isLoading: true }));

      try {
        let suggestions: GoogleSuggestion[] = [];

        try {
          const { data } = await floristeriaApi.get<BackendForwardGeocodeResponse>(
            '/google-maps/geocode',
            {
              params: {
                query: trimmed,
                limit: 5,
                language: 'es',
                country: 'ni',
              },
            }
          );

          const entries = Array.isArray(data?.results) ? data.results : [];

          suggestions = entries
            .map((entry, index) => {
              const placeId = String(entry.id || '');
              const label = String(entry.label || '');
              const lat = Number(entry.lat);
              const lng = Number(entry.lng);

              if (!placeId || !label || !Number.isFinite(lat) || !Number.isFinite(lng)) {
                return null;
              }

              return {
                id: `${placeId}-${index}`,
                label,
                placeId,
                lat,
                lng,
                country: entry.country,
                region: entry.region,
                city: entry.city,
                neighborhood: entry.neighborhood,
                street: entry.street,
                postalCode: entry.postalCode,
                accuracy: entry.accuracy,
              } as GoogleSuggestion;
            })
            .filter((item): item is GoogleSuggestion => item !== null)
            .slice(0, 5);
        } catch {
          // Fallback a geocoder en cliente si backend/API no responde.
          if (geocoderRef.current) {
            const geocoderResults = await new Promise<any[]>((resolve) => {
              geocoderRef.current.geocode(
                { address: trimmed, region: 'NI' },
                (results: any[], status: string) => {
                  if (status !== 'OK' || !Array.isArray(results)) {
                    resolve([]);
                    return;
                  }
                  resolve(results.slice(0, 5));
                }
              );
            });

            suggestions = geocoderResults.map((item) => ({
              id: String(item.place_id || item.formatted_address || Math.random()),
              label: String(item.formatted_address || ''),
              placeId: String(item.place_id || ''),
              lat: Number(item.geometry?.location?.lat?.() ?? Number.NaN),
              lng: Number(item.geometry?.location?.lng?.() ?? Number.NaN),
            }));

            suggestions = suggestions.filter(
              (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)
            );
          }
        }

        if (searchCacheRef.current.size > 50) {
          const firstKey = searchCacheRef.current.keys().next().value;
          if (firstKey) {
            searchCacheRef.current.delete(firstKey);
          }
        }
        searchCacheRef.current.set(cacheKey, suggestions);

        setSearchState((prev) => ({
          ...prev,
          suggestions,
          showSuggestions: suggestions.length > 0,
        }));

        if (autoSelectPrimary && suggestions.length > 0) {
          void handleSelectSuggestion(suggestions[0]);
        }
      } catch (_error) {
        setSearchState((prev) => ({
          ...prev,
          suggestions: [],
          showSuggestions: false,
        }));
      } finally {
        setSearchState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [handleSelectSuggestion]
  );

  const handleManualSearch = useCallback(() => {
    const trimmed = value.trim();

    if (searchState.showSuggestions && searchState.suggestions.length > 0) {
      void handleSelectSuggestion(searchState.suggestions[0]);
      return;
    }

    if (trimmed.length >= 3) {
      lastSearchQueryRef.current = '';
      void searchAddresses(trimmed, true);
    }
  }, [
    handleSelectSuggestion,
    searchAddresses,
    searchState.showSuggestions,
    searchState.suggestions,
    value,
  ]);

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude);
        const lng = Number(position.coords.longitude);

        setSelectedLocation({ lat, lng });
        updateMarkerAndMap(lat, lng);
        void reverseGeocode(lat, lng);
      },
      () => {
        // Silencioso si el navegador niega permisos.
      }
    );
  }, [reverseGeocode, updateMarkerAndMap]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchState.showSuggestions || searchState.suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSearchState((prev) => ({
          ...prev,
          selectedIndex:
            prev.selectedIndex < prev.suggestions.length - 1
              ? prev.selectedIndex + 1
              : prev.selectedIndex,
        }));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSearchState((prev) => ({
          ...prev,
          selectedIndex: prev.selectedIndex > 0 ? prev.selectedIndex - 1 : -1,
        }));
        break;
      case 'Enter':
        e.preventDefault();
        if (
          searchState.selectedIndex >= 0 &&
          searchState.selectedIndex < searchState.suggestions.length
        ) {
          void handleSelectSuggestion(
            searchState.suggestions[searchState.selectedIndex]
          );
        } else if (searchState.suggestions.length > 0) {
          void handleSelectSuggestion(searchState.suggestions[0]);
        }
        break;
      case 'Escape':
        setSearchState((prev) => ({
          ...prev,
          showSuggestions: false,
          selectedIndex: -1,
        }));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        await loadGoogleMapsApi();
        if (!mounted) {
          return;
        }

        const gmaps = ensureGoogleServices();
        if (!gmaps?.Map) {
          throw new Error(
            'Tu API key no tiene acceso a Maps JavaScript API. Revisa restricciones de API key en Google Cloud.'
          );
        }

        initializeMap();
        setApiReady(true);
        setApiError(null);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setApiError(
          error instanceof Error
            ? error.message
            : 'No se pudo inicializar Google Maps.'
        );
      }
    };

    void start();

    return () => {
      mounted = false;
      if (mapClickListenerRef.current) {
        mapClickListenerRef.current.remove();
        mapClickListenerRef.current = null;
      }
      if (markerDragListenerRef.current) {
        markerDragListenerRef.current.remove();
        markerDragListenerRef.current = null;
      }
    };
  }, [ensureGoogleServices, initializeMap]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim() || value.trim().length < 3) {
      setSearchState((prev) => ({
        ...prev,
        suggestions: [],
        showSuggestions: false,
      }));
      lastSearchQueryRef.current = '';
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      void searchAddresses(value, false);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchAddresses, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setSearchState((prev) => ({ ...prev, showSuggestions: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (reverseGeocodeTimeoutRef.current) {
        clearTimeout(reverseGeocodeTimeoutRef.current);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (markerDragListenerRef.current) {
        markerDragListenerRef.current.remove();
        markerDragListenerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full space-y-3">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setSearchState((prev) => ({ ...prev, selectedIndex: -1 }));
            }}
            onFocus={() => {
              if (searchState.suggestions.length > 0) {
                setSearchState((prev) => ({ ...prev, showSuggestions: true }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleManualSearch();
              } else {
                handleKeyDown(e);
              }
            }}
            placeholder={placeholder}
            className={`pl-4 pr-12 h-12 text-base ${className}`}
            autoComplete="off"
          />

          {!searchState.isLoading && value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                lastSearchQueryRef.current = '';
                lastReverseGeocodeRef.current = '';
                searchCacheRef.current.clear();
                reverseGeocodeCacheRef.current.clear();
                setSearchState((prev) => ({
                  ...prev,
                  suggestions: [],
                  showSuggestions: false,
                  selectedIndex: -1,
                }));
                setSelectedLocation(null);

                if (reverseGeocodeTimeoutRef.current) {
                  clearTimeout(reverseGeocodeTimeoutRef.current);
                  reverseGeocodeTimeoutRef.current = null;
                }

                if (markerRef.current) {
                  markerRef.current.setMap(null);
                  markerRef.current = null;
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
              title="Limpiar busqueda"
            >
              <MdClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleManualSearch}
          disabled={searchState.isLoading || value.trim().length < 3}
          className="px-5 h-12 bg-linear-to-r from-[#50C878] to-[#3aa85c] hover:from-[#50C878]/90 hover:to-[#3aa85c]/90 text-white font-semibold rounded-lg shadow-md shadow-[#50C878]/20 transition-all duration-200 hover:shadow-lg hover:shadow-[#50C878]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 min-w-[120px]"
          title="Buscar direccion"
        >
          {searchState.isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <MdSearch className="h-5 w-5" />
              <span>Buscar</span>
            </>
          )}
        </button>
      </div>

      {searchState.showSuggestions && searchState.suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-80 overflow-y-auto"
          style={{ top: '100%' }}
        >
          <div className="py-1">
            {searchState.suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => void handleSelectSuggestion(suggestion)}
                className={`w-full text-left px-4 py-3 transition-colors duration-150 ${
                  index === searchState.selectedIndex
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                } ${index > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 shrink-0 ${
                      index === searchState.selectedIndex
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <MdLocationOn className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        index === searchState.selectedIndex
                          ? 'text-blue-900'
                          : 'text-gray-900'
                      }`}
                    >
                      {suggestion.label}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {value && value.length > 0 && value.length < 3 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <span>Escribe al menos 3 caracteres para ver sugerencias</span>
        </div>
      )}

      {showMap && (
        <div
          className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white"
          style={{ height: mapHeight }}
        >
          {/* Google Maps debe montar en un nodo dedicado para evitar conflictos con React. */}
          <div ref={mapContainerRef} className="absolute inset-0" />

          {searchState.isReverseGeocoding && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#50C878]/20 border-t-[#50C878] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Obteniendo direccion...
                </p>
                <p className="text-xs text-gray-500 mt-1">Por favor espera</p>
              </div>
            </div>
          )}

          {!GOOGLE_MAPS_API_KEY && !searchState.isReverseGeocoding && (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200">
              <div className="text-center p-6 max-w-md">
                <div className="w-16 h-16 bg-linear-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MdLocationOn className="h-8 w-8 text-amber-700" />
                </div>
                <p className="text-lg font-bold text-gray-800 mb-2">
                  Mapa no disponible
                </p>
                <div className="bg-white rounded-lg p-4 mb-4 border border-amber-200 shadow-sm">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Para habilitar el mapa:
                  </p>
                  <ol className="text-xs text-left text-gray-600 space-y-2 list-decimal list-inside">
                    <li>
                      Abre tu archivo{' '}
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                        .env
                      </code>
                    </li>
                    <li>
                      Agrega:{' '}
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                        VITE_GOOGLE_MAPS_API_KEY=tu_api_key_google
                      </code>
                    </li>
                    <li>
                      <strong>Reinicia el servidor</strong> con{' '}
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                        npm run dev
                      </code>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {GOOGLE_MAPS_API_KEY && !searchState.isReverseGeocoding && (
            <>
              {!apiReady && !apiError && (
                <div className="absolute inset-0 z-20 w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="w-10 h-10 border-3 border-[#50C878]/20 border-t-[#50C878] rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Cargando mapa...</p>
                  </div>
                </div>
              )}

              {apiError && (
                <div className="absolute inset-0 z-20 w-full h-full flex items-center justify-center bg-red-50 border-2 border-dashed border-red-200">
                  <div className="text-center p-6 max-w-md">
                    <p className="text-base font-semibold text-red-700 mb-2">
                      Error al cargar Google Maps
                    </p>
                    <p className="text-sm text-red-600">{apiError}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 group"
                title="Usar mi ubicacion actual"
              >
                <MdMyLocation className="h-5 w-5 text-gray-600 group-hover:text-[#50C878] transition-colors" />
              </button>
            </>
          )}
        </div>
      )}

      {showMap && selectedLocation && !searchState.isReverseGeocoding && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <MdLocationOn className="h-4 w-4 text-[#50C878]" />
          <span>
            Ubicacion seleccionada:{' '}
            <span className="font-semibold text-gray-700">
              {value || 'Coordenadas'}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
