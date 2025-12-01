import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useCarrito } from '../hooks/useCarrito';
import { useAuthStore } from '@/auth/store/auth.store';
import { getClienteDirecciones } from '@/cliente/actions/getClienteDirecciones';
import { createContactoEntrega } from '@/pedido/actions/createContactoEntrega';
import { crearPedidoDesdeCarrito } from '../actions/crearPedidoDesdeCarrito';
import { createDireccion } from '@/cliente/actions/createDireccion';
import { createClienteDireccion } from '@/cliente/actions/createClienteDireccion';
import {
  MapboxAddressSearch,
  type MapboxAddressData,
} from '@/shared/components/Custom/MapboxAddressSearch';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { MdCheckCircle, MdLocationOn, MdPerson } from 'react-icons/md';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClienteDireccion } from '@/cliente/types/direccion.interface';
import type { CreateDireccionDto } from '@/cliente/types/direccion.interface';
import type { Carrito } from '../types/carrito.interface';
import {
  formatTelefono,
  validateTelefono,
  formatTelefonoForBackend,
} from '@/shared/utils/validation';

interface CompletarPedidoFormData {
  idDireccion: string;
  idContactoEntrega?: string;
  contactoNombre: string;
  contactoApellido: string;
  contactoTelefono: string;
  direccionTxt: string;
}

export default function CompletarPedidoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { carrito, subtotal, itemCount, refetch, isLoading: isLoadingCarrito } = useCarrito();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Ref para evitar ejecuciones múltiples del useEffect
  const verificandoRef = useRef(false);

  // Estado para Mapbox
  const [direccionData, setDireccionData] = useState<MapboxAddressData | null>(null);
  const [mapboxSearchValue, setMapboxSearchValue] = useState('');
  const [usarDireccionGuardada, setUsarDireccionGuardada] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompletarPedidoFormData>({
    defaultValues: {
      idDireccion: '',
      contactoNombre: '',
      contactoApellido: '',
      contactoTelefono: '',
      direccionTxt: '',
    },
  });

  const idCliente = user?.cliente?.idCliente;

  // Obtener direcciones del cliente
  const { data: direccionesData, isLoading: isLoadingDirecciones } = useQuery({
    queryKey: ['clienteDirecciones', idCliente],
    queryFn: () => getClienteDirecciones({ idCliente: idCliente!, limit: 100 }),
    enabled: !!idCliente,
  });

  const direcciones: ClienteDireccion[] = Array.isArray(direccionesData)
    ? direccionesData
    : direccionesData?.data || [];

  const direccionSeleccionada = watch('idDireccion');
  const direccionCompleta = direcciones.find(
    (d) => d.idDireccion?.toString() === direccionSeleccionada
  );

  // Manejar selección de dirección desde Mapbox
  const handleDireccionChange = useCallback((data: MapboxAddressData) => {
    setDireccionData(data);
    setMapboxSearchValue(data.formattedAddress);
    setValue('direccionTxt', data.formattedAddress);
    setUsarDireccionGuardada(false);
  }, [setValue]);

  // Handler para formatear teléfono
  const handleContactoTelefonoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTelefono(e.target.value);
      setValue('contactoTelefono', formatted);
    },
    [setValue]
  );

  // Actualizar dirección de texto cuando se selecciona una dirección guardada
  useEffect(() => {
    if (direccionCompleta?.direccion && usarDireccionGuardada) {
      setValue('direccionTxt', direccionCompleta.direccion.formattedAddress || '');
      setDireccionData(null);
      setMapboxSearchValue('');
    }
  }, [direccionSeleccionada, direccionCompleta, setValue, usarDireccionGuardada]);

  // Verificar el estado del pago al cargar la página
  useEffect(() => {
    // Evitar ejecuciones múltiples
    if (verificandoRef.current) {
      return;
    }

    // Esperar a que el carrito se cargue
    if (isLoadingCarrito) {
      return;
    }

    // Si no hay carrito, no hacer nada (el componente mostrará loading)
    if (!carrito) {
      return;
    }

    // Type assertion para ayudar a TypeScript
    const carritoTyped = carrito as Carrito;

    // Si el carrito no tiene productos, es un carrito nuevo - redirigir al checkout para agregar productos
    if (!carritoTyped.carritosArreglo || carritoTyped.carritosArreglo.length === 0) {
      toast.error('Tu carrito está vacío. Agrega productos antes de pagar.');
      navigate('/carrito/checkout', { replace: true });
      return;
    }

    const verificarPago = async () => {
      verificandoRef.current = true;
      setIsVerifying(true);
      
      // Si no hay idPago, redirigir al checkout para crear un nuevo pago
      if (!carritoTyped.idPago) {
        toast.error('Debes completar el pago primero');
        navigate('/carrito/checkout', { replace: true });
        verificandoRef.current = false;
        return;
      }
      
      // Verificar que el pago esté REALMENTE confirmado (estado "pagado")
      // Si tiene idPago pero no está pagado, es un pago anterior o pendiente - redirigir a checkout
      const pagoEstado = carritoTyped.pago?.estado as string | undefined;
      if (pagoEstado === 'pagado') {
        setIsVerifying(false);
        verificandoRef.current = false;
        return;
      }
      
      // Si tiene idPago pero el pago no está confirmado, redirigir a checkout para crear nuevo pago
      if (carritoTyped.idPago && carritoTyped.pago && pagoEstado !== 'pagado') {
        toast.error('El pago anterior no está confirmado. Debes crear un nuevo pago.');
        navigate('/carrito/checkout', { replace: true });
        verificandoRef.current = false;
        return;
      }
      
      // Si no tenemos información del pago pero sí tenemos idPago, intentar obtenerla (solo una vez)
      if (!carritoTyped.pago && carritoTyped.idPago) {
        let intentos = 0;
        const maxIntentos = 3;
        
        while (intentos < maxIntentos) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const carritoRefetch = await refetch();
          
          const carritoRefetchTyped = carritoRefetch.data as Carrito | undefined;
          
          if (carritoRefetchTyped?.pago) {
            const refetchPagoEstado = carritoRefetchTyped.pago.estado as string;
            if (refetchPagoEstado === 'pagado') {
              setIsVerifying(false);
              verificandoRef.current = false;
              return;
            }
            break;
          }
          
          intentos++;
        }
      } else if (carritoTyped.pago && pagoEstado !== 'pagado') {
        toast.error('El pago debe estar confirmado antes de completar el pedido');
        navigate('/carrito/checkout', { replace: true });
        verificandoRef.current = false;
        return;
      }
      
      setIsVerifying(false);
      verificandoRef.current = false;
    };
    
    verificarPago();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingCarrito, (carrito as Carrito)?.idCarrito, (carrito as Carrito)?.idPago, navigate, refetch]); // Solo cuando cambia el idCarrito o idPago

  const onSubmit = async (data: CompletarPedidoFormData) => {
    // Validaciones según la documentación
    if (!carrito) {
      toast.error('El carrito no está disponible');
      return;
    }

    // Type assertion para ayudar a TypeScript
    const carritoTyped = carrito as Carrito;

    // Validar que el carrito tenga productos
    if (!carritoTyped.carritosArreglo || carritoTyped.carritosArreglo.length === 0) {
      toast.error('El carrito no tiene productos. Agrega productos antes de crear el pedido.');
      return;
    }

    // Validar que el carrito tenga un pago asociado
    if (!carritoTyped.idPago) {
      toast.error('El carrito no tiene un pago asociado. Debes completar el pago primero.');
      navigate('/carrito/checkout', { replace: true });
      return;
    }

    // Validar que el pago esté en estado PAGADO (solo si tenemos la información del pago)
    // Si no tenemos la información pero sí tenemos idPago, permitir continuar (el backend validará)
    if (carritoTyped.pago && carritoTyped.pago.estado !== 'pagado') {
      toast.error('El pago debe estar completado antes de crear el pedido.');
      navigate('/carrito/checkout', { replace: true });
      return;
    }
    
    // Si tenemos idPago pero no información del pago, hacer un último refetch antes de continuar
    if (carritoTyped.idPago && !carritoTyped.pago) {
      const carritoActualizado = await refetch();
      
      const carritoActualizadoTyped = carritoActualizado.data as Carrito | undefined;
      
      if (carritoActualizadoTyped?.pago && carritoActualizadoTyped.pago.estado !== 'pagado') {
        toast.error('El pago debe estar completado antes de crear el pedido.');
        navigate('/carrito/checkout', { replace: true });
        return;
      }
    }

    setIsProcessing(true);

    try {
      let idDireccionFinal: number;

      // Si se seleccionó una dirección desde el mapa (nueva dirección)
      if (direccionData && !usarDireccionGuardada) {
        // Convertir coordenadas
        const lat = parseFloat(direccionData.lat);
        const lng = parseFloat(direccionData.lng);

        if (isNaN(lat) || isNaN(lng)) {
          throw new Error('Las coordenadas de la dirección no son válidas');
        }

        // Crear la dirección - asegurar que todos los campos requeridos estén presentes
        // Validar que formattedAddress no esté vacío
        if (!direccionData.formattedAddress || direccionData.formattedAddress.trim() === '') {
          throw new Error('La dirección debe tener una dirección formateada válida');
        }

        // Limpiar y preparar los datos de la dirección
        // Asegurar que todos los campos string tengan valores válidos
        const direccionDto: CreateDireccionDto = {
          formattedAddress: (direccionData.formattedAddress || '').trim(),
          country: (direccionData.country || 'NIC').trim(),
          stateProv: direccionData.adminArea ? direccionData.adminArea.trim() : null,
          city: (direccionData.city || '').trim(),
          neighborhood: (direccionData.neighborhood || '').trim(),
          street: (direccionData.street || '').trim(),
          houseNumber: (direccionData.houseNumber || '').trim(),
          postalCode: (direccionData.postalCode || '').trim(),
          referencia: (direccionData.referencia || '').trim(),
          lat: lat,
          lng: lng,
          provider: (direccionData.provider || 'MAP BOX').trim(),
          placeId: (direccionData.placeId || '').trim(),
          accuracy: (direccionData.accuracy || 'ROOFTOP').trim(),
          geolocation: direccionData.geolocation || JSON.stringify({
            accuracy: 10,
            timestamp: Date.now(),
            coordinates: [lng, lat],
          }),
          activo: true,
        };
        
        try {
          const nuevaDireccion = await createDireccion(direccionDto);
          
          // Asociar la dirección al cliente
          if (idCliente && nuevaDireccion.idDireccion) {
            await createClienteDireccion({
              idCliente,
              idDireccion: nuevaDireccion.idDireccion,
              etiqueta: 'Entrega',
              esPredeterminada: false,
            });
          }

          idDireccionFinal = nuevaDireccion.idDireccion!;
        } catch (error: unknown) {
          // Obtener el mensaje de error del backend
          const errorObj = error as { response?: { data?: { message?: string | string[]; error?: string } }; message?: string };
          let errorMessage = 'Error al crear la dirección';
          if (errorObj.response?.data) {
            const errorData = errorObj.response.data;
            if (Array.isArray(errorData.message)) {
              errorMessage = errorData.message.join('. ');
            } else if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } else if (errorObj.message) {
            errorMessage = errorObj.message;
          }
          
          // Mostrar el error completo al usuario
          toast.error(`Error al crear la dirección: ${errorMessage}`, {
            description: 'Por favor, verifica que todos los campos sean válidos',
            duration: 5000,
          });
          
          throw new Error(`Error al crear la dirección: ${errorMessage}`);
        }
      } else if (data.idDireccion) {
        // Usar dirección guardada
        idDireccionFinal = parseInt(data.idDireccion, 10);
        if (isNaN(idDireccionFinal)) {
          throw new Error('ID de dirección inválido');
        }
      } else {
        throw new Error('Debes seleccionar o crear una dirección de entrega');
      }

      // Validar teléfono
      const telefonoError = validateTelefono(data.contactoTelefono);
      if (telefonoError) {
        toast.error(telefonoError);
        return;
      }

      // Formatear teléfono para backend (agregar 505 internamente)
      const telefonoBackend = formatTelefonoForBackend(data.contactoTelefono);

      // Crear contacto de entrega
      const contacto = await createContactoEntrega({
        nombre: data.contactoNombre,
        apellido: data.contactoApellido,
        telefono: telefonoBackend,
      });
      
      if (!contacto.idContactoEntrega) {
        throw new Error('No se pudo crear el contacto de entrega');
      }

      // Crear pedido desde el carrito (sin idEmpleado, sin costoEnvio, sin fechaEntregaEstimada)
      const pedido = await crearPedidoDesdeCarrito(carritoTyped.idCarrito, {
        idDireccion: idDireccionFinal,
        idContactoEntrega: contacto.idContactoEntrega,
        idFolio: 2, // Siempre debe ser 2
        direccionTxt: data.direccionTxt,
      });

      // Invalidar la query del carrito para que se actualice (el backend probablemente lo limpia)
      queryClient.invalidateQueries({ queryKey: ['carrito', 'activo'] });
      
      // También limpiar el localStorage del pago si existe
      localStorage.removeItem('paypal_pago_id');

      toast.success('¡Pedido creado exitosamente!');
      navigate(`/pedido/${pedido.idPedido}/confirmacion`);
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const errorMessage = Array.isArray(errorObj.response?.data?.message) 
        ? errorObj.response.data.message.join('. ')
        : errorObj.response?.data?.message || errorObj.message || 'Error al crear el pedido';
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  // Mostrar loading mientras se verifica el pago o se carga el carrito
  if (isVerifying || isLoadingCarrito || !carrito) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificando pago...</h1>
          <p className="text-gray-600">Por favor, espera mientras confirmamos tu pago.</p>
        </div>
      </div>
    );
  }

  // Verificar que el pago exista
  if (!carrito || !(carrito as Carrito).idPago) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Debes completar el pago primero</p>
          <Button onClick={() => navigate('/carrito/checkout')}>
            Ir a Pagar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de pago confirmado */}
        <Card className="bg-green-50 border-green-200 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MdCheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-900">Pago Confirmado</p>
                <p className="text-sm text-green-700">Tu pago ha sido procesado exitosamente. Completa la información de entrega para crear tu pedido.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Información de entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdLocationOn className="w-5 h-5 text-[#50C878]" />
                    Información de Entrega
                  </CardTitle>
                  <CardDescription>Selecciona o crea una dirección de entrega</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Opción: Usar dirección guardada o crear nueva */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={usarDireccionGuardada ? 'default' : 'outline'}
                      onClick={() => {
                        setUsarDireccionGuardada(true);
                        setDireccionData(null);
                        setMapboxSearchValue('');
                        setValue('idDireccion', '');
                      }}
                      className="flex-1"
                    >
                      Usar Dirección Guardada
                    </Button>
                    <Button
                      type="button"
                      variant={!usarDireccionGuardada ? 'default' : 'outline'}
                      onClick={() => {
                        setUsarDireccionGuardada(false);
                        setValue('idDireccion', '');
                      }}
                      className="flex-1"
                    >
                      Crear Nueva Dirección
                    </Button>
                  </div>

                  {usarDireccionGuardada ? (
                    <div className="space-y-2">
                      <Label htmlFor="idDireccion">Dirección Guardada *</Label>
                      <Select
                        value={direccionSeleccionada}
                        onValueChange={(value) => {
                          setValue('idDireccion', value);
                          setUsarDireccionGuardada(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una dirección guardada" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingDirecciones ? (
                            <SelectItem value="loading" disabled>Cargando...</SelectItem>
                          ) : direcciones.length === 0 ? (
                            <SelectItem value="none" disabled>No hay direcciones guardadas</SelectItem>
                          ) : (
                            direcciones.map((dir) => (
                              <SelectItem
                                key={dir.idClienteDireccion}
                                value={dir.idDireccion?.toString() || ''}
                              >
                                {dir.direccion?.formattedAddress || dir.etiqueta || 'Dirección'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      {errors.idDireccion && (
                        <p className="text-sm text-red-600 mt-1">{errors.idDireccion.message}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="mapboxSearch">Buscar Dirección en el Mapa *</Label>
                      <p className="text-xs text-gray-500">
                        Busca y selecciona la ubicación de entrega en el mapa
                      </p>
                      <MapboxAddressSearch
                        value={mapboxSearchValue}
                        onChange={setMapboxSearchValue}
                        onSelect={handleDireccionChange}
                        placeholder="Busca una dirección en Nicaragua..."
                        className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/40"
                        showMap={true}
                        mapHeight="300px"
                      />
                      {direccionData && (
                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                          <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                            <MdLocationOn className="h-5 w-5 text-green-600 shrink-0" />
                            {direccionData.formattedAddress}
                          </p>
                        </div>
                      )}
                      {!direccionData && (
                        <p className="text-sm text-amber-600">
                          ⚠️ Debes seleccionar una dirección en el mapa
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="direccionTxt">Dirección completa (texto) *</Label>
                    <p className="text-xs text-gray-500">
                      Puedes editar esta dirección para agregar detalles adicionales como número de casa, referencias, etc.
                    </p>
                    <Input
                      id="direccionTxt"
                      {...register('direccionTxt', { required: 'La dirección es requerida' })}
                      placeholder="Calle, número, barrio, ciudad, referencias..."
                    />
                    {errors.direccionTxt && (
                      <p className="text-sm text-red-600 mt-1">{errors.direccionTxt.message}</p>
                    )}
                  </div>

                </CardContent>
              </Card>

              {/* Contacto de entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MdPerson className="w-5 h-5 text-[#50C878]" />
                    Contacto de Entrega
                  </CardTitle>
                  <CardDescription>Información de la persona que recibirá el pedido</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactoNombre">Nombre *</Label>
                      <Input
                        id="contactoNombre"
                        {...register('contactoNombre', { required: 'El nombre es requerido' })}
                        placeholder="Nombre"
                      />
                      {errors.contactoNombre && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactoNombre.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactoApellido">Apellido *</Label>
                      <Input
                        id="contactoApellido"
                        {...register('contactoApellido', { required: 'El apellido es requerido' })}
                        placeholder="Apellido"
                      />
                      {errors.contactoApellido && (
                        <p className="text-sm text-red-600 mt-1">{errors.contactoApellido.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactoTelefono">Teléfono * (8 dígitos)</Label>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-11 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm font-medium text-gray-700">
                        +505
                      </div>
                      <Input
                        id="contactoTelefono"
                        type="tel"
                        {...register('contactoTelefono', {
                          required: 'El teléfono es requerido',
                          pattern: {
                            value: /^\d{8}$/,
                            message: 'El teléfono debe tener 8 dígitos',
                          },
                        })}
                        onChange={handleContactoTelefonoChange}
                        className="bg-white border-gray-300 text-gray-900 h-11 text-base rounded-l-none"
                        placeholder="12345678"
                        maxLength={8}
                      />
                    </div>
                    {errors.contactoTelefono && (
                      <p className="text-sm text-red-600 mt-1">{errors.contactoTelefono.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                      </span>
                      <span className="text-gray-900 font-medium">C${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-gray-900">
                          C${subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Productos:</p>
                    {(carrito as Carrito)?.carritosArreglo?.map((item: any) => {
                      const precio = Number(item.precioUnitario) || 0;
                      return (
                        <div key={item.idCarritoArreglo} className="text-sm text-gray-600">
                          <p className="font-medium">{item.arreglo?.nombre || 'Arreglo'}</p>
                          <p className="text-xs">
                            Cantidad: {item.cantidad} × C${precio.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#50C878] hover:bg-[#00A87F] text-white font-semibold py-3"
                    disabled={isProcessing || (!direccionData && !direccionSeleccionada && !usarDireccionGuardada)}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <MdCheckCircle className="w-5 h-5 mr-2" />
                        Crear Pedido
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
