import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getArreglos } from '../actions/getArreglos';
import type { Arreglo } from '../types/arreglo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetArreglosParams } from '../types/arreglo.interface';
import type { ArregloEstado } from '@/shared/types/estados.types';

// Query separada para obtener el total de elementos filtrados
const useFilteredTotal = (
  estado?: ArregloEstado | boolean,
  q?: string
): number => {
  const estadoFilter: ArregloEstado | undefined =
    estado !== undefined
      ? typeof estado === 'string'
        ? estado
        : estado
        ? 'activo'
        : 'inactivo'
      : undefined;

  // Solo hacer esta query si hay filtro de estado
  const { data: allData } = useQuery<Arreglo[] | PaginatedResponse<Arreglo>>({
    queryKey: ['arreglos', 'total-filtered', estadoFilter, q],
    queryFn: () =>
      getArreglos({
        limit: 10000, // Obtener todos para contar
        offset: 0,
        ...(q && q.trim() && { q: q.trim() }),
      }),
    enabled: estadoFilter !== undefined, // Solo ejecutar si hay filtro
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return useMemo(() => {
    if (!allData || estadoFilter === undefined) return 0;

    let allArreglos: Arreglo[] = [];
    if (Array.isArray(allData)) {
      allArreglos = allData;
    } else if (typeof allData === 'object' && 'data' in allData) {
      allArreglos = (allData as PaginatedResponse<Arreglo>).data || [];
    }

    return allArreglos.filter((arreglo) => arreglo.estado === estadoFilter)
      .length;
  }, [allData, estadoFilter]);
};

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

  // Obtener el total de elementos filtrados si hay filtro de estado
  const filteredTotal = useFilteredTotal(
    options?.estado,
    normalizedQ
  );

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    // Si hay filtro de estado, usar el total filtrado
    if (options?.estado !== undefined) {
      if (options?.usePagination) {
        // Con paginación y filtro, usar el total filtrado
        return filteredTotal;
      }
      
      // Sin paginación, contar los elementos de la página actual
      let allArreglos: Arreglo[] = [];
      if (Array.isArray(query.data)) {
        allArreglos = query.data;
      } else if (typeof query.data === 'object' && 'data' in query.data) {
        allArreglos = (query.data as PaginatedResponse<Arreglo>).data || [];
      }
      
      const estadoFilter: ArregloEstado = typeof options.estado === 'string'
        ? options.estado
        : options.estado
          ? 'activo'
          : 'inactivo';
      
      return allArreglos.filter((arreglo) => arreglo.estado === estadoFilter).length;
    }

    // Sin filtro de estado, usar el total del backend
    if (options?.usePagination) {
      if (typeof query.data === 'object' && 'total' in query.data) {
        const total = (query.data as PaginatedResponse<Arreglo>).total ?? 0;
        return total;
      }
      
      if (Array.isArray(query.data)) {
        console.warn('useArreglo - Backend devolvió array cuando se esperaba respuesta paginada.');
        return query.data.length;
      }
      
      return 0;
    }

    // Sin paginación ni filtro, contar elementos
    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Arreglo>).total ?? 0;
    }

    if (Array.isArray(query.data)) {
      return query.data.length;
    }

    return 0;
  }, [query.data, options?.estado, options?.usePagination, filteredTotal]);

  return {
    arreglos,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

