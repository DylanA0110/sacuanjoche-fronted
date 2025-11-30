import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { getFacturaById } from '../actions/getFacturaById';
import { getFacturaDetalleByFacturaId } from '../actions/getFacturaDetalleByFacturaId';
import type { Factura } from '../types/factura.interface';
import type { FacturaDetalle } from '../types/factura-detalle.interface';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  MdReceipt,
  MdCalendarToday,
  MdAttachMoney,
  MdPerson,
  MdLocationOn,
  MdShoppingCart,
  MdLocalFlorist,
} from 'react-icons/md';

interface FacturaDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facturaId: number | null;
}

export function FacturaDetailsModal({
  open,
  onOpenChange,
  facturaId,
}: FacturaDetailsModalProps) {
  const {
    data: factura,
    isLoading: isLoadingFactura,
    isError: isErrorFactura,
  } = useQuery<Factura>({
    queryKey: ['factura', facturaId],
    queryFn: () => getFacturaById(facturaId!),
    enabled: !!facturaId && open,
  });

  const {
    data: detalles,
    isLoading: isLoadingDetalles,
  } = useQuery<FacturaDetalle[]>({
    queryKey: ['factura-detalle', facturaId],
    queryFn: () => getFacturaDetalleByFacturaId(facturaId!),
    enabled: !!facturaId && open,
  });

  const montoTotal = useMemo(() => {
    if (!factura) return 0;
    return typeof factura.montoTotal === 'string'
      ? parseFloat(factura.montoTotal)
      : factura.montoTotal;
  }, [factura]);

  const subtotalDetalles = useMemo(() => {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((sum, detalle) => {
      const subtotal = typeof detalle.subtotal === 'string'
        ? parseFloat(detalle.subtotal)
        : detalle.subtotal;
      return sum + subtotal;
    }, 0);
  }, [detalles]);

  if (isLoadingFactura) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Cargando factura...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isErrorFactura || !factura) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">
              Error
            </DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-gray-600 mb-4">
              No se pudo cargar la factura
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const estado = factura.estado?.toLowerCase() || '';
  const estadoVariantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success'> = {
    pendiente: 'warning',
    pagado: 'success',
    pagada: 'success',
    anulada: 'destructive',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200/60 shadow-2xl max-w-5xl max-h-[90vh] overflow-hidden p-0 rounded-xl sm:rounded-2xl">
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Header Premium */}
          <div className="bg-linear-to-r from-[#50C878]/10 via-[#50C878]/5 to-transparent border-b border-gray-200/60 p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-linear-to-br from-[#50C878]/20 to-[#50C878]/10 rounded-xl border-2 border-[#50C878]/30">
                    <MdReceipt className="h-6 w-6 text-[#50C878]" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      Detalles de la Factura
                    </DialogTitle>
                    <p className="text-sm text-gray-600 font-medium">
                      {factura.numFactura}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <Badge variant={estadoVariantMap[estado] || 'outline'} className="text-sm px-3 py-1">
                    {factura.estado}
                  </Badge>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MdCalendarToday className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date(factura.fechaEmision).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Información Principal - Cards Premium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Monto Total */}
              <Card className="bg-linear-to-br from-[#50C878]/10 to-[#50C878]/5 border-2 border-[#50C878]/30 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Monto Total
                      </p>
                      <p className="text-3xl font-bold text-[#50C878]">
                        ${montoTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-[#50C878]/20 rounded-full">
                      <MdAttachMoney className="h-8 w-8 text-[#50C878]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Información del Pedido */}
              {factura.pedido && (
                <Card className="bg-linear-to-br from-blue-50 to-blue-50/50 border-2 border-blue-200/50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MdShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Pedido Asociado
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {factura.pedido.numeroPedido || `PED-${factura.pedido.idPedido}`}
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-blue-200/50">
                      <p className="text-sm text-gray-600">
                        Total del Pedido:{' '}
                        <span className="font-semibold text-gray-900">
                          $
                          {typeof factura.pedido.totalPedido === 'string'
                            ? parseFloat(factura.pedido.totalPedido).toFixed(2)
                            : factura.pedido.totalPedido.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Información del Cliente y Empleado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Cliente */}
              {factura.pedido && (
                <Card className="border-2 border-gray-200/60 shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <MdPerson className="h-5 w-5 text-gray-600" />
                      Información del Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                        <MdPerson className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Cliente
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {factura.pedido.cliente
                            ? `${factura.pedido.cliente.primerNombre || ''} ${factura.pedido.cliente.primerApellido || ''}`.trim() || 'N/A'
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                        <MdLocationOn className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Dirección de Entrega
                        </p>
                        <p className="text-base text-gray-900 break-words">
                          {factura.pedido.direccionTxt || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Card Empleado (Quién facturó) */}
              {factura.empleado && (
                <Card className="border-2 border-gray-200/60 shadow-md">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <MdPerson className="h-5 w-5 text-gray-600" />
                      Empleado que Facturó
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#50C878]/10 rounded-lg shrink-0">
                        <MdPerson className="h-5 w-5 text-[#50C878]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Nombre Completo
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {factura.empleado.primerNombre || ''} {factura.empleado.segundoNombre || ''} {factura.empleado.primerApellido || ''} {factura.empleado.segundoApellido || ''}
                        </p>
                        {factura.empleado.telefono && (
                          <p className="text-sm text-gray-600 mt-2">
                            📞 {factura.empleado.telefono}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Detalles de la Factura - Tabla Mejorada */}
            <Card className="border-2 border-gray-200/60 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MdLocalFlorist className="h-5 w-5 text-gray-600" />
                  Detalles de la Factura
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingDetalles ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">Cargando detalles...</p>
                    </div>
                  </div>
                ) : detalles && detalles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/80 border-b border-gray-200">
                          <TableHead className="font-semibold text-gray-900">Arreglo</TableHead>
                          <TableHead className="font-semibold text-gray-900 text-center">Cantidad</TableHead>
                          <TableHead className="font-semibold text-gray-900 text-right">Precio Unitario</TableHead>
                          <TableHead className="font-semibold text-gray-900 text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detalles.map((detalle, index) => {
                          const precioUnitario = typeof detalle.precioUnitario === 'string'
                            ? parseFloat(detalle.precioUnitario)
                            : detalle.precioUnitario;
                          const subtotal = typeof detalle.subtotal === 'string'
                            ? parseFloat(detalle.subtotal)
                            : detalle.subtotal;

                          return (
                            <TableRow 
                              key={detalle.idFacturaDetalle}
                              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                            >
                              <TableCell className="font-medium">
                                {detalle.arreglo?.nombre || `Arreglo #${detalle.idArreglo}`}
                              </TableCell>
                              <TableCell className="text-center font-semibold">
                                {detalle.cantidad}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${precioUnitario.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-gray-900">
                                ${subtotal.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <MdLocalFlorist className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No hay detalles para esta factura
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen Final Premium */}
            <Card className="bg-linear-to-r from-gray-50 to-gray-50/50 border-2 border-gray-200/60 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-end">
                  <div className="w-full sm:w-80 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-base font-medium text-gray-700">
                        Subtotal de Productos:
                      </span>
                      <span className="text-base font-semibold text-gray-900">
                        ${subtotalDetalles.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-gray-900">
                        Total de la Factura:
                      </span>
                      <span className="text-2xl font-bold text-[#50C878]">
                        ${montoTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
