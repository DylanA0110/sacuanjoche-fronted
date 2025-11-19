import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArreglos } from '../actions/getArreglos';
import type { Arreglo } from '../types/arreglo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetArreglosParams } from '../types/arreglo.interface';
import type { ArregloEstado } from '@/shared/types/estados.types';

interface UseArregloOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  estado?: ArregloEstado | boolean;
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

  // Error handling se hace en el componente - no necesitamos useEffect aquí

  const arreglos = useMemo(() => {
    if (!query.data) return [];

    let allArreglos: Arreglo[] = [];
    if (Array.isArray(query.data)) {
      allArreglos = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allArreglos = (query.data as PaginatedResponse<Arreglo>).data || [];
    }

    if (options?.estado !== undefined) {
      const estadoFilter: ArregloEstado = typeof options.estado === 'string'
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

    // Si es respuesta paginada, usar el total del backend
    if (typeof query.data === 'object' && 'total' in query.data) {
      const total = (query.data as PaginatedResponse<Arreglo>).total ?? 0;
      
      // Si hay filtro de estado, necesitamos contar los que coinciden
      if (options?.estado !== undefined && !options?.usePagination) {
        // Solo aplicar filtro si NO estamos usando paginación
        const allArreglos = (query.data as PaginatedResponse<Arreglo>).data || [];
        const estadoFilter: ArregloEstado = typeof options.estado === 'string'
          ? options.estado
          : options.estado
            ? 'activo'
            : 'inactivo';
        return allArreglos.filter((arreglo) => arreglo.estado === estadoFilter).length;
      }
      
      return total;
    }

    // Si es array (legacy), contar elementos
    if (Array.isArray(query.data)) {
      if (options?.estado !== undefined) {
        const estadoFilter: ArregloEstado = typeof options.estado === 'string'
          ? options.estado
          : options.estado
            ? 'activo'
            : 'inactivo';
        return query.data.filter((arreglo) => arreglo.estado === estadoFilter).length;
      }
      return query.data.length;
    }

    return 0;
  }, [query.data, options?.estado, options?.usePagination]);

  return {
    arreglos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

