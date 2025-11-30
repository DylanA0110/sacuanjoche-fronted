import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRutasConductor, getRutaById } from '../actions/getRutasConductor';
import { getEnviosConductor } from '../actions/getEnviosConductor';
import { RouteMap } from '../components/RouteMap';
import { PedidoCard } from '../components/PedidoCard';
import { EnvioCard } from '../components/EnvioCard';
import { PedidoDetailsModal } from '@/pedido/components/PedidoDetailsModal';
import { Input } from '@/shared/components/ui/input';
import type { RutaConductor } from '../types/ruta.interface';
import type { EnvioConductor } from '../types/envio.interface';
import { 
  MdLocalShipping, 
  MdAccessTime, 
  MdStraighten, 
  MdLocationOn,
  MdRefresh,
  MdExpandMore,
  MdExpandLess,
  MdInfo,
  MdSort,
  MdInventory
} from 'react-icons/md';
import { format } from 'date-fns';

type TabType = 'rutas' | 'envios';

export default function RutasConductorPage() {
  const [activeTab, setActiveTab] = useState<TabType>('rutas');
  const [selectedRutaId, setSelectedRutaId] = useState<number | null>(null);
  const [expandedRutas, setExpandedRutas] = useState<Set<number>>(new Set());
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [isPedidoModalOpen, setIsPedidoModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Por defecto: más recientes primero

  // Obtener todas las rutas del conductor
  // El backend filtra automáticamente por el conductor del token JWT
  const {
    data: rutas = [],
    isLoading: isLoadingRutas,
    isError: isErrorRutas,
    error: errorRutas,
    refetch: refetchRutas,
  } = useQuery<RutaConductor[]>({
    queryKey: ['rutas-conductor'],
    queryFn: () => getRutasConductor(), // Sin parámetros: backend filtra por conductor autenticado
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
  });

  // Obtener todos los envíos del conductor
  const {
    data: envios = [],
    isLoading: isLoadingEnvios,
    isError: isErrorEnvios,
    error: errorEnvios,
    refetch: refetchEnvios,
  } = useQuery<EnvioConductor[]>({
    queryKey: ['envios-conductor', searchQuery],
    queryFn: () => getEnviosConductor({ 
      limit: 100, 
      q: searchQuery.trim() || undefined 
    }),
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
    enabled: activeTab === 'envios', // Solo cargar cuando el tab está activo
  });

  // Efecto para seleccionar automáticamente la primera ruta cuando se cargan las rutas
  useEffect(() => {
    if (activeTab === 'rutas' && rutas.length > 0 && selectedRutaId === null) {
      setSelectedRutaId(rutas[0].idRuta);
    }
  }, [rutas, selectedRutaId, activeTab]);

  const handleViewPedidoDetails = useCallback((idPedido: number) => {
    setSelectedPedidoId(idPedido);
    setIsPedidoModalOpen(true);
  }, []);

  // Filtrar y ordenar rutas (memoizado para mejor rendimiento)
  const rutasFiltradasYOrdenadas = useMemo(() => {
    let filtered = [...rutas];

    // Filtrar por búsqueda (solo si estamos en tab de rutas)
    if (activeTab === 'rutas' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((ruta) => {
        const nombre = (ruta.nombre || '').toLowerCase();
        const estado = (ruta.estado || '').toLowerCase();
        const idRuta = String(ruta.idRuta);
        const pedidosCount = String(ruta.rutaPedidos?.length || 0);
        
        return (
          nombre.includes(query) ||
          estado.includes(query) ||
          idRuta.includes(query) ||
          pedidosCount.includes(query)
        );
      });
    }

    // Ordenar por fecha programada (más recientes primero por defecto)
    filtered.sort((a, b) => {
      const fechaA = a.fechaProgramada ? new Date(a.fechaProgramada).getTime() : 0;
      const fechaB = b.fechaProgramada ? new Date(b.fechaProgramada).getTime() : 0;
      
      // Si no tienen fecha, usar fecha de creación
      const fechaCreacionA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
      const fechaCreacionB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
      
      const finalA = fechaA || fechaCreacionA;
      const finalB = fechaB || fechaCreacionB;
      
      return sortOrder === 'desc' ? finalB - finalA : finalA - finalB;
    });

    return filtered;
  }, [rutas, searchQuery, sortOrder, activeTab]);

  // Filtrar y ordenar envíos (memoizado para mejor rendimiento)
  // Solo mostrar envíos que tienen ruta asignada
  const enviosFiltradosYOrdenados = useMemo(() => {
    // Filtrar solo envíos con ruta asignada (idRuta o ruta no nulos)
    let filtered = envios.filter((envio) => {
      return envio.idRuta !== null && envio.idRuta !== undefined;
    });

    // Ordenar por fecha programada (más recientes primero por defecto)
    filtered.sort((a, b) => {
      const fechaA = a.fechaProgramada ? new Date(a.fechaProgramada).getTime() : 0;
      const fechaB = b.fechaProgramada ? new Date(b.fechaProgramada).getTime() : 0;
      
      return sortOrder === 'desc' ? fechaB - fechaA : fechaA - fechaB;
    });

    return filtered;
  }, [envios, sortOrder]);

  // Obtener detalle de la ruta seleccionada
  const {
    data: rutaDetalle,
  } = useQuery<RutaConductor>({
    queryKey: ['ruta-detalle', selectedRutaId],
    queryFn: () => getRutaById(selectedRutaId!),
    enabled: selectedRutaId !== null,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // Memoizar la ruta para el mapa (usa rutaDetalle si está disponible, sino la ruta seleccionada de la lista)
  const rutaParaMapa = useMemo(() => {
    if (rutaDetalle) return rutaDetalle;
    if (selectedRutaId) {
      return rutas.find(r => r.idRuta === selectedRutaId) || null;
    }
    return null;
  }, [rutaDetalle, selectedRutaId, rutas]);

  // Memoizar pedidos ordenados por secuencia (orden optimizado de Mapbox)
  const pedidosOrdenados = useMemo(() => {
    if (!rutaParaMapa?.rutaPedidos) return [];
    return [...rutaParaMapa.rutaPedidos].sort((a, b) => a.secuencia - b.secuencia);
  }, [rutaParaMapa?.rutaPedidos]);

  const toggleExpandRuta = useCallback((idRuta: number) => {
    setExpandedRutas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idRuta)) {
        newSet.delete(idRuta);
      } else {
        newSet.add(idRuta);
      }
      return newSet;
    });
  }, []);

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'No programada';
    try {
      return format(new Date(dateString), "PPpp");
    } catch {
      return dateString;
    }
  };

  const formatDistance = (km?: number | string | null): string => {
    if (km == null) return 'N/A';
    const num = typeof km === 'string' ? parseFloat(km) : km;
    if (!Number.isFinite(num)) return 'N/A';
    return `${num.toFixed(2)} km`;
  };

  const formatDuration = (min?: number | string | null): string => {
    if (min == null) return 'N/A';
    const num = typeof min === 'string' ? parseFloat(min) : min;
    if (!Number.isFinite(num)) return 'N/A';
    const hours = Math.floor(num / 60);
    const minutes = Math.floor(num % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { color: string; label: string }> = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pendiente' },
      en_proceso: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'En Proceso' },
      en_camino: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'En Camino' },
      completada: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Completada' },
      cancelada: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Cancelada' },
    };
    const estadoLower = estado.toLowerCase();
    const estadoInfo = estados[estadoLower] || { color: 'bg-gray-100 text-gray-800 border-gray-300', label: estado };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${estadoInfo.color}`}>
        {estadoInfo.label}
      </span>
    );
  };

  const isLoading = activeTab === 'rutas' ? isLoadingRutas : isLoadingEnvios;
  const isError = activeTab === 'rutas' ? isErrorRutas : isErrorEnvios;
  const error = activeTab === 'rutas' ? errorRutas : errorEnvios;
  const refetch = activeTab === 'rutas' ? refetchRutas : refetchEnvios;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">
            {activeTab === 'rutas' ? 'Cargando rutas...' : 'Cargando envíos...'}
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : `No se pudieron cargar los ${activeTab === 'rutas' ? 'rutas' : 'envíos'} asignados`;
    const isPermissionError = errorMessage.includes('permiso') || errorMessage.includes('No tiene');
    const isNotFoundError = errorMessage.includes('no encontrado') || errorMessage.includes('no existe');
    
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className={`border-l-4 rounded-lg p-6 max-w-md w-full ${
          isPermissionError 
            ? 'bg-amber-50 border-amber-500' 
            : isNotFoundError
            ? 'bg-blue-50 border-blue-500'
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <MdInfo className={`w-5 h-5 ${
              isPermissionError 
                ? 'text-amber-500' 
                : isNotFoundError
                ? 'text-blue-500'
                : 'text-red-500'
            }`} />
            <h3 className={`font-semibold ${
              isPermissionError 
                ? 'text-amber-800' 
                : isNotFoundError
                ? 'text-blue-800'
                : 'text-red-800'
            }`}>
              {isPermissionError 
                ? 'Sin permisos' 
                : isNotFoundError
                ? 'No encontrado'
                : 'Error al cargar rutas'}
            </h3>
          </div>
          <p className={`text-sm mb-4 ${
            isPermissionError 
              ? 'text-amber-700' 
              : isNotFoundError
              ? 'text-blue-700'
              : 'text-red-700'
          }`}>
            {errorMessage}
          </p>
          <button
            onClick={() => refetch()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white ${
              isPermissionError 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : isNotFoundError
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            <MdRefresh className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Rutas y Envíos</h1>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab === 'rutas' 
              ? `${rutasFiltradasYOrdenadas.length} de ${rutas.length} ${rutas.length === 1 ? 'ruta' : 'rutas'}`
              : `${enviosFiltradosYOrdenados.length} ${enviosFiltradosYOrdenados.length === 1 ? 'envío' : 'envíos'}`
            }
            {searchQuery && activeTab === 'rutas' && ` (filtradas)`}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-sm font-medium text-gray-700 self-start sm:self-auto"
        >
          <MdRefresh className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('rutas');
            setSearchQuery('');
          }}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'rutas'
              ? 'border-[#50C878] text-[#50C878] bg-[#50C878]/5'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <MdLocalShipping className="w-5 h-5" />
            <span>Rutas ({rutas.length})</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('envios');
            setSearchQuery('');
          }}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'envios'
              ? 'border-[#50C878] text-[#50C878] bg-[#50C878]/5'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <MdInventory className="w-5 h-5" />
            <span>Envíos ({envios.length})</span>
          </div>
        </button>
      </div>

      {/* Buscador y Filtros */}
      {activeTab === 'rutas' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="Buscar por nombre, estado, ID o cantidad de pedidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 w-full"
          />
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-sm font-medium text-gray-700 whitespace-nowrap"
            title={sortOrder === 'desc' ? 'Ordenar: Más antiguas primero' : 'Ordenar: Más recientes primero'}
          >
            <MdSort className="w-4 h-4" />
            <span>{sortOrder === 'desc' ? 'Más recientes' : 'Más antiguas'}</span>
          </button>
        </div>
      )}

      {activeTab === 'envios' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="Buscar envíos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 w-full"
          />
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-sm font-medium text-gray-700 whitespace-nowrap"
            title={sortOrder === 'desc' ? 'Ordenar: Más antiguas primero' : 'Ordenar: Más recientes primero'}
          >
            <MdSort className="w-4 h-4" />
            <span>{sortOrder === 'desc' ? 'Más recientes' : 'Más antiguas'}</span>
          </button>
        </div>
      )}

      {/* Contenido principal según el tab activo */}
      {activeTab === 'rutas' ? (
        /* Layout: Lista de rutas a la izquierda, Mapa y detalles a la derecha */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 min-h-[600px] lg:h-[calc(100vh-250px)]">
          {/* Lista de rutas - Columna izquierda */}
          <div className="lg:col-span-1 overflow-y-auto space-y-3 lg:space-y-4 pr-2 lg:max-h-full">
            {rutasFiltradasYOrdenadas.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">
                  {searchQuery ? 'No se encontraron rutas que coincidan con la búsqueda' : 'No hay rutas asignadas'}
                </p>
              </div>
            ) : (
              rutasFiltradasYOrdenadas.map((ruta) => {
                const isExpanded = expandedRutas.has(ruta.idRuta);
                const isSelected = selectedRutaId === ruta.idRuta;
                const pedidosCount = ruta.rutaPedidos?.length || 0;

                return (
                  <div
                    key={ruta.idRuta}
                    className={`bg-white rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'border-[#50C878] shadow-lg ring-2 ring-[#50C878]/20'
                        : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedRutaId(ruta.idRuta);
                      if (!isExpanded) {
                        toggleExpandRuta(ruta.idRuta);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedRutaId(ruta.idRuta);
                        if (!isExpanded) {
                          toggleExpandRuta(ruta.idRuta);
                        }
                      }
                    }}
                    aria-label={`Ruta ${ruta.nombre || ruta.idRuta}, ${pedidosCount} paradas`}
                  >
                    {/* Header de la card */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {ruta.nombre || `Ruta #${ruta.idRuta}`}
                          </h3>
                        </div>
                        {getEstadoBadge(ruta.estado)}
                      </div>

                      {/* Información rápida */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MdStraighten className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <p className="text-xs text-gray-500">Distancia</p>
                            <p className="font-medium text-gray-900">{formatDistance(ruta.distanciaKm)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MdAccessTime className="w-4 h-4 text-gray-400" aria-hidden="true" />
                          <div>
                            <p className="text-xs text-gray-500">Duración</p>
                            <p className="font-medium text-gray-900">{formatDuration(ruta.duracionMin)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MdLocationOn className="w-3 h-3" aria-hidden="true" />
                          <span>{pedidosCount} {pedidosCount === 1 ? 'parada' : 'paradas'}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandRuta(ruta.idRuta);
                          }}
                          className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                          aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <>
                              <MdExpandLess className="w-4 h-4" aria-hidden="true" />
                              <span>Ocultar</span>
                            </>
                          ) : (
                            <>
                              <MdExpandMore className="w-4 h-4" aria-hidden="true" />
                              <span>Ver detalles</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Detalles expandidos */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Fecha Programada</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(ruta.fechaProgramada)}</p>
                        </div>
                        {ruta.empleado && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Conductor</p>
                            <p className="text-sm font-medium text-gray-900">
                              {ruta.empleado.primerNombre} {ruta.empleado.primerApellido}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Perfil</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{ruta.profile || 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Mapa y detalles - Columnas derechas */}
          <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden">
            {/* Mapa */}
            <div className="shrink-0 min-h-[300px] sm:min-h-[400px] lg:min-h-[450px] lg:flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {rutaParaMapa ? (
                <RouteMap
                  key={`ruta-${rutaParaMapa.idRuta}-${pedidosOrdenados.length}`}
                  geometry={rutaParaMapa.geometry || null}
                  origenLat={typeof rutaParaMapa.origenLat === 'number' ? rutaParaMapa.origenLat : parseFloat(String(rutaParaMapa.origenLat))}
                  origenLng={typeof rutaParaMapa.origenLng === 'number' ? rutaParaMapa.origenLng : parseFloat(String(rutaParaMapa.origenLng))}
                  rutaPedidos={pedidosOrdenados}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MdLocationOn className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Selecciona una ruta para ver el mapa</p>
                    <p className="text-sm text-gray-400 mt-1">El mapa mostrará la ruta optimizada con todas las paradas numeradas</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de pedidos ordenados por secuencia */}
            {pedidosOrdenados.length > 0 && (
              <div className="shrink-0 bg-white rounded-lg border border-gray-200 shadow-sm p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Paradas de la Ruta ({pedidosOrdenados.length})
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded self-start sm:self-auto whitespace-nowrap">
                    Orden optimizado por Mapbox
                  </span>
                </div>
                <div className="space-y-3 overflow-y-auto pr-2 -mr-2">
                  {pedidosOrdenados.map((pedido) => (
                    <PedidoCard 
                      key={pedido.idRutaPedido} 
                      pedido={pedido}
                      onViewDetails={handleViewPedidoDetails}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Layout para envíos: Grid de cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
          {enviosFiltradosYOrdenados.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdInventory className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes envíos con ruta asignada</h3>
              <p className="text-gray-600 text-sm">
                Solo se muestran los envíos que tienen una ruta asignada. Cuando se te asignen envíos con ruta, aparecerán aquí.
              </p>
            </div>
          ) : (
            enviosFiltradosYOrdenados.map((envio) => (
              <EnvioCard
                key={envio.idEnvio}
                envio={envio}
                onViewPedidoDetails={handleViewPedidoDetails}
              />
            ))
          )}
        </div>
      )}

      {/* Modal de detalles del pedido */}
      <PedidoDetailsModal
        open={isPedidoModalOpen}
        onOpenChange={setIsPedidoModalOpen}
        pedidoId={selectedPedidoId}
      />
    </div>
  );
}

