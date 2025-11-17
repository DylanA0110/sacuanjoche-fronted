import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClientes } from '../actions/getClientes';
import type { Cliente } from '../types/cliente.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';
import type { GetClientesParams } from '../types/cliente.interface';

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

  useEffect(() => {
    if (query.isError && query.error) {
      console.error('Error al cargar clientes:', query.error);
      if (query.error instanceof Error) {
        console.error('Error message:', query.error.message);
        console.error('Error stack:', query.error.stack);
      }
      if (
        query.error &&
        typeof query.error === 'object' &&
        'response' in query.error
      ) {
        console.error('Error response:', (query.error as any).response);
      }
    }
  }, [query.isError, query.error]);

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

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    let allClientes: Cliente[] = [];
    if (Array.isArray(query.data)) {
      allClientes = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allClientes = (query.data as PaginatedResponse<Cliente>).data || [];
    }

    // Si hay filtrado por estado, contar los clientes filtrados
    if (options?.activo !== undefined) {
      const estadoFilter =
        typeof options.activo === 'string'
          ? options.activo
          : options.activo
          ? 'activo'
          : 'inactivo';
      return allClientes.filter((cliente) => cliente.estado === estadoFilter)
        .length;
    }

    // Si no hay filtrado, usar el total del backend
    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Cliente>).total ?? 0;
    }

    return 0;
  }, [query.data, options?.activo]);

  return {
    clientes,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
