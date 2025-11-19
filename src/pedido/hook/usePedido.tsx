import { useEffect, useMemo } from 'react';
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

    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Pedido>).total ?? 0;
    }

    return 0;
  }, [query.data]);

  return {
    pedidos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
