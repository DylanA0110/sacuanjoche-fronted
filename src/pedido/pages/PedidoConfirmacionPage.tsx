import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getPedidoById } from '../actions/getPedidoById';
import { MdCheckCircle, MdShoppingBag, MdCalendarToday, MdLocationOn, MdPhone } from 'react-icons/md';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toast } from 'sonner';

export default function PedidoConfirmacionPage() {
  const { idPedido } = useParams<{ idPedido: string }>();
  const navigate = useNavigate();

  const { data: pedido, isLoading, error } = useQuery({
    queryKey: ['pedido', idPedido],
    queryFn: () => getPedidoById(parseInt(idPedido || '0', 10)),
    enabled: !!idPedido,
  });

  useEffect(() => {
    if (error) {
      toast.error('Error al cargar el pedido');
      navigate('/carrito', { replace: true });
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pedido no encontrado</p>
          <Link to="/carrito">
            <Button>Volver al Carrito</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de éxito */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-[#50C878]/10 rounded-full flex items-center justify-center">
              <MdCheckCircle className="w-12 h-12 text-[#50C878]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-lg text-gray-600">
            Tu pedido ha sido creado exitosamente
          </p>
          {pedido.numeroPedido && (
            <p className="text-sm text-gray-500 mt-2">
              Número de pedido: <span className="font-semibold">{pedido.numeroPedido}</span>
            </p>
          )}
        </div>

        {/* Información del pedido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdShoppingBag className="h-5 w-5 text-[#50C878]" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  C${typeof pedido.totalProductos === 'string' 
                    ? parseFloat(pedido.totalProductos).toFixed(2)
                    : pedido.totalProductos.toFixed(2)}
                </span>
              </div>
              {pedido.costoEnvio && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">
                    C${typeof pedido.costoEnvio === 'string'
                      ? parseFloat(pedido.costoEnvio).toFixed(2)
                      : pedido.costoEnvio.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-[#50C878]">
                  C${typeof pedido.totalPedido === 'string'
                    ? parseFloat(pedido.totalPedido).toFixed(2)
                    : pedido.totalPedido.toFixed(2)}
                </span>
              </div>
              {pedido.estado && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Estado: </span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {pedido.estado}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdCalendarToday className="h-5 w-5 text-[#50C878]" />
                Información de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pedido.fechaEntregaEstimada && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fecha de entrega estimada:</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(pedido.fechaEntregaEstimada).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {pedido.direccionTxt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <MdLocationOn className="h-4 w-4" />
                    Dirección:
                  </p>
                  <p className="font-medium text-gray-900">{pedido.direccionTxt}</p>
                </div>
              )}
              {pedido.contactoEntrega && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <MdPhone className="h-4 w-4" />
                    Contacto:
                  </p>
                  <p className="font-medium text-gray-900">
                    {pedido.contactoEntrega.nombre} {pedido.contactoEntrega.apellido}
                  </p>
                  <p className="text-sm text-gray-600">{pedido.contactoEntrega.telefono}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalles del pedido */}
        {pedido.detalles && pedido.detalles.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Productos del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pedido.detalles.map((detalle) => (
                  <div
                    key={detalle.idDetallePedido}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {detalle.arreglo?.url && (
                      <img
                        src={detalle.arreglo.url}
                        alt={detalle.arreglo.nombre}
                        className="w-20 h-20 object-cover rounded border border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {detalle.arreglo?.nombre || 'Producto'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Cantidad: {detalle.cantidad} × C${typeof detalle.precioUnitario === 'string'
                          ? parseFloat(detalle.precioUnitario).toFixed(2)
                          : detalle.precioUnitario.toFixed(2)}
                      </p>
                      <p className="font-semibold text-gray-900">
                        Subtotal: C${typeof detalle.subtotal === 'string'
                          ? parseFloat(detalle.subtotal).toFixed(2)
                          : detalle.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/catalogo">
            <Button variant="outline" className="w-full sm:w-auto">
              Continuar Comprando
            </Button>
          </Link>
          <Link to="/">
            <Button className="w-full sm:w-auto bg-[#50C878] hover:bg-[#00A87F] text-white">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

