import { useEffect, useRef, useState } from 'react';
import polyline from '@mapbox/polyline';
import type { RutaPedido } from '../types/ruta.interface';
import { MdErrorOutline, MdRefresh } from 'react-icons/md';
import {
  GOOGLE_MAPS_API_KEY,
  loadGoogleMapsApi,
} from '@/shared/lib/googleMapsLoader';

type RouteMapProps = {
  geometry: string | null;
  origenLat: number;
  origenLng: number;
  rutaPedidos: RutaPedido[];
};

// Paleta de colores para segmentos de ruta entre pedidos
const ROUTE_SEGMENT_COLORS = [
  '#ef4444', // rojo
  '#f59e0b', // naranja
  '#10b981', // verde
  '#3b82f6', // azul
  '#8b5cf6', // púrpura
  '#ec4899', // rosa
  '#06b6d4', // cian
  '#f97316', // naranja oscuro
  '#84cc16', // verde lima
  '#6366f1', // índigo
];

export function RouteMap({
  geometry,
  origenLat,
  origenLng,
  rutaPedidos,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const decodeRouteGeometry = (
    encodedGeometry: string,
    fallbackCenter: { lat: number; lng: number }
  ): Array<{ lat: number; lng: number }> => {
    const decodeWithPrecision = (precision: number) => {
      try {
        return (polyline.decode(encodedGeometry, precision) as Array<[number, number]>).map(
          ([lat, lng]) => ({ lat, lng })
        );
      } catch {
        return [];
      }
    };

    const route5 = decodeWithPrecision(5);
    const route6 = decodeWithPrecision(6);

    if (!route5.length && !route6.length) {
      return [];
    }
    if (route5.length && !route6.length) {
      return route5;
    }
    if (route6.length && !route5.length) {
      return route6;
    }

    const distanceToCenter = (point: { lat: number; lng: number }) =>
      Math.abs(point.lat - fallbackCenter.lat) + Math.abs(point.lng - fallbackCenter.lng);

    const first5 = route5[0];
    const first6 = route6[0];
    if (!first5 || !first6) {
      return route5.length ? route5 : route6;
    }

    return distanceToCenter(first5) <= distanceToCenter(first6) ? route5 : route6;
  };

  useEffect(() => {
    if (!mapContainerRef.current) {
      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError(
        'Falta configurar VITE_GOOGLE_MAPS_API_KEY en .env para mostrar el mapa de rutas.'
      );
      return;
    }

    let mounted = true;

    const initMap = async () => {
      try {
        await loadGoogleMapsApi();
        if (!mounted || !mapContainerRef.current || mapRef.current) {
          return;
        }

        const gmaps = (window as any).google?.maps;
        if (!gmaps || typeof gmaps.Map !== 'function') {
          throw new Error('Google Maps no se inicializo correctamente.');
        }

        const map = new gmaps.Map(mapContainerRef.current, {
          center: { lat: origenLat, lng: origenLng },
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        mapRef.current = map;
        infoWindowRef.current = new gmaps.InfoWindow();
        setMapLoaded(true);
        setMapError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo inicializar Google Maps.';
        setMapError(message);
      }
    };

    void initMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        polylinesRef.current.forEach((line) => line.setMap(null));
        polylinesRef.current = [];

        mapRef.current = null;
      }
    };
  }, [origenLat, origenLng]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;
    const gmaps = (window as any).google?.maps;
    if (
      !gmaps ||
      typeof gmaps.Marker !== 'function' ||
      typeof gmaps.Polyline !== 'function' ||
      typeof gmaps.LatLngBounds !== 'function'
    ) {
      setMapError(
        'Google Maps no termino de cargar correctamente. Intenta recargar la pagina.'
      );
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    polylinesRef.current.forEach((line) => line.setMap(null));
    polylinesRef.current = [];

    let decodedRoute: Array<{ lat: number; lng: number }> = [];
    if (geometry) {
      decodedRoute = decodeRouteGeometry(geometry, {
        lat: origenLat,
        lng: origenLng,
      });
    }

    const pedidosParaBounds = rutaPedidos
      .map((pedido) => {
        const lat = typeof pedido.lat === 'number' ? pedido.lat : parseFloat(String(pedido.lat));
        const lng = typeof pedido.lng === 'number' ? pedido.lng : parseFloat(String(pedido.lng));
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { lat, lng };
        }
        return null;
      })
      .filter((coord): coord is { lat: number; lng: number } => coord !== null);

    const pointsForBounds = [
      { lat: origenLat, lng: origenLng },
      ...pedidosParaBounds,
      ...decodedRoute,
    ];

    if (decodedRoute.length) {
      const fullLine = new gmaps.Polyline({
        path: decodedRoute,
        geodesic: true,
        strokeColor: '#9ca3af',
        strokeOpacity: 0.4,
        strokeWeight: 3,
        map,
      });
      polylinesRef.current.push(fullLine);
    }

    const pedidosValidosParaSegmentos = rutaPedidos
      .map((pedido) => {
        const lat = typeof pedido.lat === 'number' ? pedido.lat : parseFloat(String(pedido.lat));
        const lng = typeof pedido.lng === 'number' ? pedido.lng : parseFloat(String(pedido.lng));

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { ...pedido, lat, lng };
        }
        return null;
      })
      .filter((pedido): pedido is RutaPedido & { lat: number; lng: number } => pedido !== null)
      .sort((a, b) => a.secuencia - b.secuencia);

    if (pedidosValidosParaSegmentos.length > 0) {
      const primerPedido = pedidosValidosParaSegmentos[0];
      const firstSegment = new gmaps.Polyline({
        path: [
          { lat: origenLat, lng: origenLng },
          { lat: primerPedido.lat, lng: primerPedido.lng },
        ],
        geodesic: true,
        strokeColor: ROUTE_SEGMENT_COLORS[0],
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map,
      });
      polylinesRef.current.push(firstSegment);

      for (let i = 0; i < pedidosValidosParaSegmentos.length - 1; i++) {
        const pedidoActual = pedidosValidosParaSegmentos[i];
        const pedidoSiguiente = pedidosValidosParaSegmentos[i + 1];
        const segmentIndex = i + 1;

        const segmentLine = new gmaps.Polyline({
          path: [
            { lat: pedidoActual.lat, lng: pedidoActual.lng },
            { lat: pedidoSiguiente.lat, lng: pedidoSiguiente.lng },
          ],
          geodesic: true,
          strokeColor:
            ROUTE_SEGMENT_COLORS[segmentIndex % ROUTE_SEGMENT_COLORS.length],
          strokeOpacity: 0.9,
          strokeWeight: 6,
          map,
        });
        polylinesRef.current.push(segmentLine);
      }
    }

    if (pointsForBounds.length) {
      const bounds = new gmaps.LatLngBounds();
      pointsForBounds.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, 40);
    } else {
      map.setCenter({ lat: origenLat, lng: origenLng });
      map.setZoom(13);
    }

    const originMarker = new gmaps.Marker({
      map,
      position: { lat: origenLat, lng: origenLng },
      title: 'Origen',
      icon: {
        path: gmaps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#16a34a',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    originMarker.addListener('click', () => {
      if (!infoWindowRef.current) {
        return;
      }
      infoWindowRef.current.setContent('<strong>Origen</strong>');
      infoWindowRef.current.open({ anchor: originMarker, map });
    });

    markersRef.current.push(originMarker);

    pedidosValidosParaSegmentos.forEach((pedido) => {
      const marker = new gmaps.Marker({
        map,
        position: { lat: pedido.lat, lng: pedido.lng },
        title: `Parada ${pedido.secuencia}: Pedido ${pedido.idPedido}`,
        label: {
          text: String(pedido.secuencia),
          color: '#ffffff',
          fontWeight: '700',
        },
        icon: {
          path: gmaps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      marker.addListener('click', () => {
        if (!infoWindowRef.current) {
          return;
        }

        infoWindowRef.current.setContent(
          `<div style="min-width: 200px;">
             <strong>Parada #${pedido.secuencia} · Pedido ${pedido.idPedido}</strong><br/>
             <span style="font-size: 12px; color: #666;">${pedido.direccionResumen || 'Sin direccion'}</span>
           </div>`
        );
        infoWindowRef.current.open({ anchor: marker, map });
      });

      markersRef.current.push(marker);
    });
  }, [geometry, mapLoaded, origenLat, origenLng, rutaPedidos]);

  return (
    <div className="route-map-container w-full h-full min-h-[500px] rounded-lg overflow-hidden relative bg-gray-50">
      <div ref={mapContainerRef} className="absolute inset-0" />

      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-600">Inicializando mapa...</p>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-30 border-2 border-dashed border-red-200 bg-gray-50/95 flex items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdErrorOutline className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el mapa
            </h3>
            <p className="text-sm text-gray-600 mb-4">{mapError}</p>
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 text-left">
              <p className="text-xs font-semibold text-gray-700 mb-2">Posibles soluciones:</p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Verifica que `VITE_GOOGLE_MAPS_API_KEY` este configurada en `.env`</li>
                <li>Confirma que la API key tenga habilitada Maps JavaScript API</li>
                <li>Reinicia `npm run dev` despues de cambiar variables de entorno</li>
              </ul>
            </div>
            <button
              onClick={() => {
                setMapError(null);
                setMapLoaded(false);
                if (mapRef.current) {
                  markersRef.current.forEach((marker) => marker.setMap(null));
                  polylinesRef.current.forEach((line) => line.setMap(null));
                  mapRef.current = null;
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#50C878] hover:bg-[#45b86a] text-white rounded-lg text-sm font-medium transition-colors mx-auto"
            >
              <MdRefresh className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

