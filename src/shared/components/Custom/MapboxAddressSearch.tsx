import {
  useState,
  useCallback,
  useEffect,
  useRef,
  lazy,
  Suspense,
} from 'react';
import { Input } from '@/shared/components/ui/input';
import { MdSearch, MdClose, MdLocationOn, MdMyLocation } from 'react-icons/md';
import type { ViewState } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Lazy load del mapa para mejorar rendimiento
const MapComponent = lazy(() =>
  import('react-map-gl').then((mod) => ({ default: mod.default }))
);
const Marker = lazy(() =>
  import('react-map-gl').then((mod) => ({ default: mod.Marker }))
);

// Token de Mapbox para usar directamente desde el frontend
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
const MAPBOX_GEOCODING_API = 'https://api.mapbox.com/geocoding/v5';

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

// Interfaz para la respuesta de la API de Mapbox Geocoding
interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
    [key: string]: any;
  };
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
    [key: string]: any;
  }>;
}

interface MapboxGeocodeResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

// Interfaz para los resultados procesados
interface MapboxGeocodeResult {
  id: string;
  label: string;
  lat: number;
  lng: number;
  country: string;
  region: string;
  city: string;
  neighborhood: string;
  street: string;
  postalCode: string;
  accuracy: string;
  placeName: string;
  relevance: number;
}

interface SearchState {
  suggestions: MapboxGeocodeResult[];
  isLoading: boolean;
  showSuggestions: boolean;
  selectedIndex: number;
  isReverseGeocoding: boolean;
}

interface MapState {
  viewState: ViewState;
  selectedLocation: { lat: number; lng: number } | null;
}

export function MapboxAddressSearch({
  value,
  onChange,
  onSelect,
  placeholder = 'Buscar dirección...',
  className = '',
  showMap = true,
  mapHeight = '400px',
}: MapboxAddressSearchProps) {
  // Estado consolidado de búsqueda
  const [searchState, setSearchState] = useState<SearchState>({
    suggestions: [],
    isLoading: false,
    showSuggestions: false,
    selectedIndex: -1,
    isReverseGeocoding: false,
  });

  // Estado consolidado del mapa
  const [mapState, setMapState] = useState<MapState>({
    viewState: {
      longitude: -86.251389,
      latitude: 12.136389,
      zoom: 12,
      bearing: 0,
      pitch: 0,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    },
    selectedLocation: null,
  });

  // Refs para timeouts y controladores
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseGeocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSearchQueryRef = useRef<string>('');
  const lastReverseGeocodeRef = useRef<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Caché simple para evitar solicitudes duplicadas
  const searchCacheRef = useRef<Map<string, MapboxGeocodeResult[]>>(new Map());
  const reverseGeocodeCacheRef = useRef<Map<string, MapboxAddressData>>(
    new Map()
  );

  // Función para procesar features de Mapbox
  const processMapboxFeatures = useCallback(
    (features: MapboxFeature[]): MapboxGeocodeResult[] => {
      return features.map((feature) => {
        const [lng, lat] = feature.center;
        const context = feature.context || [];

        // Extraer información del contexto
        let country = '';
        let region = '';
        let city = '';
        let neighborhood = '';
        let street = '';
        let postalCode = '';

        context.forEach((ctx) => {
          const id = ctx.id;
          if (id.startsWith('country')) {
            country = ctx.text;
          } else if (id.startsWith('region')) {
            region = ctx.text;
          } else if (id.startsWith('place') || id.startsWith('locality')) {
            city = ctx.text;
          } else if (id.startsWith('neighborhood')) {
            neighborhood = ctx.text;
          } else if (id.startsWith('address') || id.startsWith('street')) {
            street = ctx.text;
          } else if (id.startsWith('postcode')) {
            postalCode = ctx.text;
          }
        });

        return {
          id: feature.id,
          label: feature.place_name,
          lat,
          lng,
          country: country || 'Nicaragua',
          region: region || '',
          city: city || '',
          neighborhood: neighborhood || '',
          street: street || '',
          postalCode: postalCode || '',
          accuracy: feature.properties.accuracy || 'point',
          placeName: feature.place_name,
          relevance: feature.relevance,
        };
      });
    },
    []
  );

  // Función para buscar direcciones usando Mapbox API directamente
  const searchAddresses = useCallback(
    async (query: string, autoSelectPrimary = false) => {
      if (!MAPBOX_TOKEN) {
        return;
      }

      const trimmedQuery = query.trim();

      // Validación: mínimo 3 caracteres para autocompletado
      if (!trimmedQuery || trimmedQuery.length < 3) {
        setSearchState((prev) => ({
          ...prev,
          suggestions: [],
          showSuggestions: false,
        }));
        return;
      }

      // Evitar búsquedas duplicadas
      if (
        trimmedQuery.toLowerCase() === lastSearchQueryRef.current.toLowerCase()
      ) {
        return;
      }
      lastSearchQueryRef.current = trimmedQuery.toLowerCase();

      // Verificar caché
      const cacheKey = trimmedQuery.toLowerCase();
      if (searchCacheRef.current.has(cacheKey) && !autoSelectPrimary) {
        const cachedResults = searchCacheRef.current.get(cacheKey)!;
        setSearchState((prev) => ({
          ...prev,
          suggestions: cachedResults,
          showSuggestions: true,
          isLoading: false,
        }));
        // Si hay un resultado primario en caché y autoSelectPrimary es true, seleccionarlo
        if (autoSelectPrimary && cachedResults.length > 0) {
          setTimeout(() => {
            const result = cachedResults[0];
            const addressData: MapboxAddressData = {
              formattedAddress: result.placeName || result.label,
              country: result.country === 'Nicaragua' ? 'NIC' : result.country,
              adminArea: result.region || null,
              city: result.city || '',
              neighborhood: result.neighborhood || '',
              street: result.street || '',
              houseNumber: '',
              postalCode: result.postalCode || '',
              referencia: '',
              lat: result.lat.toString(),
              lng: result.lng.toString(),
              provider: 'MAP BOX',
              placeId: result.id,
              accuracy:
                result.accuracy === 'point'
                  ? 'ROOFTOP'
                  : result.accuracy.toUpperCase(),
              geolocation: JSON.stringify({
                accuracy: 10,
                timestamp: Date.now(),
                coordinates: [result.lng, result.lat],
              }),
            };

            onSelect(addressData);
            onChange(result.placeName || result.label);
            setSearchState((prev) => ({
              ...prev,
              showSuggestions: false,
              suggestions: [],
            }));

            setMapState((prev) => ({
              ...prev,
              viewState: {
                ...prev.viewState,
                longitude: result.lng,
                latitude: result.lat,
                zoom: 15,
              },
              selectedLocation: { lat: result.lat, lng: result.lng },
            }));
          }, 100);
        }
        return;
      }

      // Cancelar solicitud anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setSearchState((prev) => ({ ...prev, isLoading: true }));
      try {
        // Llamar directamente a la API de Mapbox Geocoding
        const encodedQuery = encodeURIComponent(trimmedQuery);
        const url = `${MAPBOX_GEOCODING_API}/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_TOKEN}&country=ni&language=es&autocomplete=true&limit=5&proximity=-86.251389,12.136389`;

        const response = await fetch(url, {
          signal: abortController.signal,
        });

        // Verificar si la solicitud fue cancelada
        if (abortController.signal.aborted) {
          return;
        }

        if (!response.ok) {
          throw new Error(`Error en la API de Mapbox: ${response.status}`);
        }

        const data: MapboxGeocodeResponse = await response.json();
        const processedResults = processMapboxFeatures(data.features || []);

        // Guardar en caché (máximo 50 entradas)
        if (searchCacheRef.current.size > 50) {
          const firstKey = searchCacheRef.current.keys().next().value;
          if (firstKey) {
            searchCacheRef.current.delete(firstKey);
          }
        }
        searchCacheRef.current.set(cacheKey, processedResults);

        setSearchState((prev) => ({
          ...prev,
          suggestions: processedResults,
          showSuggestions: true,
        }));

        // Si hay resultados y autoSelectPrimary es true, seleccionar el primero
        if (autoSelectPrimary && processedResults.length > 0) {
          setTimeout(() => {
            const result = processedResults[0];
            const addressData: MapboxAddressData = {
              formattedAddress: result.placeName || result.label,
              country: result.country === 'Nicaragua' ? 'NIC' : result.country,
              adminArea: result.region || null,
              city: result.city || '',
              neighborhood: result.neighborhood || '',
              street: result.street || '',
              houseNumber: '',
              postalCode: result.postalCode || '',
              referencia: '',
              lat: result.lat.toString(),
              lng: result.lng.toString(),
              provider: 'MAP BOX',
              placeId: result.id,
              accuracy:
                result.accuracy === 'point'
                  ? 'ROOFTOP'
                  : result.accuracy.toUpperCase(),
              geolocation: JSON.stringify({
                accuracy: 10,
                timestamp: Date.now(),
                coordinates: [result.lng, result.lat],
              }),
            };

            onSelect(addressData);
            onChange(result.placeName || result.label);
            setSearchState((prev) => ({
              ...prev,
              showSuggestions: false,
              suggestions: [],
            }));

            setMapState((prev) => ({
              ...prev,
              viewState: {
                ...prev.viewState,
                longitude: result.lng,
                latitude: result.lat,
                zoom: 15,
              },
              selectedLocation: { lat: result.lat, lng: result.lng },
            }));
          }, 100);
        }
      } catch (error: any) {
        // Ignorar errores de cancelación
        if (error.name === 'AbortError' || error.name === 'CanceledError') {
          return;
        }
        setSearchState((prev) => ({
          ...prev,
          suggestions: [],
        }));
      } finally {
        setSearchState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [processMapboxFeatures, onSelect, onChange]
  );

  // Autocompletado mientras escribe (como Google Maps)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si el valor está vacío o es muy corto, limpiar inmediatamente
    if (!value.trim() || value.trim().length < 3) {
      setSearchState((prev) => ({
        ...prev,
        suggestions: [],
        showSuggestions: false,
      }));
      lastSearchQueryRef.current = '';
      return;
    }

    // Autocompletado mientras escribe (como Google Maps) - debounce optimizado
    searchTimeoutRef.current = setTimeout(() => {
      searchAddresses(value, false); // No auto-seleccionar en autocompletado, solo mostrar sugerencias
    }, 400); // Debounce aumentado para reducir solicitudes

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, searchAddresses]);

  // Función para hacer reverse geocoding usando Mapbox API directamente
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!MAPBOX_TOKEN) {
        return;
      }

      // Redondear coordenadas a 4 decimales para usar como clave de caché
      const roundedLat = Math.round(lat * 10000) / 10000;
      const roundedLng = Math.round(lng * 10000) / 10000;
      const cacheKey = `${roundedLat},${roundedLng}`;

      // Evitar reverse geocoding duplicado
      if (cacheKey === lastReverseGeocodeRef.current) {
        return;
      }
      lastReverseGeocodeRef.current = cacheKey;

      // Verificar caché (coordenadas cercanas)
      for (const [
        cachedKey,
        cachedData,
      ] of reverseGeocodeCacheRef.current.entries()) {
        const [cachedLat, cachedLng] = cachedKey.split(',').map(Number);
        const distance = Math.sqrt(
          Math.pow(cachedLat - roundedLat, 2) +
            Math.pow(cachedLng - roundedLng, 2)
        );
        // Si está a menos de 0.0001 grados (~11 metros), usar caché
        if (distance < 0.0001) {
          onSelect(cachedData);
          onChange(cachedData.formattedAddress);
          setMapState((prev) => ({
            ...prev,
            selectedLocation: { lat: roundedLat, lng: roundedLng },
          }));
          return;
        }
      }

      setSearchState((prev) => ({ ...prev, isReverseGeocoding: true }));
      try {
        // Llamar directamente a la API de Mapbox Reverse Geocoding
        const url = `${MAPBOX_GEOCODING_API}/mapbox.places/${roundedLng},${roundedLat}.json?access_token=${MAPBOX_TOKEN}&language=es&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error en la API de Mapbox: ${response.status}`);
        }

        const data: MapboxGeocodeResponse = await response.json();

        const features = data.features || [];
        if (features.length > 0) {
          const feature = features[0];
          const processed = processMapboxFeatures([feature])[0];

          const addressData: MapboxAddressData = {
            formattedAddress: processed.placeName,
            country:
              processed.country === 'Nicaragua' ? 'NIC' : processed.country,
            adminArea: processed.region || null,
            city: processed.city || '',
            neighborhood: processed.neighborhood || '',
            street: processed.street || '',
            houseNumber: '',
            postalCode: processed.postalCode || '',
            referencia: '',
            lat: roundedLat.toString(),
            lng: roundedLng.toString(),
            provider: 'MAP BOX',
            placeId: processed.id,
            accuracy:
              processed.accuracy === 'point'
                ? 'ROOFTOP'
                : processed.accuracy.toUpperCase(),
            geolocation: JSON.stringify({
              accuracy: 10,
              timestamp: Date.now(),
              coordinates: [roundedLng, roundedLat],
            }),
          };

          // Guardar en caché (máximo 30 entradas)
          if (reverseGeocodeCacheRef.current.size > 30) {
            const firstKey = reverseGeocodeCacheRef.current.keys().next().value;
            if (firstKey) {
              reverseGeocodeCacheRef.current.delete(firstKey);
            }
          }
          reverseGeocodeCacheRef.current.set(cacheKey, addressData);

          onSelect(addressData);
          onChange(processed.placeName);
        }
      } catch (error) {
        // Si falla, al menos guardar las coordenadas
        const addressData: MapboxAddressData = {
          formattedAddress: `${lat}, ${lng}`,
          country: 'NIC',
          adminArea: null,
          city: '',
          neighborhood: '',
          street: '',
          houseNumber: '',
          postalCode: '',
          referencia: '',
          lat: lat.toString(),
          lng: lng.toString(),
          provider: 'MAP BOX',
          placeId: '',
          accuracy: 'ROOFTOP',
          geolocation: JSON.stringify({
            accuracy: 10,
            timestamp: Date.now(),
            coordinates: [lng, lat],
          }),
        };
        onSelect(addressData);
        onChange(`${lat}, ${lng}`);
      } finally {
        setSearchState((prev) => ({ ...prev, isReverseGeocoding: false }));
      }
    },
    [processMapboxFeatures, onSelect, onChange]
  );

  // Manejar selección de sugerencia
  const handleSelectSuggestion = useCallback(
    (result: MapboxGeocodeResult) => {
      const addressData: MapboxAddressData = {
        formattedAddress: result.placeName || result.label,
        country: result.country === 'Nicaragua' ? 'NIC' : result.country,
        adminArea: result.region || null,
        city: result.city || '',
        neighborhood: result.neighborhood || '',
        street: result.street || '',
        houseNumber: '',
        postalCode: result.postalCode || '',
        referencia: '',
        lat: result.lat.toString(),
        lng: result.lng.toString(),
        provider: 'MAP BOX',
        placeId: result.id,
        accuracy:
          result.accuracy === 'point'
            ? 'ROOFTOP'
            : result.accuracy.toUpperCase(),
        geolocation: JSON.stringify({
          accuracy: 10,
          timestamp: Date.now(),
          coordinates: [result.lng, result.lat],
        }),
      };

      onSelect(addressData);
      onChange(result.placeName || result.label);
      setSearchState((prev) => ({
        ...prev,
        showSuggestions: false,
        suggestions: [],
      }));

      // Actualizar mapa y marcador
      setMapState((prev) => ({
        ...prev,
        viewState: {
          ...prev.viewState,
          longitude: result.lng,
          latitude: result.lat,
          zoom: 15,
        },
        selectedLocation: { lat: result.lat, lng: result.lng },
      }));
    },
    [onSelect, onChange]
  );

  // Manejar clic en el mapa (con debounce para evitar múltiples solicitudes)
  const handleMapClick = useCallback(
    (event: any) => {
      const { lng, lat } = event.lngLat;

      // Actualizar ubicación visual inmediatamente
      setMapState((prev) => ({
        ...prev,
        selectedLocation: { lat, lng },
        viewState: {
          ...prev.viewState,
          longitude: lng,
          latitude: lat,
        },
      }));

      // Cancelar reverse geocoding anterior si existe
      if (reverseGeocodeTimeoutRef.current) {
        clearTimeout(reverseGeocodeTimeoutRef.current);
      }

      // Debounce del reverse geocoding (800ms) para evitar solicitudes excesivas
      reverseGeocodeTimeoutRef.current = setTimeout(() => {
        reverseGeocode(lat, lng);
      }, 800);
    },
    [reverseGeocode]
  );

  // Obtener ubicación actual del usuario
  const handleGetCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapState((prev) => ({
            ...prev,
            viewState: {
              ...prev.viewState,
              longitude,
              latitude,
              zoom: 15,
            },
            selectedLocation: { lat: latitude, lng: longitude },
          }));
          reverseGeocode(latitude, longitude);
        },
        () => {
          // Error silencioso
        }
      );
    }
  }, [reverseGeocode]);

  // Manejar teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchState.showSuggestions || searchState.suggestions.length === 0)
      return;

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
          handleSelectSuggestion(
            searchState.suggestions[searchState.selectedIndex]
          );
        } else if (searchState.suggestions.length > 0) {
          handleSelectSuggestion(searchState.suggestions[0]);
        }
        break;
      case 'Escape':
        setSearchState((prev) => ({
          ...prev,
          showSuggestions: false,
          selectedIndex: -1,
        }));
        break;
    }
  };

  // Cerrar sugerencias al hacer click fuera
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

  // Limpiar timeouts y cancelar solicitudes al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (reverseGeocodeTimeoutRef.current) {
        clearTimeout(reverseGeocodeTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Función para manejar búsqueda manual (botón "Buscar")
  const handleManualSearch = useCallback(() => {
    const trimmedValue = value.trim();

    // Si hay sugerencias visibles, seleccionar la primera
    if (searchState.showSuggestions && searchState.suggestions.length > 0) {
      handleSelectSuggestion(searchState.suggestions[0]);
      return;
    }

    // Si no hay sugerencias pero hay texto suficiente, buscar y seleccionar la primera
    if (trimmedValue.length >= 3) {
      // Limpiar la última búsqueda para forzar una nueva
      lastSearchQueryRef.current = '';
      // Pasar true para auto-seleccionar el resultado primario
      searchAddresses(trimmedValue, true);
    }
  }, [
    value,
    searchState.showSuggestions,
    searchState.suggestions,
    handleSelectSuggestion,
    searchAddresses,
  ]);

  return (
    <div className="relative w-full space-y-3">
      {/* Buscador mejorado con botón de búsqueda */}
      <div className="flex gap-2">
        <div className="relative group flex-1">
          {/* Icono de búsqueda con mejor espaciado */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="flex items-center justify-center"></div>
          </div>
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
              // Prevenir que Enter active el submit del formulario
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleManualSearch();
              } else {
                handleKeyDown(e);
              }
            }}
            placeholder={placeholder}
            className={`pl-12 pr-4 h-12 text-base ${className}`}
            autoComplete="off"
          />
          {/* Botón de limpiar */}
          {!searchState.isLoading && value && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setSearchState((prev) => ({
                  ...prev,
                  suggestions: [],
                  showSuggestions: false,
                }));
                setMapState((prev) => ({ ...prev, selectedLocation: null }));
              }}
              className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 group/clear z-10"
              title="Limpiar búsqueda"
            >
              <MdClose className="h-4 w-4 group-hover/clear:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* Botón de búsqueda */}
        <button
          type="button"
          onClick={handleManualSearch}
          disabled={
            searchState.isLoading || value.trim().length < 3 || !MAPBOX_TOKEN
          }
          className="px-5 h-12 bg-linear-to-r from-[#50C878] to-[#3aa85c] hover:from-[#50C878]/90 hover:to-[#3aa85c]/90 text-white font-semibold rounded-lg shadow-md shadow-[#50C878]/20 transition-all duration-200 hover:shadow-lg hover:shadow-[#50C878]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2 min-w-[120px]"
          title={
            searchState.showSuggestions && searchState.suggestions.length > 0
              ? 'Seleccionar primera opción'
              : 'Buscar dirección'
          }
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

      {/* Dropdown de sugerencias estilo Google Maps */}
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
                onClick={() => handleSelectSuggestion(suggestion)}
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
                      {suggestion.placeName || suggestion.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {[
                        suggestion.street,
                        suggestion.neighborhood,
                        suggestion.city,
                        suggestion.region,
                      ]
                        .filter(Boolean)
                        .join(' • ')}
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
          <MdSearch className="h-4 w-4 shrink-0" />
          <span>Escribe al menos 3 caracteres para ver sugerencias</span>
        </div>
      )}

      {/* Mapa Interactivo mejorado */}
      {showMap && (
        <div
          className="relative rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-white"
          style={{ height: mapHeight }}
        >
          {/* Overlay de carga */}
          {searchState.isReverseGeocoding && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#50C878]/20 border-t-[#50C878] rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">
                  Obteniendo dirección...
                </p>
                <p className="text-xs text-gray-500 mt-1">Por favor espera</p>
              </div>
            </div>
          )}

          {/* Estado sin token */}
          {!MAPBOX_TOKEN && !searchState.isReverseGeocoding && (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-200">
              <div className="text-center p-6 max-w-md">
                <div className="w-16 h-16 bg-linear-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <MdLocationOn className="h-8 w-8 text-amber-700" />
                </div>
                <p className="text-lg font-bold text-gray-800 mb-2">
                  🗺️ Mapa no disponible
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
                        VITE_MAPBOX_ACCESS_TOKEN=tu_token_aqui
                      </code>
                    </li>
                    <li>
                      <strong>Reinicia el servidor</strong> (detén y vuelve a
                      ejecutar{' '}
                      <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                        npm run dev
                      </code>
                      )
                    </li>
                  </ol>
                </div>
                <p className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                  💡 <strong>Nota:</strong> El buscador de direcciones funciona
                  sin el mapa. Solo necesitas el token para ver el mapa
                  interactivo.
                </p>
              </div>
            </div>
          )}

          {/* Mapa con token - Lazy loaded para mejor rendimiento */}
          {MAPBOX_TOKEN && !searchState.isReverseGeocoding && (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="w-10 h-10 border-3 border-[#50C878]/20 border-t-[#50C878] rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Cargando mapa...</p>
                  </div>
                </div>
              }
            >
              <MapComponent
                {...mapState.viewState}
                onMove={(evt) =>
                  setMapState((prev) => ({
                    ...prev,
                    viewState: evt.viewState,
                  }))
                }
                onClick={handleMapClick}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                cursor="crosshair"
                attributionControl={false}
                reuseMaps={true}
                optimizeForTerrain={false}
              >
                {mapState.selectedLocation && (
                  <Suspense fallback={null}>
                    <Marker
                      longitude={mapState.selectedLocation.lng}
                      latitude={mapState.selectedLocation.lat}
                      anchor="bottom"
                    >
                      <div className="relative">
                        {/* Marcador principal */}
                        <div className="relative">
                          <div className="w-10 h-10 bg-linear-to-br from-[#50C878] to-[#3aa85c] rounded-full border-[3px] border-white shadow-xl flex items-center justify-center">
                            <MdLocationOn className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        {/* Sombra del marcador */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-black/20 rounded-full blur-sm" />
                      </div>
                    </Marker>
                  </Suspense>
                )}
              </MapComponent>

              {/* Botón para obtener ubicación actual */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg p-2.5 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 group"
                title="Usar mi ubicación actual"
              >
                <MdMyLocation className="h-5 w-5 text-gray-600 group-hover:text-[#50C878] transition-colors" />
              </button>

              {/* Indicador de instrucciones */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-2 shadow-lg">
                <p className="text-xs font-medium text-gray-700 flex items-center gap-2">
                  <MdLocationOn className="h-4 w-4 text-[#50C878]" />
                  <span>
                    Haz clic en el mapa para seleccionar una ubicación
                  </span>
                </p>
              </div>
            </Suspense>
          )}
        </div>
      )}

      {/* Información adicional */}
      {showMap &&
        mapState.selectedLocation &&
        !searchState.isReverseGeocoding && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <MdLocationOn className="h-4 w-4 text-[#50C878]" />
            <span>
              Ubicación seleccionada:{' '}
              <span className="font-semibold text-gray-700">
                {value || 'Coordenadas'}
              </span>
            </span>
          </div>
        )}
    </div>
  );
}
