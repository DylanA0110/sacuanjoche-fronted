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
import type { Flor, CreateFlorDto, UpdateFlorDto } from '../types/flor.interface';
import { MdSave } from 'react-icons/md';

interface FlorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flor?: Flor | null;
  onSubmit: (data: CreateFlorDto | UpdateFlorDto) => void;
  isLoading?: boolean;
}

interface FormValues {
  nombre: string;
  color: string;
  precioUnitario: number;
  tipo: string;
}

export function FlorForm({
  open,
  onOpenChange,
  flor,
  onSubmit,
  isLoading = false,
}: FlorFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: '',
      color: '',
      precioUnitario: 0,
      tipo: '',
    },
  });

  const precioUnitario = watch('precioUnitario');
  const [precioInput, setPrecioInput] = useState('');

  useEffect(() => {
    if (flor) {
      const precio = typeof flor.precioUnitario === 'string' ? parseFloat(flor.precioUnitario) : flor.precioUnitario;
      reset({
        nombre: flor.nombre,
        color: flor.color,
        precioUnitario: precio,
        tipo: flor.tipo,
      });
      setPrecioInput(precio.toString());
    } else {
      reset({
        nombre: '',
        color: '',
        precioUnitario: 0,
        tipo: '',
      });
      setPrecioInput('');
    }
  }, [flor, open, reset]);

  const onSubmitForm = (data: FormValues) => {
    const dataToSubmit = flor
      ? data
      : { ...data, estado: 'activo' as const };
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {flor ? 'Editar Flor' : 'Nueva Flor'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {flor
              ? 'Modifica la información de la flor'
              : 'Completa los datos para crear una nueva flor'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-semibold text-gray-700">
              Nombre *
            </Label>
            <Input
              id="nombre"
              {...register('nombre', {
                required: 'El nombre es requerido',
              })}
              placeholder="Rosa"
              className="bg-white border-gray-300 text-gray-900"
            />
            {errors.nombre && (
              <p className="text-sm text-red-500 mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-semibold text-gray-700">
              Color *
            </Label>
            <Input
              id="color"
              {...register('color', {
                required: 'El color es requerido',
              })}
              placeholder="Rojo"
              className="bg-white border-gray-300 text-gray-900"
            />
            {errors.color && (
              <p className="text-sm text-red-500 mt-1">{errors.color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo" className="text-sm font-semibold text-gray-700">
              Tipo *
            </Label>
            <Input
              id="tipo"
              {...register('tipo', {
                required: 'El tipo es requerido',
              })}
              placeholder="Tropical"
              className="bg-white border-gray-300 text-gray-900"
            />
            {errors.tipo && (
              <p className="text-sm text-red-500 mt-1">{errors.tipo.message}</p>
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
              placeholder="100.00 C$"
              className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/20"
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
                ? flor
                  ? 'Guardando...'
                  : 'Creando...'
                : flor
                ? 'Guardar Cambios'
                : 'Crear Flor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

