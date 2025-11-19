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
  MdClose,
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
  // Obtener pedido por ID (ya incluye los detalles)
  const {
    data: pedido,
    isLoading,
    isError,
  } = useQuery<Pedido>({
    queryKey: ['pedido', pedidoId],
    queryFn: () => getPedidoById(pedidoId!),
    enabled: !!pedidoId && open,
  });

  // Los detalles vienen incluidos en el pedido
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

  const totalProductos =
    typeof pedido?.totalProductos === 'string'
      ? parseFloat(pedido.totalProductos)
      : pedido?.totalProductos || 0;

  const costoEnvio =
    typeof pedido?.costoEnvio === 'string'
      ? parseFloat(pedido.costoEnvio)
      : pedido?.costoEnvio || 0;

  const totalPedido =
    typeof pedido?.totalPedido === 'string'
      ? parseFloat(pedido.totalPedido)
      : pedido?.totalPedido || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold text-gray-900">
                  Detalles del Pedido #{pedidoId}
                </DialogTitle>
                <div className="mt-2">
                  {pedido && getEstadoBadge(pedido.estado || 'pendiente')}
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <MdClose className="h-6 w-6 text-gray-600" />
              </button>
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
            <div className="space-y-6">
              {/* Información General */}
              <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MdCalendarToday className="h-5 w-5 text-[#50C878]" />
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {pedido.idPago && (
                    <div>
                      <Label className="text-xs text-gray-500">
                        ID de Pago
                      </Label>
                      <p className="text-sm font-medium text-gray-900">
                        {pedido.idPago}
                      </p>
                    </div>
                  )}
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
                <div className="bg-linear-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdPerson className="h-5 w-5 text-[#50C878]" />
                    Contacto de Entrega
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdPerson className="h-5 w-5 text-[#50C878]" />
                    Empleado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MdShoppingCart className="h-5 w-5 text-[#50C878]" />
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
                        className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-[#50C878]/30 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-base">
                            {detalle.arreglo?.nombre ||
                              `Arreglo #${detalle.idArreglo}`}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Cantidad:{' '}
                            <span className="font-semibold">
                              {detalle.cantidad}
                            </span>{' '}
                            x $
                            {typeof detalle.precioUnitario === 'string'
                              ? parseFloat(detalle.precioUnitario).toFixed(2)
                              : detalle.precioUnitario.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#50C878]">
                            $
                            {typeof detalle.subtotal === 'string'
                              ? parseFloat(detalle.subtotal).toFixed(2)
                              : detalle.subtotal.toFixed(2)}
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
              <div className="bg-linear-to-br from-[#50C878]/10 to-[#3aa85c]/10 rounded-xl p-6 border-2 border-[#50C878]/30">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MdAttachMoney className="h-5 w-5 text-[#50C878]" />
                  Resumen de Totales
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal de Productos:</span>
                    <span className="font-semibold">
                      ${totalProductos.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Costo de Envío:</span>
                    <span className="font-semibold">
                      ${costoEnvio.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total del Pedido:</span>
                    <span className="text-[#50C878]">
                      ${totalPedido.toFixed(2)}
                    </span>
                  </div>
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
