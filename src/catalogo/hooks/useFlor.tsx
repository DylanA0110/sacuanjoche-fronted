import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFlores } from '../actions/flor/getFlores';
import type { Flor } from '../types/flor.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetFloresParams } from '../types/flor.interface';

interface UseFlorOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  estado?: 'activo' | 'inactivo' | boolean;
}

export const useFlor = (options?: UseFlorOptions) => {
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

  const query = useQuery<Flor[] | PaginatedResponse<Flor>>({
    queryKey: [
      'flores',
      options?.limit,
      options?.offset,
      normalizedQ,
      options?.estado,
    ],
    queryFn: () => getFlores(paginationParams as GetFloresParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      // Error al cargar flores
    }
  }, [query.isError, query.error]);

  const flores = useMemo(() => {
    if (!query.data) return [];

    let allFlores: Flor[] = [];
    if (Array.isArray(query.data)) {
      allFlores = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allFlores = (query.data as PaginatedResponse<Flor>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allFlores.filter((flor) => flor.estado === estadoFilter);
    }

    return allFlores;
  }, [query.data, options?.estado]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    let allFlores: Flor[] = [];
    if (Array.isArray(query.data)) {
      allFlores = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allFlores = (query.data as PaginatedResponse<Flor>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allFlores.filter((flor) => flor.estado === estadoFilter).length;
    }

    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Flor>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.estado]);

  return {
    flores,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

