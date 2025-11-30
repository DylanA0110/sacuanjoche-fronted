import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/auth/store/auth.store';
import {
  getCarritoActivo,
  createCarrito,
  createCarritoArreglo,
  updateCarritoArreglo,
  deleteCarritoArreglo,
} from '../actions';
import { toast } from 'sonner';
import type { CreateCarritoArregloDto, Carrito, CarritoArreglo } from '../types/carrito.interface';

export const useCarrito = () => {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();

  // Verificar autenticación: solo ejecutar si el usuario está realmente autenticado
  // Verificar tanto el store como el token para mayor seguridad
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  });
  
  useEffect(() => {
    // Actualizar hasToken cuando cambia isAuthenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setHasToken(!!token);
  }, [isAuthenticated]);

  // Solo ejecutar si el usuario está autenticado EN EL STORE (más confiable que solo el token)
  // El token puede existir pero ser inválido o expirado
  // Pero para las mutaciones, permitir si hay token (puede que el store no esté sincronizado aún)
  const isUserAuthenticated = isAuthenticated && hasToken;
  

  // Obtener carrito activo
  const {
    data: carrito,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['carrito', 'activo'],
    queryFn: getCarritoActivo,
    enabled: isUserAuthenticated,
    staleTime: 30000, // 30 segundos
    retry: false, // No reintentar automáticamente si falla
  });

  // Crear carrito (no se usa directamente, pero se mantiene para referencia)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore - Variable mantenida para referencia futura
  const _createCarritoMutation = useMutation({
    mutationFn: async () => {
      // Obtener el usuario del store directamente para asegurar que esté actualizado
      const storeUser = useAuthStore.getState().user || user;
      
      if (!storeUser) {
        throw new Error('Usuario no autenticado');
      }
      
      // El idUser es el UUID del usuario logueado (user.id), NO el idCliente ni idEmpleado
      if (!storeUser.id) {
        throw new Error('Usuario no tiene ID');
      }
      
      // El idUser es un UUID (string), no necesita conversión
      return createCarrito({ idUser: storeUser.id });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['carrito', 'activo'], data);
      toast.success('Carrito creado');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al crear el carrito';
      toast.error(message);
    },
  });

  // Agregar producto al carrito
  const addProductoMutation = useMutation({
    mutationFn: async (data: { idArreglo: number; cantidad?: number; precioUnitario: number }) => {
      // Verificar autenticación antes de continuar - verificar token directamente
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debes iniciar sesión para agregar productos al carrito');
      }
      
      // Si no está autenticado en el store pero hay token, intentar sincronizar
      let currentUser = user;
      if (!isAuthenticated || !currentUser) {
        try {
          const { checkAuthAction } = await import('@/auth/actions/check-status');
          const userData = await checkAuthAction();
          const { useAuthStore } = await import('@/auth/store/auth.store');
          useAuthStore.getState().setUser(userData);
          currentUser = userData; // Actualizar la variable local
        } catch (error) {
          throw new Error('Debes iniciar sesión para agregar productos al carrito');
        }
      }

      // Función auxiliar para obtener el idUser (el UUID del usuario logueado, no idCliente ni idEmpleado)
      const getIdUser = (): string => {
        // Obtener el usuario del store directamente para asegurar que esté actualizado
        // Importar useAuthStore directamente (ya está importado arriba)
        const storeUser = useAuthStore.getState().user || currentUser;
        
        if (!storeUser) {
          throw new Error('Usuario no autenticado');
        }
        
        // El idUser es el UUID del usuario logueado (user.id), NO el idCliente ni idEmpleado
        if (!storeUser.id) {
          throw new Error('Usuario no tiene ID');
        }
        
        // El idUser es un UUID (string), no necesita conversión
        return storeUser.id;
      };

      // Obtener el carrito actual del cache o intentar obtenerlo
      let currentCarrito = carrito;
      let carritoId = currentCarrito?.idCarrito;
      
      // Si no hay carrito en el cache, intentar obtenerlo
      // El backend puede crear el carrito automáticamente al agregar el primer producto
      if (!carritoId) {
        try {
          // Primero intentar obtener el carrito activo
          const carritoActivo = await getCarritoActivo();
          if (carritoActivo) {
            currentCarrito = carritoActivo;
            carritoId = carritoActivo.idCarrito;
            // Actualizar el cache
            queryClient.setQueryData(['carrito', 'activo'], carritoActivo);
          }
          // Si no hay carrito activo, no crear uno manualmente
          // El backend lo creará automáticamente al agregar el primer producto
        } catch (error: unknown) {
          // Si falla al obtener (403, 404 o 400), no es crítico
          // El backend puede crear el carrito automáticamente al agregar el producto
          const errorStatus = (error as { response?: { status?: number } })?.response?.status;
          if (errorStatus === 403 || errorStatus === 404 || errorStatus === 400) {
            // No crear carrito manualmente, dejar que el backend lo haga
          } else {
            throw error;
          }
        }
      }

      // Si hay carrito, verificar si el producto ya está en el carrito
      if (carritoId && currentCarrito && 'carritosArreglo' in currentCarrito) {
        const carritoConArreglos = currentCarrito as Carrito;
        const productoExistente = carritoConArreglos.carritosArreglo?.find(
          (item) => item.idArreglo === data.idArreglo
        );

        if (productoExistente) {
          // Actualizar cantidad - el backend recalculará totalLinea automáticamente
          const nuevaCantidad = (productoExistente.cantidad || 1) + (data.cantidad || 1);
          return updateCarritoArreglo(productoExistente.idCarritoArreglo, {
            cantidad: nuevaCantidad,
          });
        }
      }

      // Si no hay carrito, crear uno primero antes de agregar el producto
      if (!carritoId) {
        const idUser = getIdUser();
        // Crear carrito con estado 'activo' según la documentación
        const nuevoCarrito = await createCarrito({ idUser, estado: 'activo' });
        carritoId = nuevoCarrito.idCarrito;
        currentCarrito = nuevoCarrito;
        queryClient.setQueryData(['carrito', 'activo'], nuevoCarrito);
      }

      // Validar que tenemos un carritoId válido
      if (!carritoId || carritoId <= 0) {
        throw new Error('No se pudo obtener el ID del carrito. Por favor, intenta nuevamente.');
      }

      // Calcular valores para el nuevo producto
      const cantidad = data.cantidad || 1;
      const precioUnitario = Number(data.precioUnitario);
      
      // Validar que el precio sea válido
      if (isNaN(precioUnitario) || precioUnitario <= 0) {
        throw new Error('El precio del producto no es válido');
      }
      
      // Calcular totalLinea (cantidad * precioUnitario)
      const totalLinea = cantidad * precioUnitario;
      
      // Crear el DTO con todos los campos requeridos
      const createDto: CreateCarritoArregloDto = {
        idCarrito: carritoId,
        idArreglo: data.idArreglo,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        totalLinea: totalLinea, // Calcular totalLinea antes de enviar
      };
      
      return createCarritoArreglo(createDto);
    },
    onSuccess: () => {
      // Invalidar y refetch del carrito para actualizar el contador
      queryClient.invalidateQueries({ queryKey: ['carrito', 'activo'] });
      // Refetch para actualizar el contador en el header
      refetch();
      toast.success('Producto agregado al carrito', {
        description: 'Puedes seguir agregando más productos',
      });
    },
    onError: (error: unknown) => {
      const errorObj = error as { message?: string; response?: { data?: { message?: string } } };
      
      // Si el error es de autenticación, no mostrar toast (ya se maneja en ArregloCard)
      if (errorObj.message?.includes('Debes iniciar sesión')) {
        return;
      }
      
      const message = 
        errorObj.response?.data?.message || 
        errorObj.message || 
        'Error al agregar el producto al carrito';
      
      toast.error(message, {
        description: 'Por favor, intenta nuevamente',
      });
    },
  });

  // Actualizar cantidad
  const updateCantidadMutation = useMutation({
    mutationFn: ({ idCarritoArreglo, cantidad }: { idCarritoArreglo: number; cantidad: number }) =>
      updateCarritoArreglo(idCarritoArreglo, { cantidad }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrito', 'activo'] });
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al actualizar la cantidad';
      toast.error(message);
    },
  });

  // Eliminar producto
  const removeProductoMutation = useMutation({
    mutationFn: deleteCarritoArreglo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrito', 'activo'] });
      toast.success('Producto eliminado del carrito');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al eliminar el producto';
      toast.error(message);
    },
  });

  // Calcular totales
  // Calcular subtotal asegurando que todos los valores sean números
  const subtotal = Number(
    (carrito as Carrito)?.carritosArreglo?.reduce((sum: number, item: CarritoArreglo) => {
      // Asegurar que totalLinea sea un número
      const totalLinea = typeof item.totalLinea === 'string'
        ? parseFloat(item.totalLinea)
        : Number(item.totalLinea) || 0;
      
      // Si no hay totalLinea, calcularlo
      if (totalLinea > 0) {
        return sum + totalLinea;
      }
      
      // Calcular desde precioUnitario y cantidad
      const precioUnitario = typeof item.precioUnitario === 'string'
        ? parseFloat(item.precioUnitario)
        : Number(item.precioUnitario) || 0;
      const cantidad = Number(item.cantidad) || 0;
      
      return sum + (precioUnitario * cantidad);
    }, 0) || 0
  );

  const itemCount = (carrito as Carrito)?.carritosArreglo?.reduce((sum: number, item: CarritoArreglo) => sum + item.cantidad, 0) || 0;

  return {
    carrito: carrito || null,
    isLoading: isLoading || false,
    error: error || null,
    refetch: refetch || (() => {}),
    subtotal: Number(subtotal) || 0,
    itemCount: itemCount || 0,
    addProducto: addProductoMutation.mutate,
    updateCantidad: updateCantidadMutation.mutate,
    removeProducto: removeProductoMutation.mutate,
    isAdding: addProductoMutation.isPending || false,
    isUpdating: updateCantidadMutation.isPending || false,
    isRemoving: removeProductoMutation.isPending || false,
  };
};

