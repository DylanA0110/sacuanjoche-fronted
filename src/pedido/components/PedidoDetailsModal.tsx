import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { getPedidoById } from '../actions/getPedidoById';
import {
  MdLocationOn,
  MdPerson,
  MdPhone,
  MdShoppingCart,
  MdCalendarToday,
  MdAttachMoney,
} from 'react-icons/md';
import type { Pedido } from '../types/pedido.interface';
import type { PedidoEstado } from '@/shared/types/estados.types';

interface PedidoDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pedidoId: number | null;
}

export function PedidoDetailsModal({
  open,
  onOpenChange,
  pedidoId,
}: PedidoDetailsModalProps) {
  // Obtener pedido por ID (ya incluye los detalles con arreglos)
  const {
    data: pedido,
    isLoading,
    isError,
  } = useQuery<Pedido>({
    queryKey: ['pedido', pedidoId],
    queryFn: () => getPedidoById(pedidoId!),
    enabled: !!pedidoId && open,
  });

  // Los detalles vienen incluidos en el pedido desde el backend
  const detalles = pedido?.detalles || [];

  if (!open || !pedidoId) return null;

  const getEstadoBadge = (estado?: PedidoEstado | string) => {
    if (!estado)
      return <Badge className="bg-gray-500 text-white">PENDIENTE</Badge>;

    // Normalizar el estado a minúsculas para comparación
    const estadoNormalizado = (
      typeof estado === 'string' ? estado.toLowerCase() : estado
    ) as PedidoEstado;

    switch (estadoNormalizado) {
      case 'entregado':
        return (
          <Badge className="bg-green-500 text-white">
            {estado.toString().toUpperCase()}
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-red-500 text-white">
            {estado.toString().toUpperCase()}
          </Badge>
        );
      case 'procesando':
      case 'en_envio':
        return (
          <Badge className="bg-blue-500 text-white">
            {estado.toString().toUpperCase()}
          </Badge>
        );
      case 'pendiente':
      default:
        return (
          <Badge className="bg-yellow-500 text-white">
            {estado.toString().toUpperCase()}
          </Badge>
        );
    }
  };

  // Calcular subtotal de productos desde los detalles (cantidad × precio del arreglo)
  const subtotalProductosCalculado = detalles
    ? detalles.reduce((sum, detalle) => {
        const precioArreglo =
          typeof detalle.arreglo?.precioUnitario === 'string'
            ? parseFloat(detalle.arreglo.precioUnitario)
            : detalle.arreglo?.precioUnitario || 0;
        return sum + detalle.cantidad * precioArreglo;
      }, 0)
    : 0;

  // Obtener costo de envío del pedido (puede venir en pedido.envio.costoEnvio o pedido.costoEnvio)
  const costoEnvio =
    pedido?.envio?.costoEnvio !== undefined
      ? typeof pedido.envio.costoEnvio === 'string'
        ? parseFloat(pedido.envio.costoEnvio)
        : pedido.envio.costoEnvio
      : pedido?.costoEnvio !== undefined
      ? typeof pedido.costoEnvio === 'string'
        ? parseFloat(pedido.costoEnvio)
        : pedido.costoEnvio
      : 0;

  // Calcular total del pedido (subtotal + costo de envío)
  const totalPedidoCalculado = subtotalProductosCalculado + costoEnvio;

  // Mantener valores del pedido como fallback si no hay detalles
  const totalProductos =
    detalles && detalles.length > 0
      ? subtotalProductosCalculado
      : typeof pedido?.totalProductos === 'string'
      ? parseFloat(pedido.totalProductos)
      : pedido?.totalProductos || 0;

  const totalPedido =
    detalles && detalles.length > 0
      ? totalPedidoCalculado
      : typeof pedido?.totalPedido === 'string'
      ? parseFloat(pedido.totalPedido)
      : pedido?.totalPedido || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        <div className="p-4 sm:p-6 md:p-8">
          <DialogHeader className="mb-4 sm:mb-6">
            <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">
                  Detalles del Pedido #{pedidoId}
                </DialogTitle>
                <div className="mt-2">
                  {pedido && getEstadoBadge(pedido.estado || 'pendiente')}
                </div>
              </div>
            </div>
          </DialogHeader>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">
                Cargando detalles del pedido...
              </div>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">
                Error al cargar los detalles del pedido
              </div>
            </div>
          )}

          {pedido && !isLoading && (
            <div className="space-y-4 sm:space-y-6">
              {/* Información General */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <MdCalendarToday className="h-4 w-4 sm:h-5 sm:w-5 text-[#50C878]" />
                  Información General
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">
                      Fecha de Creación
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(pedido.fechaCreacion).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Fecha de Entrega Estimada
                    </Label>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(pedido.fechaEntregaEstimada).toLocaleString(
                        'es-ES',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Canal</Label>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {pedido.canal || 'interno'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cliente */}
              {pedido.cliente && (
                <div className="bg-linear-to-br from-blue-50/50 to-green-50/50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdPerson className="h-5 w-5 text-[#50C878]" />
                    Cliente
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Nombre</Label>
                      <p className="text-sm font-medium text-gray-900">
                        {pedido.cliente.primerNombre}{' '}
                        {pedido.cliente.primerApellido}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Teléfono</Label>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <MdPhone className="h-4 w-4" />
                        {pedido.cliente.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dirección */}
              {pedido.direccion && (
                <div className="bg-linear-to-br from-blue-50/50 to-green-50/50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdLocationOn className="h-5 w-5 text-[#50C878]" />
                    Dirección de Entrega
                  </h3>
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-gray-900">
                      {pedido.direccion.formattedAddress}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Ciudad:</span>{' '}
                        {pedido.direccion.city}
                      </div>
                      <div>
                        <span className="font-semibold">Barrio:</span>{' '}
                        {pedido.direccion.neighborhood}
                      </div>
                      {pedido.direccion.referencia && (
                        <div className="md:col-span-2">
                          <span className="font-semibold">Referencia:</span>{' '}
                          {pedido.direccion.referencia}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 italic">
                      {pedido.direccionTxt}
                    </p>
                  </div>
                </div>
              )}

              {/* Contacto de Entrega */}
              {pedido.contactoEntrega && (
                <div className="bg-linear-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <MdPerson className="h-4 w-4 sm:h-5 sm:w-5 text-[#50C878]" />
                    Contacto de Entrega
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Nombre</Label>
                      <p className="text-sm font-medium text-gray-900">
                        {pedido.contactoEntrega.nombre}{' '}
                        {pedido.contactoEntrega.apellido}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Teléfono</Label>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <MdPhone className="h-4 w-4" />
                        {pedido.contactoEntrega.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empleado */}
              {pedido.empleado && (
                <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <MdPerson className="h-4 w-4 sm:h-5 sm:w-5 text-[#50C878]" />
                    Empleado
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Nombre</Label>
                      <p className="text-sm font-medium text-gray-900">
                        {pedido.empleado.primerNombre}{' '}
                        {pedido.empleado.primerApellido}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Teléfono</Label>
                      <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <MdPhone className="h-4 w-4" />
                        {pedido.empleado.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detalles del Pedido (Arreglos) */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <MdShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-[#50C878]" />
                  Arreglos del Pedido
                </h3>
                {isLoading ? (
                  <div className="text-center py-4 text-gray-500">
                    Cargando detalles...
                  </div>
                ) : detalles && detalles.length > 0 ? (
                  <div className="space-y-3">
                    {detalles.map((detalle, index) => (
                      <div
                        key={detalle.idDetallePedido || `detalle-${index}`}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-[#50C878]/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                            {detalle.arreglo?.nombre || 'Arreglo'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Cantidad:{' '}
                            <span className="font-semibold">
                              {detalle.cantidad}
                            </span>{' '}
                            x $
                            {(() => {
                              // Calcular precio unitario desde el arreglo (no desde la BD que es 0)
                              const precioArreglo =
                                typeof detalle.arreglo?.precioUnitario === 'string'
                                  ? parseFloat(detalle.arreglo.precioUnitario)
                                  : detalle.arreglo?.precioUnitario || 0;
                              return precioArreglo.toFixed(2);
                            })()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#50C878]">
                            $
                            {(() => {
                              // Calcular subtotal desde el arreglo (cantidad * precio del arreglo)
                              const precioArreglo =
                                typeof detalle.arreglo?.precioUnitario === 'string'
                                  ? parseFloat(detalle.arreglo.precioUnitario)
                                  : detalle.arreglo?.precioUnitario || 0;
                              const subtotalCalculado = detalle.cantidad * precioArreglo;
                              return subtotalCalculado.toFixed(2);
                            })()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No hay detalles disponibles
                  </p>
                )}
              </div>

              {/* Resumen de Totales */}
              <div className="bg-linear-to-br from-[#50C878]/10 to-[#3aa85c]/10 rounded-xl p-4 sm:p-6 border-2 border-[#50C878]/30">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <MdAttachMoney className="h-4 w-4 sm:h-5 sm:w-5 text-[#50C878]" />
                  Resumen de Totales
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm sm:text-base text-gray-700">
                    <span>Subtotal de Productos:</span>
                    <span className="font-semibold">
                      ${totalProductos.toFixed(2)}
                    </span>
                  </div>
                  {costoEnvio > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-gray-700">
                      <span>Costo de Envío:</span>
                      <span className="font-semibold">
                        ${costoEnvio.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total del Pedido:</span>
                    <span className="text-[#50C878]">
                      ${totalPedido.toFixed(2)}
                    </span>
                  </div>
                  {detalles && detalles.length > 0 && (
                    <p className="text-xs text-gray-500 italic mt-2">
                      * Los precios se calculan desde los arreglos del catálogo
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente Label simple para usar en el modal
function Label({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-medium ${className}`}>
      {children}
    </label>
  );
}
