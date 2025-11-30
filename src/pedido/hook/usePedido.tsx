import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPedidos } from '../actions/getPedidos';
import type { Pedido } from '../types/pedido.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UsePedidoOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
}

export const usePedido = (options?: UsePedidoOptions) => {
  const paginationParams = options?.usePagination
    ? {
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
        q: options.q,
      }
    : options?.q
    ? { q: options.q }
    : undefined;

  const query = useQuery<Pedido[] | PaginatedResponse<Pedido>>({
    queryKey: [
      'pedidos',
      paginationParams?.limit,
      paginationParams?.offset,
      paginationParams?.q,
    ],
    queryFn: () => getPedidos(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  // Error handling se hace en el componente - no necesitamos useEffect aquí

  const pedidos = useMemo(() => {
    if (!query.data) return [];

    if (Array.isArray(query.data)) return query.data;

    if (typeof query.data === 'object' && 'data' in query.data) {
      return (query.data as PaginatedResponse<Pedido>).data || [];
    }

    return [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    // Si estamos usando paginación, el backend DEBE devolver un objeto con 'total'
    if (options?.usePagination) {
      // Con paginación, siempre buscar el 'total' en la respuesta
      if (typeof query.data === 'object' && 'total' in query.data) {
        const total = (query.data as PaginatedResponse<Pedido>).total ?? 0;
        return total;
      }
      
      // Si el backend devuelve un array cuando se espera paginación,
      // esto es un error - el backend debería devolver el total real
      // Pero por ahora, asumimos que si hay más elementos que el limit, hay más páginas
      if (Array.isArray(query.data)) {
        console.warn('Backend devolvió array cuando se esperaba respuesta paginada. Esto no debería pasar con paginación.');
        // Si tenemos exactamente 'limit' elementos, podría haber más páginas
        // Pero no podemos saber el total real sin hacer otra llamada
        // Por ahora, retornamos el length pero esto es incorrecto
        return query.data.length;
      }
      
      return 0;
    }

    // Sin paginación, contar los elementos del array
    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Pedido>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.usePagination]);

  return {
    pedidos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
