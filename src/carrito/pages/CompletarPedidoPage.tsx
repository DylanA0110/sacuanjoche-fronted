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
import { useQuery } from '@tanstack/react-query';
import type { ClienteDireccion } from '@/cliente/types/direccion.interface';
import type { CreateDireccionDto } from '@/cliente/types/direccion.interface';

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

  const idCliente = user?.cliente?.idCliente || user?.idCliente || null;

  // Obtener direcciones del cliente
  const { data: direccionesData, isLoading: isLoadingDirecciones } = useQuery({
    queryKey: ['clienteDirecciones', idCliente],
    queryFn: () => getClienteDirecciones({ idCliente, limit: 100 }),
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

    // Si el carrito no tiene productos, es un carrito nuevo - redirigir al checkout para agregar productos
    if (!carrito.carritosArreglo || carrito.carritosArreglo.length === 0) {
      console.log('🔄 Carrito sin productos. Redirigiendo al checkout...');
      toast.error('Tu carrito está vacío. Agrega productos antes de pagar.');
      navigate('/carrito/checkout', { replace: true });
      return;
    }

    const verificarPago = async () => {
      verificandoRef.current = true;
      setIsVerifying(true);
      
      // Si no hay idPago, redirigir al checkout para crear un nuevo pago
      if (!carrito.idPago) {
        console.log('🔄 Carrito sin pago. Redirigiendo al checkout para crear pago...');
        toast.error('Debes completar el pago primero');
        navigate('/carrito/checkout', { replace: true });
        verificandoRef.current = false;
        return;
      }
      
      // Verificar que el pago esté REALMENTE confirmado (estado "pagado")
      // Si tiene idPago pero no está pagado, es un pago anterior o pendiente - redirigir a checkout
      if (carrito.pago?.estado === 'pagado') {
        console.log('✅ Pago confirmado correctamente');
        setIsVerifying(false);
        verificandoRef.current = false;
        return;
      }
      
      // Si tiene idPago pero el pago no está confirmado, redirigir a checkout para crear nuevo pago
      if (carrito.idPago && carrito.pago && carrito.pago.estado !== 'pagado') {
        console.log('⚠️ Carrito tiene idPago pero el pago no está confirmado. Estado:', carrito.pago.estado);
        console.log('🔄 Redirigiendo a checkout para crear nuevo pago...');
        toast.error('El pago anterior no está confirmado. Debes crear un nuevo pago.');
        navigate('/carrito/checkout', { replace: true });
        verificandoRef.current = false;
        return;
      }
      
      // Si no tenemos información del pago pero sí tenemos idPago, intentar obtenerla (solo una vez)
      if (!carrito.pago && carrito.idPago) {
        console.log('🔄 Carrito tiene idPago pero no información del pago. Obteniendo información...');
        
        let intentos = 0;
        const maxIntentos = 3;
        
        while (intentos < maxIntentos) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const carritoRefetch = await refetch();
          
          if (carritoRefetch.data?.pago) {
            console.log('✅ Información del pago obtenida:', {
              estado: carritoRefetch.data.pago.estado,
              intento: intentos + 1,
            });
            
            if (carritoRefetch.data.pago.estado === 'pagado') {
              setIsVerifying(false);
              verificandoRef.current = false;
              return;
            }
            break;
          }
          
          intentos++;
          console.log(`⏳ Intento ${intentos}/${maxIntentos}: Esperando información del pago...`);
        }
        
        console.log('⚠️ Carrito tiene idPago pero no se pudo obtener información completa del pago. Continuando...');
        console.log('ℹ️ El backend validará el estado del pago al crear el pedido.');
      } else if (carrito.pago && carrito.pago.estado !== 'pagado') {
        console.error('❌ Estado del pago no es "pagado":', carrito.pago.estado);
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
  }, [isLoadingCarrito, carrito?.idCarrito, carrito?.idPago]); // Solo cuando cambia el idCarrito o idPago

  const onSubmit = async (data: CompletarPedidoFormData) => {
    // Validaciones según la documentación
    if (!carrito) {
      toast.error('El carrito no está disponible');
      return;
    }

    // Validar que el carrito tenga productos
    if (!carrito.carritosArreglo || carrito.carritosArreglo.length === 0) {
      toast.error('El carrito no tiene productos. Agrega productos antes de crear el pedido.');
      return;
    }

    // Validar que el carrito tenga un pago asociado
    if (!carrito.idPago) {
      toast.error('El carrito no tiene un pago asociado. Debes completar el pago primero.');
      navigate('/carrito/checkout', { replace: true });
      return;
    }

    // Validar que el pago esté en estado PAGADO (solo si tenemos la información del pago)
    // Si no tenemos la información pero sí tenemos idPago, permitir continuar (el backend validará)
    if (carrito.pago && carrito.pago.estado !== 'pagado') {
      toast.error('El pago debe estar completado antes de crear el pedido.');
      navigate('/carrito/checkout', { replace: true });
      return;
    }
    
    // Si tenemos idPago pero no información del pago, hacer un último refetch antes de continuar
    if (carrito.idPago && !carrito.pago) {
      console.log('🔄 Último intento: Obteniendo información del pago antes de crear el pedido...');
      const carritoActualizado = await refetch();
      
      if (carritoActualizado.data?.pago && carritoActualizado.data.pago.estado !== 'pagado') {
        toast.error('El pago debe estar completado antes de crear el pedido.');
        navigate('/carrito/checkout', { replace: true });
        return;
      }
      
      // Si aún no tenemos información, confiar en que el backend validará
      console.log('ℹ️ Continuando sin información completa del pago. El backend validará el estado.');
    }

    setIsProcessing(true);

    try {
      let idDireccionFinal: number;

      // Si se seleccionó una dirección desde el mapa (nueva dirección)
      if (direccionData && !usarDireccionGuardada) {
        console.log('📍 Creando nueva dirección desde Mapbox...');
        
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

        console.log('📤 Enviando dirección al backend:', JSON.stringify(direccionDto, null, 2));
        
        try {
          const nuevaDireccion = await createDireccion(direccionDto);
          console.log('✅ Dirección creada exitosamente:', nuevaDireccion);
          
          // Asociar la dirección al cliente
          if (idCliente && nuevaDireccion.idDireccion) {
            await createClienteDireccion({
              idCliente,
              idDireccion: nuevaDireccion.idDireccion,
              etiqueta: 'Entrega',
              esPredeterminada: false,
            });
          }

          idDireccionFinal = nuevaDireccion.idDireccion;
          console.log('✅ Dirección creada:', idDireccionFinal);
        } catch (error: any) {
          console.error('❌ Error al crear dirección:', error);
          console.error('📋 Datos enviados:', JSON.stringify(direccionDto, null, 2));
          console.error('📋 Respuesta del error completa:', error.response?.data);
          console.error('📋 Status code:', error.response?.status);
          
          // Obtener el mensaje de error del backend
          let errorMessage = 'Error al crear la dirección';
          if (error.response?.data) {
            const errorData = error.response.data;
            if (Array.isArray(errorData.message)) {
              errorMessage = errorData.message.join('. ');
            } else if (typeof errorData.message === 'string') {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            }
          } else if (error.message) {
            errorMessage = error.message;
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
        console.log('✅ Usando dirección guardada:', idDireccionFinal);
      } else {
        throw new Error('Debes seleccionar o crear una dirección de entrega');
      }

      // Crear contacto de entrega
      const contacto = await createContactoEntrega({
        nombre: data.contactoNombre,
        apellido: data.contactoApellido,
        telefono: data.contactoTelefono,
      });
      
      if (!contacto.idContactoEntrega) {
        throw new Error('No se pudo crear el contacto de entrega');
      }

      // Crear pedido desde el carrito (sin idEmpleado, sin costoEnvio, sin fechaEntregaEstimada)
      const pedido = await crearPedidoDesdeCarrito(carrito.idCarrito, {
        idDireccion: idDireccionFinal,
        idContactoEntrega: contacto.idContactoEntrega,
        idFolio: 2, // Siempre debe ser 2
        direccionTxt: data.direccionTxt,
      });

      toast.success('¡Pedido creado exitosamente!');
      navigate(`/pedido/${pedido.idPedido}/confirmacion`);
    } catch (error: any) {
      console.error('❌ Error al crear pedido:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el pedido';
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
  if (!carrito.idPago) {
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
              <MdCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
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
                            <MdLocationOn className="h-5 w-5 text-green-600 flex-shrink-0" />
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
                    <Label htmlFor="contactoTelefono">Teléfono *</Label>
                    <Input
                      id="contactoTelefono"
                      type="tel"
                      {...register('contactoTelefono', {
                        required: 'El teléfono es requerido',
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: 'Teléfono inválido',
                        },
                      })}
                      placeholder="8888-8888"
                    />
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
                    {carrito.carritosArreglo?.map((item) => {
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
