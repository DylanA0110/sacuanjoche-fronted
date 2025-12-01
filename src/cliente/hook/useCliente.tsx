import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClientes } from '../actions/getClientes';
import type { Cliente } from '../types/cliente.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetClientesParams } from '../types/cliente.interface';

// Query separada para obtener el total de elementos filtrados
const useFilteredTotal = (
  activo?: 'activo' | 'inactivo' | boolean,
  q?: string
): number => {
  const estadoFilter: 'activo' | 'inactivo' | undefined =
    activo !== undefined
      ? typeof activo === 'string'
        ? activo
        : activo
        ? 'activo'
        : 'inactivo'
      : undefined;

  // Solo hacer esta query si hay filtro de estado
  const { data: allData } = useQuery<Cliente[] | PaginatedResponse<Cliente>>({
    queryKey: ['clientes', 'total-filtered', estadoFilter, q],
    queryFn: () =>
      getClientes({
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

    let allClientes: Cliente[] = [];
    if (Array.isArray(allData)) {
      allClientes = allData;
    } else if (typeof allData === 'object' && 'data' in allData) {
      allClientes = (allData as PaginatedResponse<Cliente>).data || [];
    }

    return allClientes.filter((cliente) => cliente.estado === estadoFilter)
      .length;
  }, [allData, estadoFilter]);
};

interface UseClienteOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  activo?: 'activo' | 'inactivo' | boolean; // Puede ser string o boolean (se convierte internamente)
}

export const useCliente = (options?: UseClienteOptions) => {
  // Normalizar el parámetro q: si está vacío o undefined, no lo incluimos
  const normalizedQ =
    options?.q && options.q.trim() ? options.q.trim() : undefined;

  // El backend no acepta 'activo' en query params, así que lo filtramos en el frontend
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

  const query = useQuery<Cliente[] | PaginatedResponse<Cliente>>({
    queryKey: [
      'clientes',
      options?.limit,
      options?.offset,
      normalizedQ,
      options?.activo,
    ],
    queryFn: () => getClientes(paginationParams as GetClientesParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  // Error handling se hace en el componente - no necesitamos useEffect aquí

  const clientes = useMemo(() => {
    if (!query.data) return [];

    let allClientes: Cliente[] = [];
    if (Array.isArray(query.data)) {
      allClientes = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allClientes = (query.data as PaginatedResponse<Cliente>).data || [];
    }

    // Filtrar por estado si se especifica (el backend no acepta este filtro en query params)
    if (options?.activo !== undefined) {
      const estadoFilter =
        typeof options.activo === 'string'
          ? options.activo
          : options.activo
          ? 'activo'
          : 'inactivo';
      return allClientes.filter((cliente) => cliente.estado === estadoFilter);
    }

    return allClientes;
  }, [query.data, options?.activo]);

  // Obtener el total de elementos filtrados si hay filtro de estado
  const filteredTotal = useFilteredTotal(
    options?.activo,
    options?.q
  );

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    // Si hay filtro de estado, usar el total filtrado
    if (options?.activo !== undefined) {
      if (options?.usePagination) {
        // Con paginación y filtro, usar el total filtrado
        return filteredTotal;
      }
      
      // Sin paginación, contar los elementos de la página actual
      let allClientes: Cliente[] = [];
      if (Array.isArray(query.data)) {
        allClientes = query.data;
      } else if (typeof query.data === 'object' && 'data' in query.data) {
        allClientes = (query.data as PaginatedResponse<Cliente>).data || [];
      }
      
      const estadoFilter =
        typeof options.activo === 'string'
          ? options.activo
          : options.activo
          ? 'activo'
          : 'inactivo';
      
      return allClientes.filter((cliente) => cliente.estado === estadoFilter)
        .length;
    }

    // Sin filtro de estado, usar el total del backend
    if (options?.usePagination) {
      if (typeof query.data === 'object' && 'total' in query.data) {
        const total = (query.data as PaginatedResponse<Cliente>).total ?? 0;
        return total;
      }
      
      if (Array.isArray(query.data)) {
        return query.data.length;
      }
      
      return 0;
    }

    // Sin paginación ni filtro, contar elementos
    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Cliente>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.activo, options?.usePagination, filteredTotal]);

  return {
    clientes,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
