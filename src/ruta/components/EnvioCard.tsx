import { 
  MdLocationOn, 
  MdAccessTime, 
  MdStraighten, 
  MdOpenInNew, 
  MdVisibility,
  MdCalendarToday,
  MdLocalShipping,
  MdCheckCircle,
  MdSchedule
} from 'react-icons/md';
import type { EnvioConductor } from '../types/envio.interface';
import { format } from 'date-fns';

interface EnvioCardProps {
  envio: EnvioConductor;
  onOpenGoogleMaps?: (lat: number, lng: number) => void;
  onViewPedidoDetails?: (idPedido: number) => void;
}

export function EnvioCard({ envio, onOpenGoogleMaps, onViewPedidoDetails }: EnvioCardProps) {
  const handleOpenGoogleMaps = () => {
    const lat = typeof envio.destinoLat === 'number' ? envio.destinoLat : parseFloat(String(envio.destinoLat || 0));
    const lng = typeof envio.destinoLng === 'number' ? envio.destinoLng : parseFloat(String(envio.destinoLng || 0));
    
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      onOpenGoogleMaps?.(lat, lng);
    }
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'No programada';
    try {
      return format(new Date(dateString), "PPp");
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

  const formatCurrency = (amount?: number | string | null): string => {
    if (amount == null) return 'N/A';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!Number.isFinite(num)) return 'N/A';
    return `$${num.toFixed(2)}`;
  };

  const getEstadoColor = (estado: string): string => {
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'programado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'en_camino':
      case 'en camino':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoLabel = (estado: string): string => {
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'programado':
        return 'Programado';
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

  const canOpenMaps = 
    (typeof envio.destinoLat === 'number' && Number.isFinite(envio.destinoLat)) ||
    (typeof envio.destinoLat === 'string' && !isNaN(parseFloat(envio.destinoLat)));

  const tieneRuta = envio.idRuta !== null && envio.idRuta !== undefined;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
      {/* Header con ID y estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <MdLocalShipping className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Envío #{envio.idEnvio}</h3>
            <p className="text-xs text-gray-500">Pedido #{envio.idPedido}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoColor(envio.estadoEnvio)}`}>
          {getEstadoLabel(envio.estadoEnvio)}
        </span>
      </div>

      {/* Información del pedido */}
      {envio.pedido && (
        <div className="mb-3 p-2 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Dirección de Entrega</p>
          <div className="flex items-start gap-2">
            <MdLocationOn className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 line-clamp-2 flex-1">
              {envio.pedido.direccionTxt || 'Sin dirección'}
            </p>
          </div>
          {envio.pedido.numeroPedido && (
            <p className="text-xs text-gray-500 mt-1">N° Pedido: {envio.pedido.numeroPedido}</p>
          )}
        </div>
      )}

      {/* Información de fechas */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <MdCalendarToday className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Programado</p>
            <p className="font-medium text-gray-900">{formatDate(envio.fechaProgramada)}</p>
          </div>
        </div>
        {envio.fechaSalida && (
          <div className="flex items-center gap-2 text-sm">
            <MdSchedule className="w-4 h-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Salida</p>
              <p className="font-medium text-gray-900">{formatDate(envio.fechaSalida)}</p>
            </div>
          </div>
        )}
        {envio.fechaEntrega && (
          <div className="flex items-center gap-2 text-sm">
            <MdCheckCircle className="w-4 h-4 text-green-400" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Entregado</p>
              <p className="font-medium text-gray-900">{formatDate(envio.fechaEntrega)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Información de distancia y costo */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <MdStraighten className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Distancia</p>
            <p className="font-medium text-gray-900">{formatDistance(envio.distanciaKm)}</p>
          </div>
        </div>
        {envio.costoEnvio && (
          <div className="flex items-center gap-2 text-sm">
            <MdAccessTime className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Costo</p>
              <p className="font-medium text-gray-900">{formatCurrency(envio.costoEnvio)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Información de ruta */}
      {tieneRuta && envio.ruta && (
        <div className="mb-3 p-2 bg-blue-50 rounded-md border border-blue-100">
          <p className="text-xs text-blue-600 font-medium mb-1">Ruta Asignada</p>
          <p className="text-sm font-semibold text-blue-900">{envio.ruta.nombre || `Ruta #${envio.ruta.idRuta}`}</p>
        </div>
      )}

      {/* Observaciones */}
      {envio.observaciones && (
        <div className="mb-3 p-2 bg-amber-50 rounded-md border border-amber-100">
          <p className="text-xs text-amber-600 font-medium mb-1">Observaciones</p>
          <p className="text-sm text-amber-900">{envio.observaciones}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {onViewPedidoDetails && (
            <button
              onClick={() => onViewPedidoDetails(envio.idPedido)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#50C878] hover:bg-[#45b86a] text-white rounded-md text-sm font-medium transition-colors duration-150"
            >
              <MdVisibility className="w-4 h-4" />
              <span>Ver Pedido</span>
            </button>
          )}
          {canOpenMaps && (
            <button
              onClick={handleOpenGoogleMaps}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors duration-150 border border-blue-200"
            >
              <MdOpenInNew className="w-4 h-4" />
              <span>Maps</span>
            </button>
          )}
        </div>
        {canOpenMaps && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            <p>Destino Lat: {typeof envio.destinoLat === 'number' ? envio.destinoLat.toFixed(6) : parseFloat(String(envio.destinoLat || 0)).toFixed(6)}</p>
            <p>Destino Lng: {typeof envio.destinoLng === 'number' ? envio.destinoLng.toFixed(6) : parseFloat(String(envio.destinoLng || 0)).toFixed(6)}</p>
          </div>
        )}
      </div>
    </div>
  );
}










