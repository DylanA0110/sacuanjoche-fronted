import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAccesorios } from '../actions/accesorio/getAccesorios';
import type { Accesorio } from '../types/accesorio.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetAccesoriosParams } from '../types/accesorio.interface';

interface UseAccesorioOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  estado?: 'activo' | 'inactivo' | boolean;
}

export const useAccesorio = (options?: UseAccesorioOptions) => {
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

  const query = useQuery<Accesorio[] | PaginatedResponse<Accesorio>>({
    queryKey: [
      'accesorios',
      options?.limit,
      options?.offset,
      normalizedQ,
      options?.estado,
    ],
    queryFn: () => getAccesorios(paginationParams as GetAccesoriosParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      console.error('Error al cargar accesorios:', query.error);
    }
  }, [query.isError, query.error]);

  const accesorios = useMemo(() => {
    if (!query.data) return [];

    let allAccesorios: Accesorio[] = [];
    if (Array.isArray(query.data)) {
      allAccesorios = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allAccesorios = (query.data as PaginatedResponse<Accesorio>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allAccesorios.filter((accesorio) => accesorio.estado === estadoFilter);
    }

    return allAccesorios;
  }, [query.data, options?.estado]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    let allAccesorios: Accesorio[] = [];
    if (Array.isArray(query.data)) {
      allAccesorios = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allAccesorios = (query.data as PaginatedResponse<Accesorio>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allAccesorios.filter((accesorio) => accesorio.estado === estadoFilter).length;
    }

    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Accesorio>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.estado]);

  return {
    accesorios,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

