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

  const getEstadoColor = (estado: string): string => {
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

  const getEstadoLabel = (estado: string): string => {
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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 lg:p-5">
      {/* Header con secuencia y estado */}
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#50C878] to-[#45b86a] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md ring-2 ring-white shrink-0"
            aria-label={`Parada número ${pedido.secuencia}`}
          >
            {pedido.secuencia}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              Pedido #{pedido.idPedido}
            </h3>
            <p className="text-xs text-gray-500 hidden sm:block">
              Orden de entrega: {pedido.secuencia}
            </p>
          </div>
        </div>
        <span className={`px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${getEstadoColor(pedido.estadoEntrega)}`}>
          <span className="hidden sm:inline">{getEstadoLabel(pedido.estadoEntrega)}</span>
          <span className="sm:hidden">{getEstadoLabel(pedido.estadoEntrega).split(' ')[0]}</span>
        </span>
      </div>

      {/* Dirección */}
      {pedido.direccionResumen && (
        <div className="mb-3 flex items-start gap-2">
          <MdLocationOn className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-gray-700 line-clamp-2 flex-1 break-words">
            {pedido.direccionResumen}
          </p>
        </div>
      )}

      {/* Información de distancia y duración */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <MdStraighten className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Distancia</p>
            <p className="font-medium text-gray-900 truncate">{formatDistance(pedido.distanciaKm)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MdAccessTime className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Tiempo</p>
            <p className="font-medium text-gray-900 truncate">{formatDuration(pedido.duracionMin)}</p>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(pedido.idPedido)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#50C878] hover:bg-[#45b86a] text-white rounded-md text-sm font-medium transition-colors duration-150"
            >
              <MdVisibility className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Ver Detalles</span>
            </button>
          )}
          {canOpenMaps && (
            <button
              onClick={handleOpenGoogleMaps}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors duration-150 border border-blue-200 sm:flex-1"
            >
              <MdOpenInNew className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">Abrir en Maps</span>
            </button>
          )}
        </div>
        {canOpenMaps && (
          <div className="mt-2 text-xs text-gray-500 text-center space-y-0.5">
            <p className="truncate">Lat: {typeof pedido.lat === 'number' ? pedido.lat.toFixed(6) : parseFloat(String(pedido.lat)).toFixed(6)}</p>
            <p className="truncate">Lng: {typeof pedido.lng === 'number' ? pedido.lng.toFixed(6) : parseFloat(String(pedido.lng)).toFixed(6)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
