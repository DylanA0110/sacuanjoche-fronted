import { useEffect, useRef, useState } from 'react';
import mapboxgl, { LngLatBounds, Marker } from 'mapbox-gl';
import type { LngLatLike } from 'mapbox-gl';
import polyline from '@mapbox/polyline';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { RutaPedido } from '../types/ruta.interface';
import { MdErrorOutline, MdRefresh } from 'react-icons/md';

// Configurar el token de Mapbox
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Función para verificar soporte WebGL (más permisiva)
const checkWebGLSupport = (): { supported: boolean; error?: string; canRetry?: boolean } => {
  try {
    // Verificar si estamos en un navegador moderno
    const isModernBrowser = 
      typeof window !== 'undefined' && 
      (navigator.userAgent.includes('Chrome') || 
       navigator.userAgent.includes('Firefox') || 
       navigator.userAgent.includes('Safari') || 
       navigator.userAgent.includes('Edge'));
    
    if (!isModernBrowser) {
      return {
        supported: false,
        error: 'Tu navegador puede no ser compatible. Por favor, usa Chrome, Firefox, Edge o Safari.',
        canRetry: true,
      };
    }

    // Intentar crear contexto WebGL
    const canvas = document.createElement('canvas');
    let gl: WebGLRenderingContext | null = null;
    
    // Intentar diferentes métodos para obtener WebGL
    try {
      gl = canvas.getContext('webgl2') as WebGLRenderingContext | null;
    } catch (e) {
      // Ignorar
    }
    
    if (!gl) {
      try {
        gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      } catch (e) {
        // Ignorar
      }
    }
    
    if (!gl) {
      try {
        gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      } catch (e) {
        // Ignorar
      }
    }
    
    // Si no se pudo obtener WebGL, pero es un navegador moderno, permitir intentar de todas formas
    // (puede ser un problema temporal o de configuración)
    if (!gl) {
      console.warn('[RouteMap] No se pudo obtener contexto WebGL, pero se intentará inicializar el mapa de todas formas');
      return {
        supported: true, // Permitir intentar de todas formas en navegadores modernos
        canRetry: true,
      };
    }
    
    // Verificar que WebGL esté funcionando correctamente
    try {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        console.log('[RouteMap] WebGL Info:', { vendor, renderer });
      }
    } catch (e) {
      // No es crítico si no se puede obtener info de debug
      console.log('[RouteMap] WebGL disponible pero sin info de debug');
    }
    
    return { supported: true };
  } catch (error) {
    // En caso de error, permitir intentar de todas formas si es un navegador moderno
    console.warn('[RouteMap] Error al verificar WebGL, pero se intentará de todas formas:', error);
    return {
      supported: true, // Permitir intentar
      canRetry: true,
    };
  }
};

type RouteMapProps = {
  geometry: string | null;
  origenLat: number;
  origenLng: number;
  rutaPedidos: RutaPedido[];
};

const ROUTE_SOURCE_ID = 'route-line';
const ROUTE_LAYER_ID = 'route-layer';

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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);

  // Verificar WebGL al montar el componente
  useEffect(() => {
    const webglCheck = checkWebGLSupport();
    setWebglSupported(webglCheck.supported);
    // Solo mostrar error si definitivamente no está soportado y no se puede reintentar
    if (!webglCheck.supported && !webglCheck.canRetry) {
      setMapError(webglCheck.error || 'WebGL no está disponible');
    }
  }, []);

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!MAPBOX_TOKEN) {
      setMapError('Falta configurar VITE_MAPBOX_TOKEN. Por favor, configura el token de Mapbox en las variables de entorno.');
      return;
    }

    // Si WebGL no está soportado pero es un navegador moderno, intentar de todas formas
    // (puede ser un problema temporal o de configuración que se resuelva al inicializar)
    if (webglSupported === false) {
      // En navegadores modernos, intentar de todas formas después de un pequeño delay
      const timeout = setTimeout(() => {
        if (!mapRef.current && mapContainerRef.current) {
          console.log('[RouteMap] Intentando inicializar mapa a pesar de verificación WebGL fallida...');
          initializeMap();
        }
      }, 500);
      return () => clearTimeout(timeout);
    }

    if (webglSupported === null) {
      return; // Esperar a que se verifique WebGL
    }

    if (mapRef.current) return;

    // Verificar que el contenedor tenga dimensiones
    const container = mapContainerRef.current;
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      // Esperar a que el contenedor tenga dimensiones
      const resizeObserver = new ResizeObserver(() => {
        if (container.offsetWidth > 0 && container.offsetHeight > 0 && !mapRef.current) {
          initializeMap();
          resizeObserver.disconnect();
        }
      });
      resizeObserver.observe(container);
      return () => resizeObserver.disconnect();
    }

    initializeMap();

    function initializeMap() {
      if (!mapContainerRef.current || mapRef.current) return;

      try {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [origenLng, origenLat],
          zoom: 12,
          antialias: true,
          failIfMajorPerformanceCaveat: false, // Permitir mapa incluso con rendimiento limitado
        });

        mapRef.current = map;

        // Manejar errores del mapa
        map.on('error', (event) => {
          const error = (event as { error?: Error }).error;
          if (error) {
            console.error('[RouteMap] Error de Mapbox:', error);
            const errorMessage = error.message || String(error);
            
            // Mensajes más específicos según el tipo de error
            let userMessage = 'Error al cargar el mapa';
            if (errorMessage.includes('WebGL') || errorMessage.includes('webgl')) {
              userMessage = 'Error al inicializar WebGL. Esto puede deberse a: aceleración por hardware deshabilitada, drivers de gráficos desactualizados, o restricciones del navegador.';
            } else if (errorMessage.includes('token') || errorMessage.includes('Token')) {
              userMessage = 'Error con el token de Mapbox. Verifica la configuración.';
            } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
              userMessage = 'Error de red al cargar el mapa. Verifica tu conexión a internet.';
            } else {
              userMessage = `Error del mapa: ${errorMessage}`;
            }
            
            setMapError(userMessage);
          }
        });

        map.on('load', () => {
          try {
            map.addControl(
              new mapboxgl.NavigationControl({ visualizePitch: true }),
              'top-right'
            );
            setMapLoaded(true);
            setMapError(null);
          } catch (error) {
            console.error('[RouteMap] Error al agregar controles:', error);
            setMapError('Error al cargar controles del mapa');
          }
        });

        // Manejar errores de estilo
        map.on('style.loading', () => {
          setMapError(null);
        });

        map.on('style.error', () => {
          setMapError('Error al cargar el estilo del mapa');
        });

      } catch (error) {
        console.error('[RouteMap] Error al inicializar el mapa:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Intentar obtener más información del error
        let userMessage = 'Error al inicializar el mapa';
        if (errorMessage.includes('WebGL') || errorMessage.includes('webgl') || errorMessage.includes('Failed to initialize WebGL')) {
          userMessage = 'Error al inicializar WebGL. Esto puede deberse a: aceleración por hardware deshabilitada, drivers de gráficos desactualizados, o restricciones del navegador. Intenta recargar la página o reiniciar el navegador.';
        } else {
          userMessage = `Error al inicializar el mapa: ${errorMessage}`;
        }
        
        setMapError(userMessage);
        
        // En Chrome y otros navegadores modernos, intentar una vez más después de un delay
        if (navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')) {
          console.log('[RouteMap] Reintentando inicialización después de error...');
          setTimeout(() => {
            if (!mapRef.current && mapContainerRef.current) {
              try {
                initializeMap();
              } catch (retryError) {
                console.error('[RouteMap] Error en reintento:', retryError);
              }
            }
          }, 1000);
        }
      }
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (error) {
          console.error('[RouteMap] Error al remover el mapa:', error);
        }
        mapRef.current = null;
      }
      markersRef.current.forEach((marker) => {
        try {
          marker.remove();
        } catch (error) {
          console.error('[RouteMap] Error al remover marcador:', error);
        }
      });
      markersRef.current = [];
      setMapLoaded(false);
    };
  }, [origenLat, origenLng, webglSupported]);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current;

    // Log de depuración
    console.log('[RouteMap] Renderizando mapa con:', {
      totalPedidos: rutaPedidos?.length || 0,
      tieneGeometry: !!geometry,
      origenLat,
      origenLng,
      pedidos: rutaPedidos?.map(p => ({
        id: p.idPedido,
        secuencia: p.secuencia,
        lat: p.lat,
        lng: p.lng,
        latType: typeof p.lat,
        lngType: typeof p.lng,
      })) || []
    });

    let decodedRoute: Array<[number, number]> = [];
    if (geometry) {
      try {
        decodedRoute = (
          polyline
            .decode(geometry, 6) as Array<[number, number]>
        ).map(([lat, lng]: [number, number]) => [lng, lat] as [number, number]);
        if (!decodedRoute.length) {
          console.warn('Ruta decodificada sin coordenadas', geometry);
        }
      } catch (error) {
        console.error(
          'No se pudo decodificar la geometría recibida',
          error,
          geometry
        );
      }
    }

    // Preparar puntos para bounds: incluir origen y todos los pedidos válidos
    const pedidosParaBounds = rutaPedidos
      .map((pedido) => {
        const lat = typeof pedido.lat === 'number' ? pedido.lat : parseFloat(String(pedido.lat));
        const lng = typeof pedido.lng === 'number' ? pedido.lng : parseFloat(String(pedido.lng));
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return [lng, lat] as [number, number];
        }
        return null;
      })
      .filter((coord): coord is [number, number] => coord !== null);

    const pointsForBounds = decodedRoute.length
      ? decodedRoute
      : [
          [origenLng, origenLat],
          ...pedidosParaBounds,
        ];

    // Agregar la ruta principal completa (línea base gris)
    if (decodedRoute.length) {
      const source = map.getSource(ROUTE_SOURCE_ID) as
        | mapboxgl.GeoJSONSource
        | undefined;
      const data = {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: decodedRoute,
        },
        properties: {},
      };

      if (source) {
        source.setData(data);
      } else if (map.isStyleLoaded()) {
        map.addSource(ROUTE_SOURCE_ID, {
          type: 'geojson',
          data,
        });

        // Capa base de la ruta completa (gris, más delgada)
        map.addLayer({
          id: ROUTE_LAYER_ID,
          type: 'line',
          source: ROUTE_SOURCE_ID,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#9ca3af',
            'line-width': 3,
            'line-opacity': 0.4,
          },
        });
      } else {
        map.once('styledata', () => {
          const lateSource = map.getSource(ROUTE_SOURCE_ID) as
            | mapboxgl.GeoJSONSource
            | undefined;
          if (lateSource) {
            lateSource.setData(data);
          }
        });
      }
    }

    // Agregar segmentos de ruta coloreados entre pedidos consecutivos
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

    // Limpiar segmentos anteriores (limpiar hasta 20 segmentos para asegurar limpieza completa)
    if (map.isStyleLoaded()) {
      for (let i = 0; i < 20; i++) {
        const segmentLayerId = `route-segment-layer-${i}`;
        const segmentSourceId = `route-segment-${i}`;
        if (map.getLayer(segmentLayerId)) {
          map.removeLayer(segmentLayerId);
        }
        if (map.getSource(segmentSourceId)) {
          map.removeSource(segmentSourceId);
        }
      }
    }

    // Crear segmentos entre pedidos consecutivos
    if (map.isStyleLoaded() && pedidosValidosParaSegmentos.length > 0) {
      // Segmento desde origen hasta el primer pedido
      const primerPedido = pedidosValidosParaSegmentos[0];
      const segment0SourceId = 'route-segment-0';
      const segment0LayerId = 'route-segment-layer-0';
      const segment0Color = ROUTE_SEGMENT_COLORS[0 % ROUTE_SEGMENT_COLORS.length];
      
      const segment0Data = {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [origenLng, origenLat],
            [primerPedido.lng, primerPedido.lat],
          ],
        },
        properties: { segmentIndex: 0 },
      };

      if (!map.getSource(segment0SourceId)) {
        map.addSource(segment0SourceId, {
          type: 'geojson',
          data: segment0Data,
        });

        map.addLayer({
          id: segment0LayerId,
          type: 'line',
          source: segment0SourceId,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': segment0Color,
            'line-width': 6,
            'line-opacity': 0.9,
          },
        });
      } else {
        (map.getSource(segment0SourceId) as mapboxgl.GeoJSONSource).setData(segment0Data);
      }

      // Segmentos entre pedidos consecutivos
      for (let i = 0; i < pedidosValidosParaSegmentos.length - 1; i++) {
        const pedidoActual = pedidosValidosParaSegmentos[i];
        const pedidoSiguiente = pedidosValidosParaSegmentos[i + 1];
        const segmentIndex = i + 1;
        const segmentSourceId = `route-segment-${segmentIndex}`;
        const segmentLayerId = `route-segment-layer-${segmentIndex}`;
        const segmentColor = ROUTE_SEGMENT_COLORS[segmentIndex % ROUTE_SEGMENT_COLORS.length];

        const segmentData = {
          type: 'Feature' as const,
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [pedidoActual.lng, pedidoActual.lat],
              [pedidoSiguiente.lng, pedidoSiguiente.lat],
            ],
          },
          properties: { segmentIndex },
        };

        if (!map.getSource(segmentSourceId)) {
          map.addSource(segmentSourceId, {
            type: 'geojson',
            data: segmentData,
          });

          map.addLayer({
            id: segmentLayerId,
            type: 'line',
            source: segmentSourceId,
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
            },
            paint: {
              'line-color': segmentColor,
              'line-width': 6,
              'line-opacity': 0.9,
            },
          });
        } else {
          (map.getSource(segmentSourceId) as mapboxgl.GeoJSONSource).setData(segmentData);
        }
      }
    }

    if (pointsForBounds.length) {
      const [firstPoint] = pointsForBounds;
      const bounds = pointsForBounds.reduce(
        (acc, coord) => acc.extend(coord as LngLatLike),
        new LngLatBounds(firstPoint as LngLatLike, firstPoint as LngLatLike)
      );
      map.fitBounds(bounds, { padding: 40, duration: 500 });
    } else {
      map.setCenter([origenLng, origenLat]);
      map.setZoom(13);
    }

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Marcador de origen (verde)
    const originMarker = new Marker({ color: '#16a34a' })
      .setLngLat([origenLng, origenLat])
      .setPopup(new mapboxgl.Popup().setText('Origen'))
      .addTo(map);
    markersRef.current.push(originMarker);

    // Marcadores de pedidos (rojos, numerados según secuencia de Mapbox)
    // Los pedidos ya vienen ordenados por secuencia desde el backend (optimización de Mapbox)
    // Usar los mismos pedidos validados que se usaron para los segmentos
    pedidosValidosParaSegmentos.forEach((pedido) => {
      // Crear elemento HTML personalizado con número de secuencia
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        background-color: #ef4444;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
      `;
      el.textContent = String(pedido.secuencia);
      el.setAttribute('aria-label', `Parada ${pedido.secuencia}: Pedido ${pedido.idPedido}`);
      
      const marker = new Marker({ element: el })
        .setLngLat([pedido.lng, pedido.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setHTML(
            `<div style="min-width: 200px;">
              <strong>Parada #${pedido.secuencia} · Pedido ${pedido.idPedido}</strong><br/>
              <span style="font-size: 12px; color: #666;">${pedido.direccionResumen || 'Sin dirección'}</span>
            </div>`
          )
        )
        .addTo(map);
      markersRef.current.push(marker);
    });

    map.resize();
    window.setTimeout(() => map.resize(), 50);
  }, [geometry, mapLoaded, origenLat, origenLng, rutaPedidos]);

  // Mostrar error si hay algún problema
  if (mapError || webglSupported === false) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden relative bg-gray-50 border-2 border-dashed border-red-200 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdErrorOutline className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar el mapa
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {mapError || 'El mapa no se pudo cargar debido a un problema con WebGL.'}
          </p>
          <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 text-left">
            <p className="text-xs font-semibold text-gray-700 mb-2">Posibles soluciones:</p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Actualiza tu navegador a la última versión</li>
              <li>Habilita la aceleración por hardware en la configuración de tu navegador</li>
              <li>Verifica que tu tarjeta gráfica tenga los drivers actualizados</li>
              <li>Intenta en otro navegador (Chrome, Firefox, Edge)</li>
            </ul>
          </div>
          <button
            onClick={() => {
              setMapError(null);
              setWebglSupported(null);
              if (mapRef.current) {
                try {
                  mapRef.current.remove();
                } catch (e) {
                  // Ignorar errores al limpiar
                }
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
    );
  }

  // Mostrar estado de carga mientras se verifica WebGL
  if (webglSupported === null) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden relative bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-600">Inicializando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="route-map-container w-full h-full min-h-[500px] rounded-lg overflow-hidden relative"
    />
  );
}

