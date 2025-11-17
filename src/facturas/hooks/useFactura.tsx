import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFacturas } from '../actions/getFacturas';
import type { Factura } from '../types/factura.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

interface UseFacturaOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
}

export const useFactura = (options?: UseFacturaOptions) => {
  const paginationParams = options?.usePagination
    ? {
        limit: options.limit ?? 10,
        offset: options.offset ?? 0,
        q: options.q,
      }
    : options?.q
    ? { q: options.q }
    : undefined;

  const query = useQuery<Factura[] | PaginatedResponse<Factura>>({
    queryKey: [
      'facturas',
      paginationParams?.limit,
      paginationParams?.offset,
      paginationParams?.q,
    ],
    queryFn: () => getFacturas(paginationParams),
    staleTime: paginationParams ? 0 : 1000 * 60 * 5, // No cachear cuando hay paginación
    retry: 1,
  });

  // Log errores en consola
  useEffect(() => {
    if (query.isError && query.error) {
      console.error('Error al cargar facturas:', query.error);
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

  const facturas = useMemo(() => {
    if (!query.data) return [];

    if (Array.isArray(query.data)) return query.data;

    if (typeof query.data === 'object' && 'data' in query.data) {
      return (query.data as unknown as PaginatedResponse<Factura>).data || [];
    }

    return [];
  }, [query.data]);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as unknown as PaginatedResponse<Factura>).total ?? 0;
    }

    return 0;
  }, [query.data]);

  return {
    facturas,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
