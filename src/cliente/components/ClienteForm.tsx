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
import {
  sanitizeName,
  validateName,
  formatTelefono,
  validateTelefono,
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

interface FormValues {
  primerNombre: string;
  primerApellido: string;
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
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      primerNombre: '',
      primerApellido: '',
      telefono: '',
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

  const handleNombreChange = (field: 'primerNombre' | 'primerApellido') => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeName(e.target.value, 30);
      setValue(field, sanitized);
    };
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefono(e.target.value);
    setValue('telefono', formatted);
  };

  useEffect(() => {
    if (cliente) {
      reset({
        primerNombre: cliente.primerNombre,
        primerApellido: cliente.primerApellido,
        telefono: cliente.telefono,
        direccionTexto: '',
        referencia: '',
        etiquetaDireccion: 'Casa',
        esPredeterminada: true,
      });
    } else {
      reset({
        primerNombre: '',
        primerApellido: '',
        telefono: '',
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

    // Validar teléfono
    const telefonoError = validateTelefono(data.telefono);
    if (telefonoError) {
      toast.error(telefonoError);
      return;
    }

    // Formatear teléfono: agregar 505 si no lo tiene
    const telefonoLimpio = data.telefono.replace(/\D/g, '');
    const telefonoBackend =
      telefonoLimpio.length === 8 ? `505${telefonoLimpio}` : telefonoLimpio;

    const dataToSubmit = cliente
      ? {
          primerNombre: data.primerNombre,
          primerApellido: data.primerApellido,
          telefono: telefonoBackend,
        }
      : {
          primerNombre: data.primerNombre,
          primerApellido: data.primerApellido,
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

                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="telefono"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Teléfono * (8 dígitos)
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-600 pointer-events-none z-10">
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
                      className="bg-white border-gray-300 text-gray-900 h-11 text-base pl-14"
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
                  onChange={(value) => setValue('direccionTexto', value)}
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
