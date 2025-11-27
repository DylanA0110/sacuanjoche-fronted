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
import type { Accesorio, CreateAccesorioDto, UpdateAccesorioDto } from '../types/accesorio.interface';
import { MdSave } from 'react-icons/md';

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
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      descripcion: '',
      precioUnitario: 0,
      categoria: '',
    },
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
              Descripción *
            </Label>
            <Input
              id="descripcion"
              {...register('descripcion', {
                required: 'La descripción es requerida',
              })}
              placeholder="Cinta decorativa dorada"
              className="bg-white border-gray-300 text-gray-900"
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500 mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria" className="text-sm font-semibold text-gray-700">
              Categoría *
            </Label>
            <Input
              id="categoria"
              {...register('categoria', {
                required: 'La categoría es requerida',
              })}
              placeholder="Decoración"
              className="bg-white border-gray-300 text-gray-900"
            />
            {errors.categoria && (
              <p className="text-sm text-red-500 mt-1">{errors.categoria.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="precioUnitario" className="text-sm font-semibold text-gray-700">
              Precio Unitario *
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
              placeholder="2.50 C$"
              className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/40"
            />
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

