import { useState, useEffect } from 'react';
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
import type { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../types/empleado.interface';

interface EmpleadoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleado?: Empleado | null;
  onSubmit: (data: CreateEmpleadoDto | UpdateEmpleadoDto) => void;
  isLoading?: boolean;
}

export function EmpleadoForm({
  open,
  onOpenChange,
  empleado,
  onSubmit,
  isLoading = false,
}: EmpleadoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEmpleadoDto>({
    defaultValues: {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      sexo: 'M',
      telefono: '',
      fechaNac: '',
      estado: 'activo',
    },
  });

  const sexo = watch('sexo');

  useEffect(() => {
    if (empleado) {
      reset({
        primerNombre: empleado.primerNombre || '',
        segundoNombre: empleado.segundoNombre || '',
        primerApellido: empleado.primerApellido || '',
        segundoApellido: empleado.segundoApellido || '',
        sexo: (empleado.sexo as 'M' | 'F') || 'M',
        telefono: empleado.telefono || '',
        fechaNac: empleado.fechaNac ? empleado.fechaNac.split('T')[0] : '',
        estado: empleado.estado || 'activo',
      });
    } else {
      reset({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        sexo: 'M',
        telefono: '',
        fechaNac: '',
        estado: 'activo',
      });
    }
  }, [empleado, reset, open]);

  const formatTelefono = (value: string) => {
    // Remover todo excepto números
    const cleaned = value.replace(/\D/g, '');
    // Si empieza con 505, removerlo
    if (cleaned.startsWith('505') && cleaned.length > 3) {
      return cleaned.slice(3);
    }
    return cleaned.slice(0, 8);
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefono(e.target.value);
    setValue('telefono', formatted);
  };

  const onFormSubmit = (data: CreateEmpleadoDto) => {
    // Formatear teléfono: agregar 505 si no lo tiene
    const telefonoLimpio = data.telefono.replace(/\D/g, '');
    const telefonoBackend = telefonoLimpio.length === 8 ? `505${telefonoLimpio}` : telefonoLimpio;
    
    onSubmit({
      ...data,
      telefono: telefonoBackend,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {empleado ? 'Editar Empleado' : 'Crear Empleado'}
          </DialogTitle>
          <DialogDescription>
            {empleado
              ? 'Modifica la información del empleado'
              : 'Completa los datos para crear un nuevo empleado'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primerNombre">Primer Nombre *</Label>
              <Input
                id="primerNombre"
                {...register('primerNombre', {
                  required: 'El primer nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                })}
                placeholder="Juan"
              />
              {errors.primerNombre && (
                <p className="text-sm text-red-500">{errors.primerNombre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="segundoNombre">Segundo Nombre</Label>
              <Input
                id="segundoNombre"
                {...register('segundoNombre')}
                placeholder="Pedro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primerApellido">Primer Apellido *</Label>
              <Input
                id="primerApellido"
                {...register('primerApellido', {
                  required: 'El primer apellido es requerido',
                  minLength: {
                    value: 2,
                    message: 'El apellido debe tener al menos 2 caracteres',
                  },
                })}
                placeholder="Pérez"
              />
              {errors.primerApellido && (
                <p className="text-sm text-red-500">{errors.primerApellido.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="segundoApellido">Segundo Apellido</Label>
              <Input
                id="segundoApellido"
                {...register('segundoApellido')}
                placeholder="González"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo *</Label>
              <Select
                value={sexo}
                onValueChange={(value) => setValue('sexo', value as 'M' | 'F')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                  +505
                </div>
                <Input
                  id="telefono"
                  type="tel"
                  {...register('telefono', {
                    required: 'El teléfono es requerido',
                    pattern: {
                      value: /^\d{8}$/,
                      message: 'El teléfono debe tener 8 dígitos',
                    },
                  })}
                  onChange={handleTelefonoChange}
                  className="pl-14"
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>
              {errors.telefono && (
                <p className="text-sm text-red-500">{errors.telefono.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNac">Fecha de Nacimiento *</Label>
              <Input
                id="fechaNac"
                type="date"
                {...register('fechaNac', {
                  required: 'La fecha de nacimiento es requerida',
                })}
              />
              {errors.fechaNac && (
                <p className="text-sm text-red-500">{errors.fechaNac.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={watch('estado')}
                onValueChange={(value) => setValue('estado', value as 'activo' | 'inactivo')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Guardando...'
                : empleado
                ? 'Actualizar'
                : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

