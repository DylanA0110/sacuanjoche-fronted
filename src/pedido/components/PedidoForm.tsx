import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useArreglo } from '@/arreglo/hook/useArreglo';
import {
  MapboxAddressSearch,
  type MapboxAddressData,
} from '@/shared/components/Custom/MapboxAddressSearch';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { ClienteSelect } from './ClienteSelect';
import { ArregloCard } from './ArregloCard';
import { CarritoArreglos } from './CarritoArreglos';
import { MdLocationOn, MdPerson, MdShoppingCart, MdSave } from 'react-icons/md';
import type { CreatePedidoDto } from '../types/pedido.interface';
import type { Arreglo } from '@/arreglo/types/arreglo.interface';
import type { CreateDireccionDto } from '@/cliente/types/direccion.interface';
import { usePedidoCart } from '../hook/usePedidoCart';
import { useUserIdEmpleado } from '@/shared/utils/getUserId';

interface PedidoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    pedido: CreatePedidoDto;
    direccion?: CreateDireccionDto;
    contactoEntrega: {
      nombre: string;
      apellido: string;
      telefono: string;
    };
    detalles: Array<{
      idArreglo: number;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
  }) => void;
  isLoading?: boolean;
  pedido?: import('../types/pedido.interface').Pedido | null;
}

interface FormValues {
  idCliente: string;
  fechaEntregaEstimada: string;
  costoEnvio: string;
  contactoNombre: string;
  contactoApellido: string;
  contactoTelefono: string;
  direccionTexto: string;
}

export function PedidoForm({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  pedido,
}: PedidoFormProps) {
  // Obtener el idEmpleado del usuario autenticado
  const idEmpleado = useUserIdEmpleado();

  // Hook del formulario
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      idCliente: '',
      fechaEntregaEstimada: '',
      costoEnvio: '0',
      contactoNombre: '',
      contactoApellido: '',
      contactoTelefono: '',
      direccionTexto: '',
    },
  });

  // Observar valores del formulario
  const formValues = watch();

  // Estado de dirección (Mapbox data)
  const [direccionData, setDireccionData] = useState<MapboxAddressData | null>(
    null
  );
  const [mapboxSearchValue, setMapboxSearchValue] = useState('');

  // Hook del carrito de pedidos
  const {
    items: arreglosSeleccionados,
    subtotal: subtotalProductos,
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    updateQuantity: updateItemQuantity,
    clear: clearCart,
  } = usePedidoCart();

  // Estado de búsqueda de arreglos (optimizado)
  const [searchArreglo, setSearchArreglo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Mostrar solo 3 arreglos por página
  const debouncedSearch = useDebounce(searchArreglo, 300);
  const previousSearchRef = useRef<string>(debouncedSearch);

  // Obtener arreglos usando el hook (filtra por estado activo en el frontend)
  const { arreglos } = useArreglo({
    limit: 100, // Obtener más para poder paginar
    q: debouncedSearch || undefined,
    estado: 'activo', // El hook filtra por estado en el frontend usando ArregloEstado
  });

  // Paginación de arreglos - asegurar que siempre muestre exactamente itemsPerPage o menos
  const paginatedArreglos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const sliced = arreglos.slice(startIndex, endIndex);
    return sliced;
  }, [arreglos, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(arreglos.length / itemsPerPage));

  // Resetear página solo cuando cambia la búsqueda (no cuando el usuario navega)
  useEffect(() => {
    // Solo resetear si la búsqueda realmente cambió (no es el mismo valor)
    if (previousSearchRef.current !== debouncedSearch) {
      previousSearchRef.current = debouncedSearch;
      setCurrentPage(1);
    }
  }, [debouncedSearch]);

  // Asegurar que currentPage no exceda totalPages cuando cambian los arreglos
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [arreglos.length, totalPages, currentPage]);

  // Prellenar formulario cuando se edita un pedido
  useEffect(() => {
    if (pedido && open) {
      const fechaEntrega = pedido.fechaEntregaEstimada
        ? new Date(pedido.fechaEntregaEstimada).toISOString().slice(0, 16)
        : '';
      const costoEnvio =
        typeof pedido.costoEnvio === 'string'
          ? pedido.costoEnvio
          : String(pedido.costoEnvio || '0');

      reset({
        idCliente: String(pedido.idCliente),
        fechaEntregaEstimada: fechaEntrega,
        costoEnvio: costoEnvio,
        contactoNombre: pedido.contactoEntrega?.nombre || '',
        contactoApellido: pedido.contactoEntrega?.apellido || '',
        contactoTelefono: pedido.contactoEntrega?.telefono || '',
        direccionTexto: pedido.direccionTxt || '',
      });

      // Prellenar dirección del mapa si existe
      if (pedido.direccion) {
        const direccionMapbox: MapboxAddressData = {
          formattedAddress: pedido.direccion.formattedAddress,
          country: pedido.direccion.country,
          adminArea: pedido.direccion.adminArea,
          city: pedido.direccion.city,
          neighborhood: pedido.direccion.neighborhood,
          street: pedido.direccion.street,
          houseNumber: pedido.direccion.houseNumber,
          postalCode: pedido.direccion.postalCode,
          referencia: pedido.direccion.referencia,
          lat: pedido.direccion.lat.toString(),
          lng: pedido.direccion.lng.toString(),
          provider: pedido.direccion.provider,
          placeId: pedido.direccion.placeId,
          accuracy: pedido.direccion.accuracy,
          geolocation: pedido.direccion.geolocation,
        };
        setDireccionData(direccionMapbox);
        setMapboxSearchValue(direccionMapbox.formattedAddress);
      }

      // Prellenar carrito con detalles del pedido (SILENT - sin toasts)
      if (pedido.detalles && pedido.detalles.length > 0) {
        clearCart();
        // Usar setTimeout para asegurar que clearCart se complete antes de agregar items
        setTimeout(() => {
          pedido.detalles?.forEach((detalle) => {
            if (detalle.arreglo) {
              const arreglo: Arreglo = {
                idArreglo: detalle.arreglo.idArreglo,
                idFormaArreglo: detalle.arreglo.idFormaArreglo || 0,
                nombre: detalle.arreglo.nombre,
                descripcion: detalle.arreglo.descripcion || '',
                precioUnitario:
                  typeof detalle.precioUnitario === 'string'
                    ? parseFloat(detalle.precioUnitario)
                    : detalle.precioUnitario,
                estado: detalle.arreglo.estado || 'activo',
                url: detalle.arreglo.url,
              };
              // Agregar el arreglo al carrito SILENT (sin toast)
              addItemToCart(arreglo, true);
              // Actualizar cantidad después de agregar (si la cantidad es diferente de 1) - SILENT
              if (detalle.cantidad > 1) {
                setTimeout(() => {
                  updateItemQuantity(detalle.idArreglo, detalle.cantidad, true);
                }, 100);
              }
            }
          });
        }, 50);
      }
    } else if (!pedido && open) {
      // Resetear cuando se crea un nuevo pedido
      reset({
        idCliente: '',
        fechaEntregaEstimada: '',
        costoEnvio: '0',
        contactoNombre: '',
        contactoApellido: '',
        contactoTelefono: '',
        direccionTexto: '',
      });
      setDireccionData(null);
      clearCart();
      setSearchArreglo('');
      setCurrentPage(1);
      previousSearchRef.current = ''; // Resetear también el ref de búsqueda
    }
  }, [pedido, open, reset, clearCart, addItemToCart, updateItemQuantity]);

  const costoEnvioNum = parseFloat(formValues.costoEnvio) || 0;
  const totalPedido = subtotalProductos + costoEnvioNum;

  // Manejar selección de dirección del mapa (NO sobrescribe el texto)
  const handleDireccionChange = useCallback((data: MapboxAddressData) => {
    setDireccionData(data);
    // NO sobrescribir direccionTexto - son campos independientes
    // El usuario puede escribir "2 cuadras al sur" aunque el mapa diga otra cosa
  }, []);

  // Handlers del carrito (delegados al hook - ya están memoizados en el hook)
  const handleAgregarArreglo = addItemToCart;
  const handleRemoverArreglo = removeItemFromCart;
  const handleActualizarCantidad = updateItemQuantity;

  // Manejar envío del formulario
  const onSubmitForm = async (data: FormValues) => {
    // Validar que el usuario tenga idEmpleado
    if (!idEmpleado) {
      toast.error('Error de autenticación', {
        description: 'No se pudo obtener el ID del empleado. Por favor, inicia sesión nuevamente.',
      });
      return;
    }

    // Validaciones adicionales
    // Permitir guardar pedido sin arreglos si se está editando y no tenía arreglos
    if (arreglosSeleccionados.length === 0) {
      // Si es edición y el pedido original no tenía detalles, permitir continuar
      const pedidoSinDetalles =
        pedido && (!pedido.detalles || pedido.detalles.length === 0);
      if (!pedidoSinDetalles) {
        toast.error('Carrito vacío', {
          description: 'Debes agregar al menos un arreglo al carrito',
        });
        return;
      }
    }

    // Preparar datos de dirección (solo si hay direccionData o si es edición con dirección existente)
    let direccionDto: CreateDireccionDto | undefined = undefined;

    if (direccionData) {
      const lat = parseFloat(direccionData.lat);
      const lng = parseFloat(direccionData.lng);

      if (isNaN(lat) || isNaN(lng)) {
        toast.error('Dirección inválida', {
          description: 'Las coordenadas de la dirección no son válidas',
        });
        return;
      }

      direccionDto = {
        formattedAddress: direccionData.formattedAddress || '',
        country: direccionData.country || 'NIC',
        stateProv: direccionData.adminArea || null,
        city: direccionData.city || '',
        neighborhood: direccionData.neighborhood || '',
        street: direccionData.street || '',
        houseNumber: direccionData.houseNumber || '',
        postalCode: direccionData.postalCode || '',
        referencia: direccionData.referencia || '',
        lat: lat,
        lng: lng,
        provider: direccionData.provider || 'MAP BOX',
        placeId: direccionData.placeId || '',
        accuracy: direccionData.accuracy || 'ROOFTOP',
        geolocation:
          direccionData.geolocation ||
          JSON.stringify({
            accuracy: 10,
            timestamp: Date.now(),
            coordinates: [lng, lat],
          }),
        activo: true,
      };
    } else if (!pedido) {
      // Solo requerir dirección si es un nuevo pedido
      toast.error('Dirección requerida', {
        description: 'Debes seleccionar una dirección de entrega',
      });
      return;
    }

    // Preparar datos del pedido (sin idDireccion e idContactoEntrega aún)
    // Si el canal es "interno", nunca enviar idPago
    const pedidoDto: CreatePedidoDto = {
      canal: 'interno',
      idEmpleado,
      idCliente: parseInt(data.idCliente),
      idDireccion: 0, // Se asignará después de crear la dirección
      idContactoEntrega: 0, // Se asignará después de crear el contacto
      fechaEntregaEstimada: new Date(data.fechaEntregaEstimada).toISOString(),
      direccionTxt: data.direccionTexto, // Usar el texto que el usuario escribió, no el del mapa
    };

    // Preparar detalles
    const detalles = arreglosSeleccionados.map((arr) => ({
      idArreglo: arr.idArreglo,
      cantidad: arr.cantidad,
      precioUnitario: arr.precioUnitario,
      subtotal: 0,
    }));

    onSubmit({
      pedido: pedidoDto,
      direccion: direccionDto,
      contactoEntrega: {
        nombre: data.contactoNombre,
        apellido: data.contactoApellido,
        telefono: data.contactoTelefono,
      },
      detalles,
    });
  };

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        reset({
          idCliente: '',
          fechaEntregaEstimada: '',
          costoEnvio: '0',
          contactoNombre: '',
          contactoApellido: '',
          contactoTelefono: '',
          direccionTexto: '',
        });
        setDireccionData(null);
        setMapboxSearchValue('');
        clearCart();
        setSearchArreglo('');
        setCurrentPage(1);
        previousSearchRef.current = ''; // Resetear también el ref de búsqueda
      }
      onOpenChange(newOpen);
    },
    [reset, clearCart, onOpenChange]
  );

  const newLocal =
    'bg-linear-to-br from-white to-gray-50/50 rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200';
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-bold text-gray-900">
              {pedido ? 'Editar Pedido' : 'Nuevo Pedido'}
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              {pedido
                ? `Edita los datos del pedido #${pedido.idPedido}`
                : 'Completa los datos para crear un nuevo pedido'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
            {/* PASO 1: Sección: Cliente */}
            <div className="bg-linear-to-br from-white to-gray-50/50 rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-linear-to-br from-[#50C878] to-[#3aa85c] rounded-lg">
                  <MdPerson className="h-5 w-5 text-white" />
                </div>
                <span>1. Cliente</span>
              </h3>
              <ClienteSelect
                value={formValues.idCliente}
                onChange={(value) => setValue('idCliente', value)}
                required
              />
              {errors.idCliente && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.idCliente.message}
                </p>
              )}
            </div>

            {/* PASO 2: Sección: Arreglos - Carrito de Compra */}
            <div className="bg-linear-to-br from-white to-gray-50/50 rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MdShoppingCart className="h-5 w-5 text-[#50C878]" />
                  Catálogo de Arreglos *
                </h3>
                {arreglosSeleccionados.length > 0 && (
                  <Badge className="bg-[#50C878] text-white">
                    {arreglosSeleccionados.length}{' '}
                    {arreglosSeleccionados.length === 1
                      ? 'arreglo'
                      : 'arreglos'}{' '}
                    en el carrito
                  </Badge>
                )}
              </div>

              {/* Buscador de arreglos */}
              <div className="relative mb-4">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10"></div>
                <Input
                  type="text"
                  value={searchArreglo}
                  onChange={(e) => setSearchArreglo(e.target.value)}
                  placeholder="Buscar arreglos por nombre..."
                  className="bg-white border-gray-300 text-gray-900 h-11 text-base pl-10 pr-4"
                />
              </div>

              {/* Grid de arreglos disponibles con paginación */}
              {arreglos.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {paginatedArreglos.map((arreglo: Arreglo) => {
                      const enCarrito = arreglosSeleccionados.find(
                        (a) => a.idArreglo === arreglo.idArreglo
                      );
                      const cantidadEnCarrito = enCarrito?.cantidad || 0;

                      return (
                        <ArregloCard
                          key={arreglo.idArreglo}
                          arreglo={arreglo}
                          cantidadEnCarrito={cantidadEnCarrito}
                          onAgregar={handleAgregarArreglo}
                          onEliminar={handleRemoverArreglo}
                        />
                      );
                    })}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 mb-6 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600 order-2 sm:order-1">
                        Mostrando{' '}
                        <span className="font-semibold text-gray-900">
                          {paginatedArreglos.length > 0
                            ? (currentPage - 1) * itemsPerPage + 1
                            : 0}
                        </span>{' '}
                        a{' '}
                        <span className="font-semibold text-gray-900">
                          {Math.min(currentPage * itemsPerPage, arreglos.length)}
                        </span>{' '}
                        de{' '}
                        <span className="font-semibold text-gray-900">
                          {arreglos.length}
                        </span>{' '}
                        arreglos
                        {searchArreglo && ` para "${searchArreglo}"`}
                      </p>
                      <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="h-9 px-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Página anterior"
                        >
                          Anterior
                        </Button>
                        <span className="px-3 sm:px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-md min-w-[80px] text-center">
                          {currentPage} / {totalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="h-9 px-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Página siguiente"
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchArreglo ? (
                    <p>No se encontraron arreglos con "{searchArreglo}"</p>
                  ) : (
                    <p>No hay arreglos disponibles</p>
                  )}
                </div>
              )}

              {/* Carrito de compra - Arreglos seleccionados */}
              <CarritoArreglos
                arreglos={arreglosSeleccionados}
                onActualizarCantidad={handleActualizarCantidad}
                onEliminar={handleRemoverArreglo}
              />
            </div>

            {/* PASO 3: Sección: Contacto de Entrega */}
            <div className={newLocal}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 bg-linear-to-br from-[#50C878] to-[#3aa85c] rounded-lg">
                  <MdPerson className="h-5 w-5 text-white" />
                </div>
                <span>3. Contacto de Entrega *</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="contactoNombre"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Nombre *
                  </Label>
                  <Input
                    id="contactoNombre"
                    {...register('contactoNombre', {
                      required: 'El nombre es requerido',
                    })}
                    placeholder="Juan"
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                  />
                  {errors.contactoNombre && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.contactoNombre.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="contactoApellido"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Apellido *
                  </Label>
                  <Input
                    id="contactoApellido"
                    {...register('contactoApellido', {
                      required: 'El apellido es requerido',
                    })}
                    placeholder="Pérez"
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                  />
                  {errors.contactoApellido && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.contactoApellido.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="contactoTelefono"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Teléfono *
                  </Label>
                  <Input
                    id="contactoTelefono"
                    {...register('contactoTelefono', {
                      required: 'El teléfono es requerido',
                    })}
                    placeholder="+505 1234 5678"
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                  />
                  {errors.contactoTelefono && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.contactoTelefono.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PASO 4: Sección: Dirección */}
            <div className="bg-linear-to-br from-blue-50/30 to-green-50/30 rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className={
                    'p-2 bg-linear-to-br from-[#50C878] to-[#3aa85c] rounded-lg shadow-md'
                  }
                >
                  <MdLocationOn className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Label className="text-lg font-bold text-gray-900">
                    4. Dirección de Entrega *
                  </Label>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Busca y selecciona la ubicación de entrega
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="direccionTexto"
                  className="text-sm font-semibold text-gray-700"
                >
                  Dirección de Entrega (Texto) *
                </Label>
                <Input
                  id="direccionTexto"
                  type="text"
                  {...register('direccionTexto', {
                    required: 'La dirección es requerida',
                  })}
                  placeholder="Ej: 2 cuadras al sur del Metrocentro, Barrio Centro"
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/40"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Escribe la dirección completa con referencias, cuadras, etc.
                </p>
                {errors.direccionTexto && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.direccionTexto.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="mapboxSearch"
                  className="text-sm font-semibold text-gray-700"
                >
                  Buscar Ubicación en Mapa (Opcional - Solo para coordenadas)
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Busca en el mapa para obtener coordenadas. El texto de arriba
                  es independiente.
                </p>
                <MapboxAddressSearch
                  value={mapboxSearchValue}
                  onChange={setMapboxSearchValue}
                  onSelect={handleDireccionChange}
                  placeholder="Busca una ubicación en el mapa..."
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/40"
                  showMap={true}
                  mapHeight="250px"
                />
              </div>

              {direccionData && (
                <div className="p-4 bg-white rounded-lg border-2 border-[#50C878]/30 shadow-md">
                  <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <MdLocationOn className="h-5 w-5 text-[#50C878]" />
                    {direccionData.formattedAddress}
                  </p>
                </div>
              )}
            </div>

            {/* PASO 5: Sección: Información Adicional */}
            <div className="bg-linear-to-br from-white to-gray-50/50 rounded-xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <h3 className={'text-lg font-bold text-gray-900 mb-4'}>
                5. Información Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fechaEntrega"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Fecha de Entrega Estimada *
                  </Label>
                  <Input
                    id="fechaEntrega"
                    type="datetime-local"
                    {...register('fechaEntregaEstimada', {
                      required: 'La fecha de entrega es requerida',
                    })}
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base"
                  />
                  {errors.fechaEntregaEstimada && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.fechaEntregaEstimada.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="costoEnvio"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Costo de Envío (C$)
                  </Label>
                  <Input
                    id="costoEnvio"
                    type="text"
                    inputMode="decimal"
                    {...register('costoEnvio', {
                      pattern: {
                        value: /^\d*\.?\d*$/,
                        message: 'Solo números y punto decimal',
                      },
                      min: {
                        value: 0,
                        message: 'El costo no puede ser negativo',
                      },
                    })}
                    placeholder="0.00"
                    className="bg-white border-gray-300 text-gray-900 h-11 text-base focus:border-[#50C878] focus:ring-[#50C878]/40"
                  />
                  {errors.costoEnvio && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.costoEnvio.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen de Totales */}
            <div className="bg-linear-to-br from-[#50C878]/10 via-[#50C878]/5 to-[#3aa85c]/10 rounded-xl p-6 border-2 border-[#50C878]/30 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-linear-to-b from-[#50C878] to-[#3aa85c] rounded-full" />
                Resumen del Pedido
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal de Productos:</span>
                  <span className="font-semibold">
                    C${subtotalProductos.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Costo de Envío:</span>
                  <span className="font-semibold">
                    C${costoEnvioNum.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                  <span>Total:</span>
                  <span className="text-[#50C878]">
                    C${totalPedido.toFixed(2)}
                  </span>
                </div>
              </div>
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
                disabled={
                  isLoading ||
                  (arreglosSeleccionados.length === 0 &&
                    !(
                      pedido &&
                      (!pedido.detalles || pedido.detalles.length === 0)
                    ))
                }
                className="bg-linear-to-r from-[#50C878] to-[#3aa85c] hover:from-[#50C878]/90 hover:to-[#3aa85c]/90 text-white shadow-md shadow-[#50C878]/20 gap-2 h-11 px-6 text-base font-semibold transition-colors duration-150 font-sans rounded-lg"
              >
                <MdSave className="h-5 w-5" />
                {isLoading
                  ? pedido
                    ? 'Guardando...'
                    : 'Creando...'
                  : pedido
                  ? 'Guardar Cambios'
                  : 'Crear Pedido'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
