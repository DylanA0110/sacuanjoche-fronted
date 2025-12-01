import { useEffect } from 'react';
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
import type {
  Empleado,
  CreateEmpleadoDto,
  UpdateEmpleadoDto,
} from '../types/empleado.interface';
import {
  sanitizeName,
  validateName,
  formatTelefono,
  validateTelefono,
  formatTelefonoForBackend,
  formatTelefonoForInput,
} from '@/shared/utils/validation';
import { toast } from 'sonner';

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
        telefono: formatTelefonoForInput(empleado.telefono || ''),
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

  const handleNombreChange = (
    field:
      | 'primerNombre'
      | 'segundoNombre'
      | 'primerApellido'
      | 'segundoApellido'
  ) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeName(e.target.value, 30);
      setValue(field, sanitized);
    };
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefono(e.target.value);
    setValue('telefono', formatted);
  };

  const onFormSubmit = (data: CreateEmpleadoDto) => {
    // Validar nombres
    const primerNombreError = validateName(
      data.primerNombre,
      'El primer nombre'
    );
    if (primerNombreError) {
      toast.error(primerNombreError);
      return;
    }

    const primerApellidoError = validateName(
      data.primerApellido,
      'El primer apellido'
    );
    if (primerApellidoError) {
      toast.error(primerApellidoError);
      return;
    }

    if (data.segundoNombre && data.segundoNombre.trim()) {
      const segundoNombreError = validateName(
        data.segundoNombre,
        'El segundo nombre'
      );
      if (segundoNombreError) {
        toast.error(segundoNombreError);
        return;
      }
    }

    if (data.segundoApellido && data.segundoApellido.trim()) {
      const segundoApellidoError = validateName(
        data.segundoApellido,
        'El segundo apellido'
      );
      if (segundoApellidoError) {
        toast.error(segundoApellidoError);
        return;
      }
    }

    // Validar teléfono
    const telefonoError = validateTelefono(data.telefono);
    if (telefonoError) {
      toast.error(telefonoError);
      return;
    }

    // Validar fecha (no puede ser en el futuro)
    if (data.fechaNac) {
      const fechaNac = new Date(data.fechaNac);
      const hoy = new Date();
      if (fechaNac > hoy) {
        toast.error('La fecha de nacimiento no puede ser en el futuro');
        return;
      }
    }

    // Formatear teléfono: agregar 505 internamente (el usuario solo escribe 8 dígitos)
    const telefonoBackend = formatTelefonoForBackend(data.telefono);

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
              <Label htmlFor="primerNombre">
                Primer Nombre * (2-30 letras, sin espacios)
              </Label>
              <Input
                id="primerNombre"
                {...register('primerNombre', {
                  required: 'El primer nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                  maxLength: {
                    value: 30,
                    message: 'El nombre debe tener máximo 30 caracteres',
                  },
                })}
                onChange={handleNombreChange('primerNombre')}
                onKeyDown={(e) => {
                  // Bloquear espacios y cualquier carácter que no sea letra
                  if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    return;
                  }
                  // Permitir teclas de control (Backspace, Delete, Arrow keys, etc.)
                  if (
                    e.key.length === 1 &&
                    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/.test(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text');
                  const sanitized = sanitizeName(text, 30);
                  setValue('primerNombre', sanitized);
                }}
                placeholder="Juan"
                maxLength={30}
              />
              {errors.primerNombre && (
                <p className="text-sm text-red-500">
                  {errors.primerNombre.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="segundoNombre">
                Segundo Nombre (2-30 letras, sin espacios)
              </Label>
              <Input
                id="segundoNombre"
                {...register('segundoNombre')}
                onChange={handleNombreChange('segundoNombre')}
                onKeyDown={(e) => {
                  // Bloquear espacios y cualquier carácter que no sea letra
                  if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    return;
                  }
                  // Permitir teclas de control (Backspace, Delete, Arrow keys, etc.)
                  if (
                    e.key.length === 1 &&
                    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/.test(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text');
                  const sanitized = sanitizeName(text, 30);
                  setValue('segundoNombre', sanitized);
                }}
                placeholder="Pedro"
                maxLength={30}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primerApellido">
                Primer Apellido * (2-30 letras, sin espacios)
              </Label>
              <Input
                id="primerApellido"
                {...register('primerApellido', {
                  required: 'El primer apellido es requerido',
                  minLength: {
                    value: 2,
                    message: 'El apellido debe tener al menos 2 caracteres',
                  },
                  maxLength: {
                    value: 30,
                    message: 'El apellido debe tener máximo 30 caracteres',
                  },
                })}
                onChange={handleNombreChange('primerApellido')}
                onKeyDown={(e) => {
                  // Bloquear espacios y cualquier carácter que no sea letra
                  if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    return;
                  }
                  // Permitir teclas de control (Backspace, Delete, Arrow keys, etc.)
                  if (
                    e.key.length === 1 &&
                    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/.test(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text');
                  const sanitized = sanitizeName(text, 30);
                  setValue('primerApellido', sanitized);
                }}
                placeholder="Pérez"
                maxLength={30}
              />
              {errors.primerApellido && (
                <p className="text-sm text-red-500">
                  {errors.primerApellido.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="segundoApellido">
                Segundo Apellido (2-30 letras, sin espacios)
              </Label>
              <Input
                id="segundoApellido"
                {...register('segundoApellido')}
                onChange={handleNombreChange('segundoApellido')}
                onKeyDown={(e) => {
                  // Bloquear espacios y cualquier carácter que no sea letra
                  if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    return;
                  }
                  // Permitir teclas de control (Backspace, Delete, Arrow keys, etc.)
                  if (
                    e.key.length === 1 &&
                    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/.test(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const text = e.clipboardData.getData('text');
                  const sanitized = sanitizeName(text, 30);
                  setValue('segundoApellido', sanitized);
                }}
                placeholder="González"
                maxLength={30}
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
              <Label htmlFor="telefono">Teléfono * (8 dígitos)</Label>
              <div className="flex items-center">
                <div className="flex items-center justify-center h-11 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm font-medium text-gray-700">
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
                  className="bg-white border-gray-300 text-gray-900 h-11 text-base rounded-l-none"
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>
              {errors.telefono && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaNac">Fecha de Nacimiento *</Label>
              <Input
                id="fechaNac"
                type="date"
                {...register('fechaNac', {
                  required: 'La fecha de nacimiento es requerida',
                  validate: (value) => {
                    if (!value) return true;
                    const fecha = new Date(value);
                    const hoy = new Date();
                    hoy.setHours(23, 59, 59, 999);
                    if (fecha > hoy) {
                      return 'La fecha de nacimiento no puede ser en el futuro';
                    }
                    return true;
                  },
                })}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.fechaNac && (
                <p className="text-sm text-red-500">
                  {errors.fechaNac.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={watch('estado')}
                onValueChange={(value) =>
                  setValue('estado', value as 'activo' | 'inactivo')
                }
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
              {isLoading ? 'Guardando...' : empleado ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
