import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFormasArreglo } from '../actions/formaArreglo/getFormasArreglo';
import type { FormaArreglo } from '../types/forma-arreglo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetFormasArregloParams } from '../types/forma-arreglo.interface';

interface UseFormaArregloOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  activo?: boolean;
}

export const useFormaArreglo = (options?: UseFormaArregloOptions) => {
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

  const query = useQuery<FormaArreglo[] | PaginatedResponse<FormaArreglo>>({
    queryKey: [
      'formasArreglo',
      options?.limit,
      options?.offset,
      normalizedQ,
      options?.activo,
    ],
    queryFn: () => getFormasArreglo(paginationParams as GetFormasArregloParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      // Error al cargar formas de arreglo
    }
  }, [query.isError, query.error]);

  const formasArreglo = useMemo(() => {
    if (!query.data) return [];

    let allFormas: FormaArreglo[] = [];
    if (Array.isArray(query.data)) {
      allFormas = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allFormas = (query.data as PaginatedResponse<FormaArreglo>).data || [];
    }

    if (options?.activo !== undefined) {
      return allFormas.filter((forma) => forma.activo === options.activo);
    }

    return allFormas;
  }, [query.data, options?.activo]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    let allFormas: FormaArreglo[] = [];
    if (Array.isArray(query.data)) {
      allFormas = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allFormas = (query.data as PaginatedResponse<FormaArreglo>).data || [];
    }

    if (options?.activo !== undefined) {
      return allFormas.filter((forma) => forma.activo === options.activo).length;
    }

    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<FormaArreglo>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.activo]);

  return {
    formasArreglo,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

