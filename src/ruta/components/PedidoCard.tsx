import { MdLocationOn, MdAccessTime, MdStraighten, MdOpenInNew, MdVisibility } from 'react-icons/md';
import type { RutaPedido } from '../types/ruta.interface';

interface PedidoCardProps {
  pedido: RutaPedido;
  onOpenGoogleMaps?: (lat: number, lng: number) => void;
  onViewDetails?: (idPedido: number) => void;
}

export function PedidoCard({ pedido, onOpenGoogleMaps, onViewDetails }: PedidoCardProps) {
  const handleOpenGoogleMaps = () => {
    if (typeof pedido.lat === 'number' && typeof pedido.lng === 'number') {
      const url = `https://www.google.com/maps?q=${pedido.lat},${pedido.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      onOpenGoogleMaps?.(pedido.lat, pedido.lng);
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
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
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
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'Pendiente';
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
              onClick={() => onViewDetails(pedido.idPedido)}
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
        {canOpenMaps && (
          <div className="mt-3 text-xs sm:text-sm text-gray-500 text-center space-y-1 bg-gray-50 rounded-lg p-2">
            <p>Lat: {typeof pedido.lat === 'number' ? pedido.lat.toFixed(6) : parseFloat(String(pedido.lat)).toFixed(6)}</p>
            <p>Lng: {typeof pedido.lng === 'number' ? pedido.lng.toFixed(6) : parseFloat(String(pedido.lng)).toFixed(6)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
