import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useDebounce } from '@/shared/hooks/useDebounce';
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
import { ClienteSelect } from '../components/ClienteSelect';
import { ArregloCard } from '../components/ArregloCard';
import { CarritoArreglos } from '../components/CarritoArreglos';
import {
  MdLocationOn,
  MdPerson,
  MdShoppingCart,
  MdSave,
  MdArrowBack,
} from 'react-icons/md';
import type {
  CreatePedidoDto,
  UpdatePedidoDto,
} from '../types/pedido.interface';
import type { Arreglo } from '@/arreglo/types/arreglo.interface';
import type { CreateDireccionDto } from '@/cliente/types/direccion.interface';
import { usePedidoCart } from '../hook/usePedidoCart';
import {
  createPedido,
  updatePedido,
  createDetallePedido,
  createContactoEntrega,
  updateContactoEntrega,
  getPedidoById,
} from '../actions';
import { createEnvio } from '../actions/createEnvio';
import { getDetallePedidoByPedidoId } from '../actions/getDetallePedidoByPedidoId';
import { createDireccion, updateDireccion } from '@/cliente/actions';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useUserIdEmpleado } from '@/shared/utils/getUserId';
import {
  sanitizeName,
  validateName,
  formatTelefono,
  validateTelefono,
  formatTelefonoForBackend,
  formatTelefonoForInput,
} from '@/shared/utils/validation';

interface FormValues {
  idCliente: string;
  fechaEntregaEstimada: string;
  costoEnvio: string;
  contactoNombre: string;
  contactoApellido: string;
  contactoTelefono: string;
  direccionTexto: string;
}

export default function PedidoFormPage() {
  const navigate = useNavigate();
  const { idPedido } = useParams<{ idPedido?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isEdit = !!idPedido;

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
  const detallesCargadosRef = useRef(false);

  // Hook del carrito de pedidos
  const {
    items: arreglosSeleccionados,
    subtotal: subtotalProductos,
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    updateQuantity: updateItemQuantity,
    clear: clearCart,
  } = usePedidoCart();

  // Paginación de arreglos usando URL params - Similar a useQueryParameters
  const arregloPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  );
  const arregloLimit = 3; // Siempre 3 arreglos por página
  const arregloOffset = useMemo(
    () => (arregloPage - 1) * arregloLimit,
    [arregloPage, arregloLimit]
  );

  // Estado de búsqueda de arreglos
  const [searchArreglo, setSearchArreglo] = useState(
    searchParams.get('q') || ''
  );
  const debouncedSearch = useDebounce(searchArreglo, 300);
  const isUserTypingRef = useRef(false);
  const previousSearchRef = useRef<string | null>(null);

  // Inicializar el ref con el valor actual de la URL
  useEffect(() => {
    if (previousSearchRef.current === null) {
      previousSearchRef.current = searchParams.get('q') || '';
    }
  }, []);

  // Actualizar URL cuando cambia el debounced search
  useEffect(() => {
    const currentUrlQuery = searchParams.get('q') || '';
    const currentDebounced = debouncedSearch || '';
    
    // Si el valor en la URL ya coincide con el debounced, no hacer nada
    if (currentDebounced === currentUrlQuery) {
      isUserTypingRef.current = false;
      // Actualizar el ref para mantener sincronizado
      if (previousSearchRef.current !== currentDebounced) {
        previousSearchRef.current = currentDebounced;
      }
      return;
    }

    // Solo actualizar si la búsqueda realmente cambió desde la última vez
    const previousSearch = previousSearchRef.current;
    const searchChanged = currentDebounced !== previousSearch;

    if (searchChanged) {
      isUserTypingRef.current = true;
      const newParams = new URLSearchParams(searchParams);
      
      if (debouncedSearch) {
        newParams.set('q', debouncedSearch);
      } else {
        newParams.delete('q');
      }
      
      // Solo eliminar page si la búsqueda cambió (resetear a página 1)
      newParams.delete('page');
      previousSearchRef.current = currentDebounced;
      setSearchParams(newParams, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  // Sincronizar searchInput cuando cambia la URL desde fuera
  useEffect(() => {
    if (!isUserTypingRef.current) {
      const urlQuery = searchParams.get('q') || '';
      if (urlQuery !== searchArreglo) {
        setSearchArreglo(urlQuery);
        // Actualizar el ref cuando cambia desde fuera
        previousSearchRef.current = urlQuery;
      }
    }
  }, [searchParams, searchArreglo]);

  // Obtener arreglos usando el hook con paginación real
  const {
    arreglos,
    totalItems: totalArreglos,
    isLoading: isLoadingArreglos,
  } = useArreglo({
    usePagination: true,
    limit: arregloLimit,
    offset: arregloOffset,
    q: debouncedSearch || undefined,
    estado: 'activo',
  });

  const totalPages = Math.ceil(totalArreglos / arregloLimit);

  // Cargar pedido si es edición
  const { data: pedido, isLoading: isLoadingPedido } = useQuery({
    queryKey: ['pedido', idPedido],
    queryFn: () => getPedidoById(Number(idPedido!)),
    enabled: isEdit && !!idPedido,
  });

  // Cargar detalles del pedido (solo si no vienen en el pedido)
  // Los detalles normalmente vienen incluidos en el pedido, así que solo los cargamos si no están
  const { data: detallesPedido } = useQuery({
    queryKey: ['detalle-pedido', idPedido],
    queryFn: () => getDetallePedidoByPedidoId(Number(idPedido!)),
    enabled:
      isEdit &&
      !!idPedido &&
      (!pedido || !pedido.detalles || pedido.detalles.length === 0),
    retry: false, // No reintentar si falla
    refetchOnWindowFocus: false, // No refetch al cambiar de ventana
  });

  // Prellenar formulario cuando se carga el pedido
  useEffect(() => {
    if (pedido && isEdit) {
      // Formatear fecha para date input (YYYY-MM-DD)
      let fechaEntrega = '';
      if (pedido.fechaEntregaEstimada) {
        try {
          const fecha = new Date(pedido.fechaEntregaEstimada);
          // Verificar que la fecha sea válida
          if (!isNaN(fecha.getTime())) {
            // Formatear a YYYY-MM-DD para date input
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            fechaEntrega = `${year}-${month}-${day}`;
          }
        } catch (error) {
          fechaEntrega = '';
        }
      }
      const costoEnvio =
        typeof pedido.costoEnvio === 'string'
          ? pedido.costoEnvio
          : String(pedido.costoEnvio || '0');

      reset(
        {
          idCliente: String(pedido.idCliente),
          fechaEntregaEstimada: fechaEntrega,
          costoEnvio: costoEnvio,
          contactoNombre: pedido.contactoEntrega?.nombre || '',
          contactoApellido: pedido.contactoEntrega?.apellido || '',
          contactoTelefono: formatTelefonoForInput(
            pedido.contactoEntrega?.telefono || ''
          ),
          direccionTexto: pedido.direccionTxt || '',
        },
        {
          // Asegurar que los valores se establezcan correctamente
          keepDefaultValues: false,
        }
      );

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

      // Prellenar carrito con detalles del pedido
      // Priorizar detalles del pedido directamente, luego los de la query separada
      const detalles =
        pedido.detalles && pedido.detalles.length > 0
          ? pedido.detalles
          : detallesPedido && detallesPedido.length > 0
          ? detallesPedido
          : [];

      // Solo cargar detalles si el carrito está vacío y no se han cargado ya (evitar recargas innecesarias)
      if (
        detalles.length > 0 &&
        arreglosSeleccionados.length === 0 &&
        !detallesCargadosRef.current
      ) {
        detallesCargadosRef.current = true;
        clearCart();
        setTimeout(() => {
          detalles.forEach((detalle) => {
            // Verificar que el detalle tenga arreglo o al menos idArreglo
            if (detalle.arreglo || detalle.idArreglo) {
              // Si no tiene el objeto arreglo completo, crear uno mínimo
              const arreglo: Arreglo = detalle.arreglo
                ? {
                    idArreglo: detalle.arreglo.idArreglo,
                    idFormaArreglo: detalle.arreglo.idFormaArreglo || 0,
                    nombre: detalle.arreglo.nombre,
                    descripcion: detalle.arreglo.descripcion || '',
                    precioUnitario:
                      typeof detalle.precioUnitario === 'string'
                        ? parseFloat(detalle.precioUnitario)
                        : typeof detalle.precioUnitario === 'number'
                        ? detalle.precioUnitario
                        : typeof detalle.arreglo.precioUnitario === 'string'
                        ? parseFloat(detalle.arreglo.precioUnitario)
                        : detalle.arreglo.precioUnitario || 0,
                    estado: detalle.arreglo.estado || 'activo',
                    url: detalle.arreglo.url,
                  }
                : {
                    // Si no tiene arreglo completo, crear uno básico con los datos disponibles
                    idArreglo: detalle.idArreglo,
                    idFormaArreglo: 0,
                    nombre: `Arreglo #${detalle.idArreglo}`,
                    descripcion: '',
                    precioUnitario:
                      typeof detalle.precioUnitario === 'string'
                        ? parseFloat(detalle.precioUnitario)
                        : detalle.precioUnitario || 0,
                    estado: 'activo',
                    url: undefined,
                  };

              // Agregar con un pequeño delay entre items para evitar problemas de estado
              setTimeout(() => {
                addItemToCart(arreglo, true);

                // Actualizar cantidad después de agregar (si la cantidad es diferente de 1)
                const cantidad = detalle.cantidad || 1;
                if (cantidad > 1) {
                  setTimeout(() => {
                    updateItemQuantity(detalle.idArreglo, cantidad, true);
                  }, 200);
                }
              }, 150 * detalles.indexOf(detalle));
            }
          });
        }, 100);
      } else if (
        detalles.length === 0 &&
        arreglosSeleccionados.length === 0 &&
        isEdit
      ) {
        // Si no hay detalles pero estamos editando, limpiar el carrito
        clearCart();
        detallesCargadosRef.current = true;
      }
    } else if (!isEdit) {
      // Si no es edición, resetear el flag
      detallesCargadosRef.current = false;
    }
  }, [
    pedido,
    detallesPedido,
    isEdit,
    reset,
    clearCart,
    addItemToCart,
    updateItemQuantity,
    arreglosSeleccionados.length,
  ]);

  const costoEnvioNum = parseFloat(formValues.costoEnvio) || 0;
  const totalPedido = subtotalProductos + costoEnvioNum;

  // Manejar selección de dirección del mapa
  const handleDireccionChange = useCallback((data: MapboxAddressData) => {
    setDireccionData(data);
  }, []);

  // Handlers para nombre y apellido (sanitización)
  const handleContactoNombreChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeName(e.target.value, 30);
      setValue('contactoNombre', sanitized);
    },
    [setValue]
  );

  const handleContactoApellidoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeName(e.target.value, 30);
      setValue('contactoApellido', sanitized);
    },
    [setValue]
  );

  // Handler para teléfono (formateo)
  const handleContactoTelefonoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatTelefono(e.target.value);
      setValue('contactoTelefono', formatted);
    },
    [setValue]
  );

  // Handlers del carrito
  const handleAgregarArreglo = addItemToCart;
  const handleRemoverArreglo = removeItemFromCart;
  const handleActualizarCantidad = updateItemQuantity;

  // Mutation para guardar pedido
  const savePedidoMutation = useMutation({
    mutationFn: async (data: {
      pedido: any;
      direccion?: any;
      contactoEntrega: { nombre: string; apellido: string; telefono: string };
      detalles: Array<{
        idArreglo: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }>;
    }) => {
      let idDireccion = data.pedido.idDireccion || 0;
      let idContactoEntrega = data.pedido.idContactoEntrega || 0;

      // 1. Actualizar o crear dirección si es necesario
      if (data.direccion) {
        if (isEdit && pedido?.idDireccion) {
          await updateDireccion(pedido.idDireccion, data.direccion);
          idDireccion = pedido.idDireccion;
        } else {
          const direccionCreada = await createDireccion(data.direccion);
          if (!direccionCreada.idDireccion) {
            throw new Error('La dirección creada no tiene idDireccion');
          }
          idDireccion = direccionCreada.idDireccion;
        }
      }

      // 2. Actualizar o crear contacto de entrega
      if (isEdit && pedido?.idContactoEntrega) {
        await updateContactoEntrega(
          pedido.idContactoEntrega,
          data.contactoEntrega
        );
        idContactoEntrega = pedido.idContactoEntrega;
      } else {
        const contactoCreado = await createContactoEntrega(
          data.contactoEntrega
        );
        if (!contactoCreado.idContactoEntrega) {
          throw new Error(
            'El contacto de entrega creado no tiene idContactoEntrega'
          );
        }
        idContactoEntrega = contactoCreado.idContactoEntrega;
      }

      // 3. Crear o actualizar pedido
      const pedidoDto: CreatePedidoDto = {
        canal: 'interno', // Siempre interno
        idPago: null, // Siempre null para canal interno
        idCliente: data.pedido.idCliente,
        idEmpleado: data.pedido.idEmpleado,
        idFolio: 2, // Siempre 2
        fechaEntregaEstimada: data.pedido.fechaEntregaEstimada,
        direccionTxt: data.pedido.direccionTxt,
        idDireccion,
        idContactoEntrega,
      };

      let pedidoResultado;
      if (isEdit && idPedido) {
        // Para actualizar, usar UpdatePedidoDto con la misma lógica
        const updateDto: UpdatePedidoDto = {
          canal: 'interno' as const,
          idPago: null,
          idCliente: pedidoDto.idCliente,
          idEmpleado: pedidoDto.idEmpleado,
          idFolio: 2,
          fechaEntregaEstimada: pedidoDto.fechaEntregaEstimada,
          direccionTxt: pedidoDto.direccionTxt,
          idDireccion,
          idContactoEntrega,
        };
        pedidoResultado = await updatePedido(Number(idPedido), updateDto);
      } else {
        pedidoResultado = await createPedido(pedidoDto);
        if (!pedidoResultado.idPedido) {
          throw new Error('El pedido creado no tiene idPedido');
        }
      }

      // 4. Actualizar o crear detalles del pedido
      if (data.detalles && data.detalles.length > 0) {
        const detallesPromises = data.detalles.map((detalle) =>
          createDetallePedido({
            idPedido: pedidoResultado.idPedido,
            idArreglo: detalle.idArreglo,
            cantidad: detalle.cantidad,
            precioUnitario: 0, // Siempre 0 según requerimientos
            subtotal: 0, // Siempre 0 según requerimientos
          })
        );
        await Promise.all(detallesPromises);
      }

      // 5. Crear envío con el costo de envío (solo para nuevos pedidos)
      if (!isEdit && pedidoResultado.idPedido && data.pedido.costoEnvio > 0) {
        try {
          await createEnvio({
            idPedido: pedidoResultado.idPedido,
            idEmpleado: data.pedido.idEmpleado,
            estadoEnvio: 'Programado',
            fechaProgramada: data.pedido.fechaEntregaEstimada,
            costoEnvio: data.pedido.costoEnvio,
          });
        } catch (error) {
          // No fallar el pedido si falla el envío
        }
      }

      return pedidoResultado;
    },
    onSuccess: () => {
      toast.success(
        isEdit
          ? 'Pedido actualizado exitosamente'
          : 'Pedido creado exitosamente'
      );
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      navigate('/admin/pedidos');
    },
    onError: (error: any) => {
      toast.error(
        isEdit ? 'Error al actualizar el pedido' : 'Error al crear el pedido',
        {
          description: cleanErrorMessage(error),
          duration: 5000,
        }
      );
    },
  });

  // Manejar envío del formulario
  const onSubmitForm = async (data: FormValues) => {
    if (arreglosSeleccionados.length === 0) {
      toast.error('Carrito vacío', {
        description: 'Debes agregar al menos un arreglo al carrito',
      });
      return;
    }

    // Validar nombre
    const nombreError = validateName(data.contactoNombre, 'El nombre');
    if (nombreError) {
      toast.error(nombreError);
      return;
    }

    // Validar apellido
    const apellidoError = validateName(data.contactoApellido, 'El apellido');
    if (apellidoError) {
      toast.error(apellidoError);
      return;
    }

    // Validar teléfono
    const telefonoError = validateTelefono(data.contactoTelefono);
    if (telefonoError) {
      toast.error(telefonoError);
      return;
    }

    // Preparar datos de dirección
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
      };
    }

    // Validar que el usuario tenga idEmpleado
    if (!idEmpleado) {
      toast.error('Error de autenticación', {
        description:
          'No se pudo obtener el ID del empleado. Por favor, inicia sesión nuevamente.',
      });
      return;
    }

    // Validar que la fecha esté presente
    if (!data.fechaEntregaEstimada || !data.fechaEntregaEstimada.trim()) {
      toast.error('Fecha de entrega requerida', {
        description: 'Debes seleccionar una fecha de entrega estimada.',
      });
      return;
    }

    // Validar formato de fecha (debe ser YYYY-MM-DD)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!fechaRegex.test(data.fechaEntregaEstimada)) {
      toast.error('Formato de fecha inválido', {
        description: 'La fecha debe tener el formato YYYY-MM-DD.',
      });
      return;
    }

    // Verificar que la fecha sea válida
    const fechaTest = new Date(data.fechaEntregaEstimada);
    if (isNaN(fechaTest.getTime())) {
      toast.error('Fecha inválida', {
        description: 'La fecha seleccionada no es válida.',
      });
      return;
    }

    // El backend espera solo la fecha en formato YYYY-MM-DD (sin hora)
    // Enviar la fecha tal cual viene del input
    const fechaISO = data.fechaEntregaEstimada;

    // Preparar datos básicos del pedido (sin idDireccion e idContactoEntrega que se crearán en la mutation)
    // El costoEnvio NO va en el pedido, va en el envío
    const pedidoBase = {
      canal: 'interno' as const, // Siempre interno según la interfaz
      idCliente: Number(data.idCliente),
      idEmpleado,
      fechaEntregaEstimada: fechaISO,
      costoEnvio: parseFloat(data.costoEnvio) || 0, // Se guarda temporalmente para el envío
      direccionTxt:
        data.direccionTexto || direccionData?.formattedAddress || '',
      // idDireccion e idContactoEntrega se asignarán en la mutation después de crearlos
      idDireccion: isEdit && pedido?.idDireccion ? pedido.idDireccion : 0,
      idContactoEntrega:
        isEdit && pedido?.idContactoEntrega ? pedido.idContactoEntrega : 0,
    };

    const detalles = arreglosSeleccionados.map((arr) => ({
      idArreglo: arr.idArreglo,
      cantidad: arr.cantidad,
      precioUnitario: arr.precioUnitario,
      subtotal: arr.subtotal,
    }));

    // Formatear teléfono para backend (agregar 505 internamente)
    const telefonoBackend = formatTelefonoForBackend(data.contactoTelefono);

    savePedidoMutation.mutate({
      pedido: pedidoBase,
      direccion: direccionDto,
      contactoEntrega: {
        nombre: data.contactoNombre,
        apellido: data.contactoApellido,
        telefono: telefonoBackend,
      },
      detalles,
    });
  };

  // Manejar cambio de página de arreglos
  const handleArregloPageChange = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(searchParams);
      if (page === 1) {
        newParams.delete('page');
      } else {
        newParams.set('page', String(page));
      }
      setSearchParams(newParams, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [searchParams, setSearchParams]
  );

  if (isLoadingPedido) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/pedidos')}
            className="mb-2"
          >
            <MdArrowBack className="h-5 w-5 mr-2" />
            Volver
          </Button>
          <h1 className="text-4xl font-bold text-gray-900">
            {isEdit ? 'Editar Pedido' : 'Nuevo Pedido'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdPerson className="h-5 w-5 text-[#50C878]" />
                  1. Información del Cliente *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="idCliente"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Cliente *
                  </Label>
                  <ClienteSelect
                    value={formValues.idCliente}
                    onChange={(value) => setValue('idCliente', value)}
                    required
                  />
                  {errors.idCliente && (
                    <p className="text-sm text-red-500">
                      {errors.idCliente.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Catálogo de Arreglos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MdShoppingCart className="h-5 w-5 text-[#50C878]" />
                    2. Catálogo de Arreglos *
                  </CardTitle>
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
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buscador */}
                <div className="relative">
                  <Input
                    type="text"
                    value={searchArreglo}
                    onChange={(e) => setSearchArreglo(e.target.value)}
                    placeholder="Buscar arreglos por nombre..."
                    className="bg-white border-gray-300 text-gray-700 placeholder:text-gray-500 focus:border-[#50C878] focus:ring-[#50C878]/40"
                  />
                </div>

                {/* Grid de arreglos */}
                {isLoadingArreglos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
                  </div>
                ) : arreglos.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {arreglos.map((arreglo: Arreglo) => {
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
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Mostrando {arreglos.length} de {totalArreglos}{' '}
                          arreglos
                          {debouncedSearch && ` para "${debouncedSearch}"`}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleArregloPageChange(arregloPage - 1)
                            }
                            disabled={arregloPage === 1}
                          >
                            Anterior
                          </Button>
                          <span className="text-sm text-gray-600 px-2">
                            Página {arregloPage} de {totalPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleArregloPageChange(arregloPage + 1)
                            }
                            disabled={arregloPage === totalPages}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {debouncedSearch ? (
                      <p>No se encontraron arreglos con "{debouncedSearch}"</p>
                    ) : (
                      <p>No hay arreglos disponibles</p>
                    )}
                  </div>
                )}

                {/* Carrito */}
                <CarritoArreglos
                  arreglos={arreglosSeleccionados}
                  onActualizarCantidad={handleActualizarCantidad}
                  onEliminar={handleRemoverArreglo}
                />
              </CardContent>
            </Card>

            {/* Contacto de Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdPerson className="h-5 w-5 text-[#50C878]" />
                  3. Contacto de Entrega *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactoNombre"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Nombre * (2-30 letras, sin espacios)
                    </Label>
                    <Input
                      id="contactoNombre"
                      {...register('contactoNombre', {
                        required: 'El nombre es requerido',
                        minLength: {
                          value: 2,
                          message: 'El nombre debe tener al menos 2 caracteres',
                        },
                        maxLength: {
                          value: 30,
                          message: 'El nombre debe tener máximo 30 caracteres',
                        },
                      })}
                      onChange={handleContactoNombreChange}
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
                        setValue('contactoNombre', sanitized);
                      }}
                      placeholder="Juan"
                      maxLength={30}
                    />
                    {errors.contactoNombre && (
                      <p className="text-sm text-red-500">
                        {errors.contactoNombre.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactoApellido"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Apellido * (2-30 letras, sin espacios)
                    </Label>
                    <Input
                      id="contactoApellido"
                      {...register('contactoApellido', {
                        required: 'El apellido es requerido',
                        minLength: {
                          value: 2,
                          message:
                            'El apellido debe tener al menos 2 caracteres',
                        },
                        maxLength: {
                          value: 30,
                          message:
                            'El apellido debe tener máximo 30 caracteres',
                        },
                      })}
                      onChange={handleContactoApellidoChange}
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
                        setValue('contactoApellido', sanitized);
                      }}
                      placeholder="Pérez"
                      maxLength={30}
                    />
                    {errors.contactoApellido && (
                      <p className="text-sm text-red-500">
                        {errors.contactoApellido.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="contactoTelefono"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Teléfono * (8 dígitos)
                    </Label>
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
                      <p className="text-sm text-red-500">
                        {errors.contactoTelefono.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dirección y Fecha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MdLocationOn className="h-5 w-5 text-[#50C878]" />
                  4. Dirección y Fecha de Entrega *
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="fechaEntregaEstimada"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Fecha de Entrega Estimada *
                  </Label>
                  <Input
                    id="fechaEntregaEstimada"
                    type="date"
                    {...register('fechaEntregaEstimada', {
                      required: 'La fecha de entrega es requerida',
                    })}
                    value={formValues.fechaEntregaEstimada || ''}
                    onChange={(e) => {
                      setValue('fechaEntregaEstimada', e.target.value, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  {errors.fechaEntregaEstimada && (
                    <p className="text-sm text-red-500">
                      {errors.fechaEntregaEstimada.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Dirección en el Mapa
                  </Label>
                  <MapboxAddressSearch
                    value={mapboxSearchValue}
                    onChange={setMapboxSearchValue}
                    onSelect={handleDireccionChange}
                    placeholder="Buscar dirección..."
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="direccionTexto"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Dirección de Texto (Referencia adicional)
                  </Label>
                  <Input
                    id="direccionTexto"
                    {...register('direccionTexto')}
                    placeholder="Ej: 2 cuadras al sur del parque central"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="costoEnvio"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Costo de Envío (0 - 1000)
                  </Label>
                  <Input
                    id="costoEnvio"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000"
                    {...register('costoEnvio', {
                      validate: (value) => {
                        const numValue = parseFloat(value) || 0;
                        if (numValue < 0) {
                          return 'El costo de envío no puede ser menor a 0';
                        }
                        if (numValue > 1000) {
                          return 'El costo de envío no puede ser mayor a 1000';
                        }
                        return true;
                      },
                    })}
                    onKeyDown={(e) => {
                      // Bloquear el signo negativo y otros caracteres no permitidos
                      if (
                        e.key === '-' ||
                        e.key === '+' ||
                        e.key === 'e' ||
                        e.key === 'E'
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      // Solo permitir números y punto decimal, sin signos negativos
                      let value = e.target.value.replace(/[^0-9.]/g, '');
                      // Remover signos negativos si se pegan
                      value = value.replace(/-/g, '');
                      // Evitar múltiples puntos decimales
                      const parts = value.split('.');
                      const formattedValue =
                        parts.length > 2
                          ? parts[0] + '.' + parts.slice(1).join('')
                          : value;
                      setValue('costoEnvio', formattedValue, {
                        shouldValidate: true,
                      });
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      // Solo permitir números y punto decimal
                      let value = pastedText.replace(/[^0-9.]/g, '');
                      // Remover signos negativos
                      value = value.replace(/-/g, '');
                      setValue('costoEnvio', value, {
                        shouldValidate: true,
                      });
                    }}
                    placeholder="0.00"
                    className="text-gray-700"
                  />
                  {errors.costoEnvio && (
                    <p className="text-sm text-red-500">
                      {errors.costoEnvio.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna derecha: Resumen */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Subtotal:
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      C${subtotalProductos.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">
                      Costo de Envío:
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      C${costoEnvioNum.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-[#50C878]">
                      C${totalPedido.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#50C878] hover:bg-[#63d68b] text-white"
                  disabled={savePedidoMutation.isPending}
                >
                  <MdSave className="h-5 w-5 mr-2" />
                  {savePedidoMutation.isPending
                    ? 'Guardando...'
                    : isEdit
                    ? 'Actualizar Pedido'
                    : 'Crear Pedido'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
