import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { getPedidoById } from '@/pedido/actions/getPedidoById';
import { createFacturaDesdePedido } from '../actions/createFacturaDesdePedido';
import { MdArrowBack, MdDownload, MdCheckCircle, MdInfo } from 'react-icons/md';
import { getFacturaPdf } from '../actions/getFacturaPdf';

const NuevaFacturaPage = () => {
  const { idPedido } = useParams<{ idPedido: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const idFacturaParam = searchParams.get('idFactura');
  const idFactura = idFacturaParam ? Number(idFacturaParam) : null;
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    if (!idFactura) return;
    try {
      setDownloadingPdf(true);
      await getFacturaPdf(idFactura);
      toast.success('PDF de factura descargado');
    } catch (e: any) {
      toast.error('Error al descargar PDF', {
        description: cleanErrorMessage(e),
        duration: 5000,
      });
    } finally {
      setDownloadingPdf(false);
    }
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Obtener el pedido por ID
  const { data: pedido, isLoading: isLoadingPedido } = useQuery({
    queryKey: ['pedido', idPedido],
    queryFn: () => getPedidoById(Number(idPedido)),
    enabled: !!idPedido,
  });

  const createFacturaMutation = useMutation({
    mutationFn: () => {
      if (!idPedido) {
        throw new Error('ID de pedido no válido');
      }
      return createFacturaDesdePedido(Number(idPedido));
    },
    onSuccess: (factura) => {
      toast.success('Factura creada exitosamente desde el pedido');
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });

      // Actualizar URL con el idFactura para poder descargar PDF
      if (factura && factura.idFactura) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('idFactura', String(factura.idFactura));
        setSearchParams(newSearchParams, { replace: true });
      }
    },
    onError: (error: any) => {
      console.error('Error al crear factura desde pedido:', error);
      console.error('Error response:', error?.response?.data);

      // Extraer el mensaje del error directamente del backend
      const errorData = error?.response?.data;
      let errorMessage = 'Ocurrió un error inesperado al crear la factura';

      if (errorData) {
        // Priorizar el mensaje del backend
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Si el error indica que ya existe una factura, extraer el ID
      // Formato esperado: "El pedido 13 ya tiene una factura asociada (ID: 21)."
      const facturaExistenteMatch = errorMessage.match(/\(ID:\s*(\d+)\)/i);
      if (facturaExistenteMatch) {
        const idFacturaExistente = parseInt(facturaExistenteMatch[1], 10);
        console.log('Factura existente detectada, ID:', idFacturaExistente);

        // Actualizar URL con el idFactura para mostrar el botón de descargar PDF
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('idFactura', String(idFacturaExistente));
        setSearchParams(newSearchParams, { replace: true });

        // Mostrar mensaje informativo en lugar de error
        toast.info('El pedido ya tiene una factura asociada', {
          description: `La factura #${idFacturaExistente} ya existe para este pedido. Puedes descargar el PDF usando el botón de arriba.`,
          duration: 5000,
        });
      } else {
        // Para otros errores, mostrar como error
        console.log('Mensaje de error a mostrar:', errorMessage);
        toast.error('Error al crear la factura', {
          description: errorMessage,
          duration: 5000,
        });
      }
    },
  });

  const handleCrearFactura = () => {
    // createFacturaDesdePedido solo necesita el idPedido de la URL
    createFacturaMutation.mutate();
  };

  if (isLoadingPedido) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/pedidos')}
            className="text-gray-600 hover:text-gray-900"
          >
            <MdArrowBack className="h-5 w-5 mr-2" />
            Volver
          </Button>
        </div>
        <Card className="bg-white/85 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">
              No se pudo cargar el pedido
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/pedidos')}
            className="text-gray-600 hover:text-gray-900 shrink-0"
          >
            <MdArrowBack className="h-5 w-5 mr-2" />
            Volver
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-gray-900 truncate">
              {idFactura ? 'Factura Creada' : 'Nueva Factura'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 truncate">
              {idFactura
                ? `Factura #${idFactura} para el pedido #${pedido.idPedido}`
                : `Genera una factura para el pedido #${pedido.idPedido}`}
            </p>
          </div>
        </div>
        {idFactura && (
          <Button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="bg-[#50C878] hover:bg-[#63d68b] text-white shadow-md shadow-[#50C878]/20 gap-2 w-full sm:w-auto shrink-0"
            size="lg"
          >
            {downloadingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <MdDownload className="h-5 w-5" />
                Descargar PDF
              </>
            )}
          </Button>
        )}
      </div>

      {/* Mensaje de éxito cuando la factura está creada */}
      {idFactura && (
        <Card className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-[#50C878]/30 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#50C878]/20 rounded-full">
                <MdCheckCircle className="h-6 w-6 text-[#50C878]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Factura creada exitosamente
                </h3>
                <p className="text-sm text-gray-600">
                  La factura #{idFactura} ha sido creada. Puedes descargar el
                  PDF usando el botón de arriba.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card con el formulario */}
      <Card className="bg-white/85 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl">
        <CardHeader className="pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            {idFactura
              ? 'Información de la Factura Creada'
              : 'Información de la Factura'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-6">
            {/* Información del Pedido (solo lectura) */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Pedido Seleccionado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">
                    Número de Pedido
                  </Label>
                  <p className="text-sm font-medium text-gray-900">
                    PED-{pedido.idPedido}
                  </p>
                </div>
                {pedido.cliente && (
                  <div>
                    <Label className="text-xs text-gray-500">Cliente</Label>
                    <p className="text-sm font-medium text-gray-900">
                      {pedido.cliente.primerNombre}{' '}
                      {pedido.cliente.primerApellido}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">
                    Total del Pedido
                  </Label>
                  <p className="text-sm font-medium text-gray-900">
                    $
                    {typeof pedido.totalPedido === 'string'
                      ? parseFloat(pedido.totalPedido).toFixed(2)
                      : pedido.totalPedido.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Dirección</Label>
                  <p className="text-sm font-medium text-gray-900">
                    {pedido.direccionTxt || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información sobre la creación automática */}
            {!idFactura && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MdInfo className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Creación Automática de Factura
                    </h4>
                    <p className="text-sm text-blue-800">
                      La factura se generará automáticamente desde este pedido.
                      Se copiarán todos los montos y detalles del pedido a la
                      factura. El número de factura, estado y monto total se
                      generarán automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/pedidos')}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
              >
                {idFactura ? 'Volver a Pedidos' : 'Cancelar'}
              </Button>
              {!idFactura && (
                <Button
                  type="button"
                  onClick={handleCrearFactura}
                  disabled={createFacturaMutation.isPending}
                  className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-md shadow-[#50C878]/20 gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {createFacturaMutation.isPending
                    ? 'Creando...'
                    : 'Crear Factura desde Pedido'}
                </Button>
              )}
              {idFactura && (
                <Button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="bg-[#50C878] hover:bg-[#63d68b] text-white shadow-md shadow-[#50C878]/20 gap-2 w-full sm:w-auto"
                >
                  {downloadingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      <MdDownload className="h-5 w-5" />
                      Descargar PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NuevaFacturaPage;
