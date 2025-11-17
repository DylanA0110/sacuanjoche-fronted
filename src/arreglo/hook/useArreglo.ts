import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArreglos } from '../actions/getArreglos';
import type { Arreglo } from '../types/arreglo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetArreglosParams } from '../types/arreglo.interface';

interface UseArregloOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  estado?: 'activo' | 'inactivo' | boolean;
}

export const useArreglo = (options?: UseArregloOptions) => {
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

  const query = useQuery<Arreglo[] | PaginatedResponse<Arreglo>>({
    queryKey: [
      'arreglos',
      options?.limit,
      options?.offset,
      normalizedQ,
      options?.estado,
    ],
    queryFn: () => getArreglos(paginationParams as GetArreglosParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      console.error('Error al cargar arreglos:', query.error);
    }
  }, [query.isError, query.error]);

  const arreglos = useMemo(() => {
    if (!query.data) return [];

    let allArreglos: Arreglo[] = [];
    if (Array.isArray(query.data)) {
      allArreglos = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allArreglos = (query.data as PaginatedResponse<Arreglo>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allArreglos.filter((arreglo) => arreglo.estado === estadoFilter);
    }

    return allArreglos;
  }, [query.data, options?.estado]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    let allArreglos: Arreglo[] = [];
    if (Array.isArray(query.data)) {
      allArreglos = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allArreglos = (query.data as PaginatedResponse<Arreglo>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      return allArreglos.filter((arreglo) => arreglo.estado === estadoFilter).length;
    }

    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Arreglo>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.estado]);

  return {
    arreglos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

