import { MdLocationOn, MdAccessTime, MdStraighten, MdOpenInNew, MdVisibility } from 'react-icons/md';
import type { RutaPedido, PedidoRuta } from '../types/ruta.interface';
import { useRutaStore } from '../store/ruta.store';

interface PedidoCardProps {
  pedido: RutaPedido | PedidoRuta;
  conductorId?: number;
  onOpenGoogleMaps?: (lat: number, lng: number) => void;
  onViewDetails?: (idPedido: number) => void;
}

// Función helper para verificar si es RutaPedido
const isRutaPedido = (pedido: RutaPedido | PedidoRuta): pedido is RutaPedido => {
  return 'secuencia' in pedido && 'idRutaPedido' in pedido;
};

export function PedidoCard({ pedido, conductorId, onOpenGoogleMaps, onViewDetails }: PedidoCardProps) {
  const setDraggingPedidoId = useRutaStore((state) => state.setDraggingPedidoId);
  const removeDraggingPedidoId = useRutaStore((state) => state.removeDraggingPedidoId);

  const handleOpenGoogleMaps = () => {
    const lat = isRutaPedido(pedido) 
      ? (typeof pedido.lat === 'number' ? pedido.lat : parseFloat(String(pedido.lat || 0)))
      : pedido.direccion?.lat;
    const lng = isRutaPedido(pedido)
      ? (typeof pedido.lng === 'number' ? pedido.lng : parseFloat(String(pedido.lng || 0)))
      : pedido.direccion?.lng;
    
    if (lat && lng && Number.isFinite(lat) && Number.isFinite(lng)) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      onOpenGoogleMaps?.(lat, lng);
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

  const getEstadoColor = (estado?: string | null): string => {
    if (!estado || typeof estado !== 'string') {
      return 'bg-gray-100 text-gray-800 border-gray-300';
    }
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'procesando':
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'en_camino':
      case 'en camino':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoLabel = (estado?: string | null): string => {
    if (!estado || typeof estado !== 'string') {
      return 'Sin estado';
    }
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'pendiente':
        return 'Pendiente';
      case 'procesando':
      case 'en_proceso':
        return 'Procesando';
      case 'en_camino':
      case 'en camino':
        return 'En Camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!conductorId) {
      setDraggingPedidoId(pedido.idPedido);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragEnd = () => {
    if (!conductorId) {
      removeDraggingPedidoId();
    }
  };

  // Si es RutaPedido (página del conductor), mostrar diseño completo
  if (isRutaPedido(pedido)) {
    const canOpenMaps = typeof pedido.lat === 'number' && typeof pedido.lng === 'number' 
      && Number.isFinite(pedido.lat) && Number.isFinite(pedido.lng);

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 sm:p-6 lg:p-7">
        {/* Header con secuencia y estado */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-[#50C878] to-[#45b86a] flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-lg ring-3 ring-white shrink-0"
              aria-label={`Parada número ${pedido.secuencia}`}
            >
              {pedido.secuencia}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg lg:text-xl mb-1">
                Pedido #{pedido.idPedido}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                Orden de entrega: {pedido.secuencia}
              </p>
            </div>
          </div>
          <span className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border shrink-0 ${getEstadoColor(pedido.estadoEntrega)}`}>
            {getEstadoLabel(pedido.estadoEntrega)}
          </span>
        </div>

        {/* Dirección */}
        {pedido.direccionResumen && (
          <div className="mb-4 sm:mb-5 flex items-start gap-3">
            <MdLocationOn className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm sm:text-base text-gray-700 line-clamp-3 flex-1 break-words leading-relaxed">
              {pedido.direccionResumen}
            </p>
          </div>
        )}

        {/* Información de distancia y duración */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
          <div className="flex items-center gap-3 text-sm sm:text-base">
            <MdStraighten className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Distancia</p>
              <p className="font-semibold text-gray-900 text-base sm:text-lg">{formatDistance(pedido.distanciaKm)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm sm:text-base">
            <MdAccessTime className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Tiempo</p>
              <p className="font-semibold text-gray-900 text-base sm:text-lg">{formatDuration(pedido.duracionMin)}</p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="pt-4 sm:pt-5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onViewDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onViewDetails(pedido.idPedido);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-[#50C878] hover:bg-[#45b86a] text-white rounded-lg text-sm sm:text-base font-medium transition-colors duration-150 shadow-sm hover:shadow-md"
              >
                <MdVisibility className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Ver Detalles</span>
              </button>
            )}
            {canOpenMaps && (
              <button
                onClick={handleOpenGoogleMaps}
                className="flex items-center justify-center gap-2 px-4 py-3 sm:py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm sm:text-base font-medium transition-colors duration-150 border border-blue-200 shadow-sm hover:shadow-md sm:flex-1"
              >
                <MdOpenInNew className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Abrir en Maps</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Si es PedidoRuta (página de rutas con drag and drop), mostrar diseño simple con información relevante
  const pedidoRuta = pedido as PedidoRuta;
  const clienteNombre = pedidoRuta.cliente 
    ? (pedidoRuta.cliente.nombreCompleto || `${pedidoRuta.cliente.primerNombre} ${pedidoRuta.cliente.primerApellido}`)
    : 'Sin cliente';
  const direccionTxt = pedidoRuta.direccion?.direccionTxt || 'Sin dirección';

  return (
    <div
      draggable={!conductorId}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-move hover:border-[#50C878] group"
    >
      {/* Header con círculo verde y número de pedido */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#50C878] to-[#45b86a] flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
          {pedidoRuta.idPedido}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base">
              Pedido #{pedidoRuta.idPedido}
            </h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${getEstadoColor(pedidoRuta.estado)}`}>
              {getEstadoLabel(pedidoRuta.estado)}
            </span>
          </div>
          {/* Cliente */}
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Cliente:</span> {clienteNombre}
          </p>
          {/* Dirección */}
          <div className="flex items-start gap-2 mb-3">
            <MdLocationOn className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 line-clamp-2 flex-1 leading-relaxed">
              {direccionTxt}
            </p>
          </div>
          {/* Botón para ver detalles */}
          {onViewDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onViewDetails(pedidoRuta.idPedido);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#50C878] hover:bg-[#45b86a] text-white rounded-lg text-xs font-medium transition-colors duration-150 shadow-sm hover:shadow-md"
            >
              <MdVisibility className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Ver Detalles</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
