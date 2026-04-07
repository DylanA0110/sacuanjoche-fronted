import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
  Cliente,
  CreateClienteDto,
  UpdateClienteDto,
} from '../types/cliente.interface';
import {
  MapboxAddressSearch,
  type MapboxAddressData as MapboxData,
} from '@/shared/components/Custom/MapboxAddressSearch';
import { MdSave, MdLocationOn } from 'react-icons/md';
import { toast } from 'sonner';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { parsePhoneNumber } from 'libphonenumber-js';
import {
  sanitizeName,
  validateName,
} from '@/shared/utils/validation';

interface ClienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente | null;
  onSubmit: (
    data: CreateClienteDto | UpdateClienteDto,
    direccionData?: MapboxAddressData & {
      etiqueta: string;
      esPredeterminada: boolean;
    }
  ) => void;
  isLoading?: boolean;
}

// Usar la interfaz del componente MapboxAddressSearch
type MapboxAddressData = MapboxData;

const DEFAULT_NI_PHONE_PREFIX = '+505';

const normalizePhoneForInput = (telefono?: string | null): string | undefined => {
  if (!telefono) return undefined;
  const trimmed = telefono.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('+')) return trimmed;

  const digits = trimmed.replace(/\D/g, '');
  return digits ? `+${digits}` : undefined;
};

const formatPhoneForBackend = (telefono: string): string | null => {
  const parsedPhone = parsePhoneNumber(telefono);
  if (!parsedPhone) return null;

  const nationalNumber = parsedPhone.nationalNumber || '';
  if (nationalNumber.length !== 8) {
    return null;
  }

  return `${parsedPhone.countryCallingCode}${nationalNumber}`;
};

interface FormValues {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  nombreEmpresa: string;
  telefono: string;
  direccionTexto: string;
  referencia: string;
  etiquetaDireccion: string;
  esPredeterminada: boolean;
}

export function ClienteForm({
  open,
  onOpenChange,
  cliente,
  onSubmit,
  isLoading = false,
}: ClienteFormProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      nombreEmpresa: '',
      telefono: DEFAULT_NI_PHONE_PREFIX,
      direccionTexto: '',
      referencia: '',
      etiquetaDireccion: 'Casa',
      esPredeterminada: true,
    },
  });

  const formValues = watch();

  // Estado para la dirección (Mapbox data)
  const [direccionData, setDireccionData] = useState<MapboxAddressData | null>(
    null
  );

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

  useEffect(() => {
    if (cliente) {
      reset({
        primerNombre: cliente.primerNombre,
        segundoNombre: cliente.segundoNombre || '',
        primerApellido: cliente.primerApellido,
        segundoApellido: cliente.segundoApellido || '',
        nombreEmpresa: cliente.nombreEmpresa || '',
        telefono: normalizePhoneForInput(cliente.telefono) || DEFAULT_NI_PHONE_PREFIX,
        direccionTexto: '',
        referencia: '',
        etiquetaDireccion: 'Casa',
        esPredeterminada: true,
      });
    } else {
      reset({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        nombreEmpresa: '',
        telefono: DEFAULT_NI_PHONE_PREFIX,
        direccionTexto: '',
        referencia: '',
        etiquetaDireccion: 'Casa',
        esPredeterminada: true,
      });
    }
    setDireccionData(null);
  }, [cliente, open, reset]);

  const onSubmitForm = async (data: FormValues) => {
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

    if (data.segundoNombre.trim()) {
      const segundoNombreError = validateName(
        data.segundoNombre,
        'El segundo nombre'
      );
      if (segundoNombreError) {
        toast.error(segundoNombreError);
        return;
      }
    }

    if (data.segundoApellido.trim()) {
      const segundoApellidoError = validateName(
        data.segundoApellido,
        'El segundo apellido'
      );
      if (segundoApellidoError) {
        toast.error(segundoApellidoError);
        return;
      }
    }

    if (!data.telefono) {
      toast.error('El teléfono es requerido');
      return;
    }

    if (!isValidPhoneNumber(data.telefono)) {
      toast.error('El teléfono no es válido para el país seleccionado');
      return;
    }

    const telefonoBackend = formatPhoneForBackend(data.telefono);
    if (!telefonoBackend) {
      toast.error('El teléfono debe tener el formato código de país seguido de 8 dígitos');
      return;
    }

    const dataToSubmit = cliente
      ? {
          primerNombre: data.primerNombre,
          segundoNombre: data.segundoNombre.trim() || undefined,
          primerApellido: data.primerApellido,
          segundoApellido: data.segundoApellido.trim() || undefined,
          nombreEmpresa: data.nombreEmpresa.trim() || undefined,
          telefono: telefonoBackend,
        }
      : {
          primerNombre: data.primerNombre,
          segundoNombre: data.segundoNombre.trim() || undefined,
          primerApellido: data.primerApellido,
          segundoApellido: data.segundoApellido.trim() || undefined,
          nombreEmpresa: data.nombreEmpresa.trim() || undefined,
          telefono: telefonoBackend,
          estado: 'activo' as const,
        };

    // Si hay datos de dirección (crear o editar), pasar también los datos de dirección
    if (direccionData) {
      onSubmit(dataToSubmit, {
        ...direccionData,
        referencia: data.referencia || direccionData.referencia,
        etiqueta: data.etiquetaDireccion,
        esPredeterminada: data.esPredeterminada,
      });
    } else {
      onSubmit(dataToSubmit);
    }
  };

  // Función para manejar datos de dirección desde Mapbox
  const handleDireccionChange = (data: MapboxAddressData) => {
    setDireccionData(data);
    setValue('direccionTexto', data.formattedAddress);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-gray-900">
              {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              {cliente
                ? 'Modifica la información del cliente'
                : 'Completa los datos para crear un nuevo cliente'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* Información Básica */}
            <div className="bg-linear-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-linear-to-b from-[#50C878] to-[#3aa85c] rounded-full"></span>
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="primerNombre"
                    className="text-sm font-semibold text-gray-700"
                  >
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
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                    maxLength={30}
                  />
                  {errors.primerNombre && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.primerNombre.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="segundoNombre"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Segundo Nombre (Opcional, 2-30 letras)
                  </Label>
                  <Input
                    id="segundoNombre"
                    {...register('segundoNombre', {
                      validate: (value) => {
                        if (!value || !value.trim()) return true;
                        if (value.length < 2) {
                          return 'El segundo nombre debe tener al menos 2 caracteres';
                        }
                        if (value.length > 30) {
                          return 'El segundo nombre debe tener máximo 30 caracteres';
                        }
                        return true;
                      },
                    })}
                    onChange={handleNombreChange('segundoNombre')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Spacebar') {
                        e.preventDefault();
                        return;
                      }
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
                    placeholder="Carlos"
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                    maxLength={30}
                  />
                  {errors.segundoNombre && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.segundoNombre.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="primerApellido"
                    className="text-sm font-semibold text-gray-700"
                  >
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
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                    maxLength={30}
                  />
                  {errors.primerApellido && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.primerApellido.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="segundoApellido"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Segundo Apellido (Opcional, 2-30 letras)
                  </Label>
                  <Input
                    id="segundoApellido"
                    {...register('segundoApellido', {
                      validate: (value) => {
                        if (!value || !value.trim()) return true;
                        if (value.length < 2) {
                          return 'El segundo apellido debe tener al menos 2 caracteres';
                        }
                        if (value.length > 30) {
                          return 'El segundo apellido debe tener máximo 30 caracteres';
                        }
                        return true;
                      },
                    })}
                    onChange={handleNombreChange('segundoApellido')}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Spacebar') {
                        e.preventDefault();
                        return;
                      }
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
                    placeholder="Lopez"
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                    maxLength={30}
                  />
                  {errors.segundoApellido && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.segundoApellido.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="nombreEmpresa"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Nombre de la Compañía (Opcional)
                  </Label>
                  <Input
                    id="nombreEmpresa"
                    {...register('nombreEmpresa', {
                      maxLength: {
                        value: 120,
                        message:
                          'El nombre de la compañía debe tener máximo 120 caracteres',
                      },
                    })}
                    placeholder="Floristeria Centro"
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                    maxLength={120}
                  />
                  {errors.nombreEmpresa && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.nombreEmpresa.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="telefono"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Teléfono *
                  </Label>
                  <Controller
                    name="telefono"
                    control={control}
                    rules={{
                      required: 'El teléfono es requerido',
                      validate: (value) =>
                        !value || isValidPhoneNumber(value)
                          ? true
                          : 'El teléfono no es válido para el país seleccionado',
                    }}
                    render={({ field }) => (
                      <PhoneInput
                        id="telefono"
                        international
                        defaultCountry="NI"
                        value={field.value || undefined}
                        onChange={(value) => field.onChange(value || '')}
                        className="phone-input-wrapper"
                        numberInputProps={{
                          className:
                            'phone-input-field bg-white border-gray-300 text-gray-900 h-11 text-base',
                          placeholder: 'Ej: +505 1234 5678',
                        }}
                      />
                    )}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.telefono.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sección de Dirección */}
            <div className="bg-linear-to-br from-blue-50/50 to-green-50/50 rounded-xl p-6 border border-gray-200 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-[#50C878] to-[#3aa85c] rounded-lg">
                  <MdLocationOn className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-lg font-bold text-gray-900">
                    Dirección {!cliente && '(Opcional)'}
                  </Label>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Busca y selecciona la ubicación del cliente
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="direccionTexto"
                  className="text-sm font-semibold text-gray-700"
                >
                  Buscar Dirección
                </Label>
                <MapboxAddressSearch
                  value={formValues.direccionTexto}
                  onChange={(value) => {
                    setValue('direccionTexto', value);
                    if (!value.trim()) {
                      setDireccionData(null);
                    }
                  }}
                  onSelect={handleDireccionChange}
                  placeholder="Escribe una dirección en Nicaragua..."
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/40"
                  showMap={true}
                  mapHeight="300px"
                />
              </div>

              {direccionData && (
                <>
                  <div className="p-4 bg-white rounded-lg border-2 border-[#50C878]/20 shadow-sm space-y-3">
                    <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <MdLocationOn className="h-5 w-5 text-[#50C878]" />
                      {direccionData.formattedAddress}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">
                          Ciudad:
                        </span>
                        <span>{direccionData.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">
                          País:
                        </span>
                        <span>{direccionData.country}</span>
                      </div>
                      {direccionData.neighborhood && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">
                            Barrio:
                          </span>
                          <span>{direccionData.neighborhood}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="referencia"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Referencia (Opcional)
                      </Label>
                      <Input
                        id="referencia"
                        {...register('referencia')}
                        placeholder="Ej: Cerca del parque central, casa color azul..."
                        className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="etiqueta"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Etiqueta de la Dirección
                      </Label>
                      <Select
                        value={formValues.etiquetaDireccion}
                        onValueChange={(value) =>
                          setValue('etiquetaDireccion', value)
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-11 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Casa">Casa</SelectItem>
                          <SelectItem value="Trabajo">Trabajo</SelectItem>
                          <SelectItem value="Otra">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="esPredeterminada"
                      {...register('esPredeterminada')}
                      className="w-5 h-5 text-[#50C878] border-gray-300 rounded focus:ring-[#50C878] cursor-pointer"
                    />
                    <Label
                      htmlFor="esPredeterminada"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Marcar como dirección predeterminada
                    </Label>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="gap-3 pt-6 border-t border-gray-200 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 h-11 px-6 text-base font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-linear-to-r from-[#50C878] to-[#3aa85c] hover:from-[#50C878]/90 hover:to-[#3aa85c]/90 text-white shadow-md shadow-[#50C878]/20 gap-2 h-11 px-6 text-base font-semibold transition-colors duration-150 font-sans rounded-lg"
              >
                <MdSave className="h-5 w-5" />
                {isLoading
                  ? cliente
                    ? 'Guardando...'
                    : 'Creando...'
                  : cliente
                  ? 'Guardar Cambios'
                  : 'Crear Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
