import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { getPedidoById } from '@/pedido/actions/getPedidoById';
import { createFactura } from '../actions/createFactura';
import type { CreateFacturaDto } from '../types/factura.interface';
import { MdArrowBack, MdSave } from 'react-icons/md';

const NuevaFacturaPage = () => {
  const { idPedido } = useParams<{ idPedido: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateFacturaDto>({
    idPedido: 0,
    idEmpleado: 1, // Por ahora siempre se usa el id 1
    numFactura: '',
    estado: 'Emitida',
    montoTotal: 0,
  });

  // Obtener el pedido por ID
  const { data: pedido, isLoading: isLoadingPedido } = useQuery({
    queryKey: ['pedido', idPedido],
    queryFn: () => getPedidoById(Number(idPedido)),
    enabled: !!idPedido,
  });

  // Prellenar el formulario cuando se carga el pedido
  useEffect(() => {
    if (pedido) {
      const fecha = new Date();
      const numFactura = `FAC-${fecha.getFullYear()}-${String(
        fecha.getMonth() + 1
      ).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(
        3,
        '0'
      )}`;

      const totalPedido =
        typeof pedido.totalPedido === 'string'
          ? parseFloat(pedido.totalPedido)
          : pedido.totalPedido;

      setFormData({
        idPedido: pedido.idPedido,
        idEmpleado: 1, // Por ahora siempre se usa el id 1
        numFactura,
        estado: 'Emitida',
        montoTotal: totalPedido,
      });
    }
  }, [pedido]);

  const createFacturaMutation = useMutation({
    mutationFn: createFactura,
    onSuccess: () => {
      toast.success('Factura creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      navigate('/admin/pedidos');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear la factura';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.idPedido || !formData.idEmpleado || !formData.numFactura) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    createFacturaMutation.mutate(formData);
  };

  const handleChange = (
    field: keyof CreateFacturaDto,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/pedidos')}
          className="text-gray-600 hover:text-gray-900"
        >
          <MdArrowBack className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-gray-900">
            Nueva Factura
          </h1>
          <p className="text-base text-gray-600">
            Genera una factura para el pedido #{pedido.idPedido}
          </p>
        </div>
      </div>

      {/* Card con el formulario */}
      <Card className="bg-white/85 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl">
        <CardHeader className="pb-4 px-6 pt-6">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Información de la Factura
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Pedido (solo lectura) */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Pedido Seleccionado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Número de Pedido</Label>
                  <p className="text-sm font-medium text-gray-900">
                    PED-{pedido.idPedido}
                  </p>
                </div>
                {pedido.cliente && (
                  <div>
                    <Label className="text-xs text-gray-500">Cliente</Label>
                    <p className="text-sm font-medium text-gray-900">
                      {pedido.cliente.primerNombre} {pedido.cliente.primerApellido}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">Total del Pedido</Label>
                  <p className="text-sm font-medium text-gray-900">
                    ${typeof pedido.totalPedido === 'string' ? parseFloat(pedido.totalPedido).toFixed(2) : pedido.totalPedido.toFixed(2)}
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

            {/* Número de Factura */}
            <div className="space-y-2">
              <Label htmlFor="numFactura" className="text-sm font-semibold text-gray-700">
                Número de Factura *
              </Label>
              <Input
                id="numFactura"
                value={formData.numFactura}
                onChange={(e) => handleChange('numFactura', e.target.value)}
                placeholder="FAC-2024-001"
                className="bg-white border-gray-300 text-gray-900"
                required
              />
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label htmlFor="estado" className="text-sm font-semibold text-gray-700">
                Estado *
              </Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleChange('estado', value)}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Emitida">Emitida</SelectItem>
                  <SelectItem value="Pagada">Pagada</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Monto Total */}
            <div className="space-y-2">
              <Label htmlFor="montoTotal" className="text-sm font-semibold text-gray-700">
                Monto Total *
              </Label>
              <Input
                id="montoTotal"
                type="number"
                step="0.01"
                value={formData.montoTotal}
                onChange={(e) =>
                  handleChange('montoTotal', parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                className="bg-white border-gray-300 text-gray-900"
                required
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/pedidos')}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createFacturaMutation.isPending}
                className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-md shadow-[#50C878]/20 gap-2"
              >
                <MdSave className="h-4 w-4" />
                {createFacturaMutation.isPending ? 'Guardando...' : 'Crear Factura'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NuevaFacturaPage;

