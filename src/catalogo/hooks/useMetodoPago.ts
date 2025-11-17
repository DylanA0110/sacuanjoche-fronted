import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMetodosPago } from '../actions/metodoPago/getMetodosPago';
import type { MetodoPago } from '../types/metodo-pago.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetMetodosPagoParams } from '../types/metodo-pago.interface';

interface UseMetodoPagoOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  estado?: 'activo' | 'inactivo' | boolean;
}

export const useMetodoPago = (options?: UseMetodoPagoOptions) => {
  const normalizedQ = options?.q && options.q.trim() ? options.q.trim() : undefined;

  const paginationParams = options?.usePagination
    ? {
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
        ...(normalizedQ && { q: normalizedQ }),
      }
    : normalizedQ
    ? {
        ...(normalizedQ && { q: normalizedQ }),
      }
    : undefined;

  const query = useQuery<MetodoPago[] | PaginatedResponse<MetodoPago>>({
    queryKey: [
      'metodosPago',
      options?.limit,
      options?.offset,
      normalizedQ,
      options?.estado,
    ],
    queryFn: () => getMetodosPago(paginationParams as GetMetodosPagoParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      console.error('Error al cargar métodos de pago:', query.error);
    }
  }, [query.isError, query.error]);

  const metodosPago = useMemo(() => {
    if (!query.data) return [];

    let allMetodos: MetodoPago[] = [];
    if (Array.isArray(query.data)) {
      allMetodos = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allMetodos = (query.data as PaginatedResponse<MetodoPago>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allMetodos.filter((metodo) => metodo.estado === estadoFilter);
    }

    return allMetodos;
  }, [query.data, options?.estado]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    let allMetodos: MetodoPago[] = [];
    if (Array.isArray(query.data)) {
      allMetodos = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allMetodos = (query.data as PaginatedResponse<MetodoPago>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allMetodos.filter((metodo) => metodo.estado === estadoFilter).length;
    }

    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<MetodoPago>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.estado]);

  return {
    metodosPago,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

