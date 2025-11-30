import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { Accesorio, CreateAccesorioDto, UpdateAccesorioDto } from '../types/accesorio.interface';
import { MdSave } from 'react-icons/md';
import { toast } from 'sonner';
import { CATEGORIAS_ACCESORIOS } from '@/shared/types/opciones.types';
import { validatePrecioAccesorio } from '@/shared/utils/validation';

interface AccesorioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accesorio?: Accesorio | null;
  onSubmit: (data: CreateAccesorioDto | UpdateAccesorioDto) => void;
  isLoading?: boolean;
}

interface FormValues {
  descripcion: string;
  precioUnitario: number;
  categoria: string;
}

export function AccesorioForm({
  open,
  onOpenChange,
  accesorio,
  onSubmit,
  isLoading = false,
}: AccesorioFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      descripcion: '',
      precioUnitario: 0,
      categoria: '',
    },
    mode: 'onChange',
  });

  const [precioInput, setPrecioInput] = useState('');

  useEffect(() => {
    if (accesorio) {
      const precio = typeof accesorio.precioUnitario === 'string' ? parseFloat(accesorio.precioUnitario) : accesorio.precioUnitario;
      reset({
        descripcion: accesorio.descripcion,
        precioUnitario: precio,
        categoria: accesorio.categoria,
      });
      setPrecioInput(precio.toString());
    } else {
      reset({
        descripcion: '',
        precioUnitario: 0,
        categoria: '',
      });
      setPrecioInput('');
    }
  }, [accesorio, open, reset]);

  const onSubmitForm = (data: FormValues) => {
    // Validar categoría
    if (!data.categoria || data.categoria.trim() === '') {
      toast.error('Debes seleccionar una categoría');
      return;
    }

    // Validar precio
    const precioError = validatePrecioAccesorio(data.precioUnitario);
    if (precioError) {
      toast.error(precioError);
      return;
    }

    const dataToSubmit = accesorio
      ? data
      : { ...data, estado: 'activo' as const };
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {accesorio ? 'Editar Accesorio' : 'Nuevo Accesorio'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {accesorio
              ? 'Modifica la información del accesorio'
              : 'Completa los datos para crear un nuevo accesorio'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-sm font-semibold text-gray-700">
              Descripción * (máximo 100 caracteres)
            </Label>
            <Input
              id="descripcion"
              {...register('descripcion', {
                required: 'La descripción es requerida',
                minLength: {
                  value: 2,
                  message: 'La descripción debe tener al menos 2 caracteres',
                },
                maxLength: {
                  value: 100,
                  message: 'La descripción debe tener máximo 100 caracteres',
                },
              })}
              placeholder="Cinta decorativa dorada"
              className="bg-white border-gray-300 text-gray-900"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {watch('descripcion')?.length || 0} / 100 caracteres
            </p>
            {errors.descripcion && (
              <p className="text-sm text-red-500 mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-sm font-semibold text-gray-700">
              Categoría *
            </Label>
            <Select
              value={watch('categoria')}
              onValueChange={(value) => {
                setValue('categoria', value, { shouldValidate: true });
              }}
              required
            >
              <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_ACCESORIOS.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && (
              <p className="text-sm text-red-500 mt-1">{errors.categoria.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="precioUnitario" className="text-sm font-semibold text-gray-700">
              Precio Unitario * (C$100 - C$300)
            </Label>
            <Input
              id="precioUnitario"
              type="text"
              inputMode="decimal"
              value={precioInput}
              onChange={(e) => {
                const value = e.target.value;
                // Permitir solo números y un punto decimal
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setPrecioInput(value);
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue >= 0) {
                    setValue('precioUnitario', numValue);
                  } else if (value === '') {
                    setValue('precioUnitario', 0);
                  }
                }
              }}
              placeholder="100.00"
              className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/40"
            />
            <p className="text-xs text-gray-500">Precio en córdobas (C$100 - C$300)</p>
            {errors.precioUnitario && (
              <p className="text-sm text-red-500 mt-1">{errors.precioUnitario.message}</p>
            )}
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-md shadow-[#50C878]/20 gap-2"
            >
              <MdSave className="h-4 w-4" />
              {isLoading
                ? accesorio
                  ? 'Guardando...'
                  : 'Creando...'
                : accesorio
                ? 'Guardar Cambios'
                : 'Crear Accesorio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
