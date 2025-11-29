import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router';
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
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getFacturaById, updateFactura } from '../actions';
import { getFacturaDetalleByFacturaId, updateFacturaDetalle } from '../actions';
import type { Factura } from '../types/factura.interface';
import type { FacturaDetalle } from '../types/factura-detalle.interface';
import type { UpdateFacturaDetalleDto } from '../actions/updateFacturaDetalle';
import type { FacturaEstado } from '@/shared/types/estados.types';
import {
  MdArrowBack,
  MdSave,
  MdEdit,
  MdReceipt,
  MdAttachMoney,
  MdDescription,
  MdLocalFlorist,
} from 'react-icons/md';

interface FormValues {
  numFactura: string;
  estado: FacturaEstado;
  montoTotal: number;
  idFolio?: number | null;
}

const EditarFacturaPage = () => {
  const { idFactura } = useParams<{ idFactura: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingDetalleId, setEditingDetalleId] = useState<number | null>(null);
  const [detalleEditForm, setDetalleEditForm] = useState<
    Partial<UpdateFacturaDetalleDto>
  >({});

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>();

  // Cargar factura
  const { data: factura, isLoading: isLoadingFactura } = useQuery<Factura>({
    queryKey: ['factura', idFactura],
    queryFn: () => getFacturaById(Number(idFactura!)),
    enabled: !!idFactura,
  });

  // Cargar detalles de factura
  const { data: detalles, refetch: refetchDetalles } = useQuery<
    FacturaDetalle[]
  >({
    queryKey: ['factura-detalle', idFactura],
    queryFn: () => getFacturaDetalleByFacturaId(Number(idFactura!)),
    enabled: !!idFactura,
  });

  // Prellenar formulario cuando se carga la factura
  useEffect(() => {
    if (factura) {
      const montoTotal =
        typeof factura.montoTotal === 'string'
          ? parseFloat(factura.montoTotal)
          : factura.montoTotal;

      // Normalizar el estado a minúsculas para asegurar que coincida
      const estadoNormalizado = factura.estado?.toLowerCase() || 'pendiente';

      reset({
        numFactura: factura.numFactura || '',
        estado: estadoNormalizado as FacturaEstado,
        montoTotal: montoTotal || 0,
        idFolio: 1, // Siempre 1, no se edita
      });
    }
  }, [factura, reset]);

  // Mutation para actualizar factura
  const updateFacturaMutation = useMutation({
    mutationFn: (data: FormValues) => updateFactura(Number(idFactura!), data),
    onSuccess: () => {
      toast.success('Factura actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['factura', idFactura] });
      navigate('/admin/facturas');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la factura', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
  });

  // Mutation para actualizar detalle
  const updateDetalleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacturaDetalleDto }) =>
      updateFacturaDetalle(id, data),
    onSuccess: () => {
      toast.success('Detalle actualizado exitosamente');
      refetchDetalles();
      queryClient.invalidateQueries({ queryKey: ['factura', idFactura] });
      setEditingDetalleId(null);
      setDetalleEditForm({});
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el detalle', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    // idFolio siempre es 1, no se edita
    updateFacturaMutation.mutate({
      ...data,
      idFolio: 1,
    });
  };

  const handleEditDetalle = (detalle: FacturaDetalle) => {
    setEditingDetalleId(detalle.idFacturaDetalle);
    setDetalleEditForm({
      cantidad: detalle.cantidad,
      precioUnitario:
        typeof detalle.precioUnitario === 'string'
          ? parseFloat(detalle.precioUnitario)
          : detalle.precioUnitario,
      subtotal:
        typeof detalle.subtotal === 'string'
          ? parseFloat(detalle.subtotal)
          : detalle.subtotal,
    });
  };

  const handleSaveDetalle = (id: number) => {
    if (!detalleEditForm.cantidad || !detalleEditForm.precioUnitario) {
      toast.error('Cantidad y precio unitario son requeridos');
      return;
    }

    // Calcular subtotal si no se proporciona
    const subtotal =
      detalleEditForm.subtotal ||
      detalleEditForm.cantidad * (detalleEditForm.precioUnitario || 0);

    updateDetalleMutation.mutate({
      id,
      data: {
        ...detalleEditForm,
        subtotal,
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingDetalleId(null);
    setDetalleEditForm({});
  };

  if (isLoadingFactura) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/facturas')}
            className="text-gray-600 hover:text-gray-900"
          >
            <MdArrowBack className="h-5 w-5 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">
              No se pudo cargar la factura
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/facturas')}
          className="text-gray-600 hover:text-gray-900 shrink-0"
        >
          <MdArrowBack className="h-5 w-5 mr-2" />
          Volver
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-linear-to-br from-[#50C878]/20 to-[#50C878]/10 rounded-lg border-2 border-[#50C878]/30">
              <MdReceipt className="h-6 w-6 text-[#50C878]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 truncate">
                Editar Factura
              </h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">
                {factura.numFactura}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de factura - Diseño Premium */}
      <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-200/60 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-[#50C878]/10 via-[#50C878]/5 to-transparent border-b border-gray-200/60 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdDescription className="h-5 w-5 text-[#50C878]" />
            Información de la Factura
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="numFactura"
                  className="text-sm font-semibold text-gray-700"
                >
                  Número de Factura *
                </Label>
                <Input
                  id="numFactura"
                  className="h-11 border-2 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
                  {...register('numFactura', {
                    required: 'El número de factura es requerido',
                  })}
                />
                {errors.numFactura && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.numFactura.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="estado"
                  className="text-sm font-semibold text-gray-700"
                >
                  Estado *
                </Label>
                <Select
                  value={
                    watch('estado')?.toLowerCase() ||
                    factura?.estado?.toLowerCase() ||
                    ''
                  }
                  onValueChange={(value) =>
                    setValue('estado', value as FacturaEstado, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger
                    id="estado"
                    className="h-11 bg-white border-2 border-gray-300 text-gray-900 hover:border-[#50C878] focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
                  >
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 shadow-xl z-50">
                    <SelectItem
                      value="pendiente"
                      className="hover:bg-[#50C878]/10 focus:bg-[#50C878]/10 cursor-pointer text-gray-900"
                    >
                      Pendiente
                    </SelectItem>
                    <SelectItem
                      value="pagado"
                      className="hover:bg-[#50C878]/10 focus:bg-[#50C878]/10 cursor-pointer text-gray-900"
                    >
                      Pagado
                    </SelectItem>
                    <SelectItem
                      value="anulada"
                      className="hover:bg-[#50C878]/10 focus:bg-[#50C878]/10 cursor-pointer text-gray-900"
                    >
                      Anulada
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="montoTotal"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <MdAttachMoney className="h-4 w-4 text-[#50C878]" />
                  Monto Total *
                </Label>
                <Input
                  id="montoTotal"
                  type="number"
                  step="0.01"
                  className="h-11 border-2 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
                  {...register('montoTotal', {
                    required: 'El monto total es requerido',
                    min: {
                      value: 0,
                      message: 'El monto debe ser mayor o igual a 0',
                    },
                    valueAsNumber: true,
                  })}
                />
                {errors.montoTotal && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.montoTotal.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/facturas')}
                className="w-full sm:w-auto h-11 border-2 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateFacturaMutation.isPending}
                className="bg-[#50C878] hover:bg-[#50C878]/90 text-white w-full sm:w-auto h-11 shadow-md shadow-[#50C878]/20"
              >
                <MdSave className="h-4 w-4 mr-2" />
                {updateFacturaMutation.isPending
                  ? 'Guardando...'
                  : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Detalles de factura - Diseño Premium */}
      <Card className="bg-white/95 backdrop-blur-md border-2 border-gray-200/60 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-[#50C878]/10 via-[#50C878]/5 to-transparent border-b border-gray-200/60 pb-4">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MdLocalFlorist className="h-5 w-5 text-[#50C878]" />
            Detalles de la Factura
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 md:p-6">
          {detalles && detalles.length > 0 ? (
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 border-b border-gray-200">
                      <TableHead className="min-w-[200px] font-semibold text-gray-900">
                        Arreglo
                      </TableHead>
                      <TableHead className="min-w-[100px] font-semibold text-gray-900 text-center">
                        Cantidad
                      </TableHead>
                      <TableHead className="min-w-[130px] font-semibold text-gray-900 text-right">
                        Precio Unitario
                      </TableHead>
                      <TableHead className="min-w-[120px] font-semibold text-gray-900 text-right">
                        Subtotal
                      </TableHead>
                      <TableHead className="min-w-[140px] sticky right-0 bg-gray-50/80 z-10 font-semibold text-gray-900 text-center">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalles.map((detalle) => (
                      <TableRow key={detalle.idFacturaDetalle}>
                        <TableCell>
                          {detalle.arreglo?.nombre ||
                            `Arreglo #${detalle.idArreglo}`}
                        </TableCell>
                        <TableCell>
                          {editingDetalleId === detalle.idFacturaDetalle ? (
                            <Input
                              type="number"
                              min="1"
                              value={detalleEditForm.cantidad || ''}
                              onChange={(e) =>
                                setDetalleEditForm({
                                  ...detalleEditForm,
                                  cantidad: parseInt(e.target.value, 10),
                                })
                              }
                              className="w-20"
                            />
                          ) : (
                            detalle.cantidad
                          )}
                        </TableCell>
                        <TableCell>
                          {editingDetalleId === detalle.idFacturaDetalle ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={detalleEditForm.precioUnitario || ''}
                              onChange={(e) =>
                                setDetalleEditForm({
                                  ...detalleEditForm,
                                  precioUnitario: parseFloat(e.target.value),
                                })
                              }
                              className="w-24"
                            />
                          ) : (
                            `$${
                              typeof detalle.precioUnitario === 'string'
                                ? parseFloat(detalle.precioUnitario).toFixed(2)
                                : detalle.precioUnitario.toFixed(2)
                            }`
                          )}
                        </TableCell>
                        <TableCell>
                          {editingDetalleId === detalle.idFacturaDetalle ? (
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={detalleEditForm.subtotal || ''}
                              onChange={(e) =>
                                setDetalleEditForm({
                                  ...detalleEditForm,
                                  subtotal: parseFloat(e.target.value),
                                })
                              }
                              className="w-24"
                            />
                          ) : (
                            `$${
                              typeof detalle.subtotal === 'string'
                                ? parseFloat(detalle.subtotal).toFixed(2)
                                : detalle.subtotal.toFixed(2)
                            }`
                          )}
                        </TableCell>
                        <TableCell className="sticky right-0 bg-white z-10 text-center">
                          {editingDetalleId === detalle.idFacturaDetalle ? (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleSaveDetalle(detalle.idFacturaDetalle!)
                                }
                                disabled={updateDetalleMutation.isPending}
                                className="text-xs sm:text-sm"
                              >
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="text-xs sm:text-sm"
                              >
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditDetalle(detalle)}
                              className="shrink-0"
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-center text-gray-500 py-4">
                No hay detalles para esta factura
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarFacturaPage;
