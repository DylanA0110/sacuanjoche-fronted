import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFacturas } from '../actions/getFacturas';
import type { Factura } from '../types/factura.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

// Query separada para obtener el total de facturas no anuladas
const useFilteredTotal = (excludeAnuladas?: boolean, q?: string): number => {
  // Solo hacer esta query si hay filtro de anuladas
  const { data: allData } = useQuery<Factura[] | PaginatedResponse<Factura>>({
    queryKey: ['facturas', 'total-filtered', excludeAnuladas, q],
    queryFn: () =>
      getFacturas({
        limit: 10000, // Obtener todos para contar
        offset: 0,
        ...(q && q.trim() && { q: q.trim() }),
      }),
    enabled: excludeAnuladas === true, // Solo ejecutar si hay filtro
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return useMemo(() => {
    if (!allData || !excludeAnuladas) return 0;

    let allFacturas: Factura[] = [];
    if (Array.isArray(allData)) {
      allFacturas = allData;
    } else if (typeof allData === 'object' && 'data' in allData) {
      allFacturas = (allData as PaginatedResponse<Factura>).data || [];
    }

    return allFacturas.filter(
      (factura) => factura.estado?.toLowerCase() !== 'anulada'
    ).length;
  }, [allData, excludeAnuladas]);
};

interface UseFacturaOptions {
  limit?: number;
  offset?: number;
  q?: string;
  usePagination?: boolean;
  excludeAnuladas?: boolean; // Filtrar facturas anuladas
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
    staleTime: paginationParams ? 0 : 1000 * 60 * 5,
    retry: 1,
  });

  const facturas = useMemo(() => {
    if (!query.data) return [];

    let allFacturas: Factura[] = [];
    if (Array.isArray(query.data)) {
      allFacturas = query.data;
    } else if (typeof query.data === 'object' && 'data' in query.data) {
      allFacturas = (query.data as PaginatedResponse<Factura>).data || [];
    }

    // Filtrar facturas anuladas si se especifica
    if (options?.excludeAnuladas) {
      return allFacturas.filter(
        (factura) => factura.estado?.toLowerCase() !== 'anulada'
      );
    }

    return allFacturas;
  }, [query.data, options?.excludeAnuladas]);

  // Obtener el total de facturas no anuladas si hay filtro
  const filteredTotal = useFilteredTotal(options?.excludeAnuladas, options?.q);

  const totalItems = useMemo(() => {
    if (!query.data) return 0;

    // Si hay filtro de anuladas, usar el total filtrado
    if (options?.excludeAnuladas) {
      if (options?.usePagination) {
        // Con paginación y filtro, usar el total filtrado
        console.log('useFactura - totalItems filtrado:', filteredTotal);
        return filteredTotal;
      }

      // Sin paginación, contar los elementos de la página actual
      let allFacturas: Factura[] = [];
      if (Array.isArray(query.data)) {
        allFacturas = query.data;
      } else if (typeof query.data === 'object' && 'data' in query.data) {
        allFacturas = (query.data as PaginatedResponse<Factura>).data || [];
      }

      return allFacturas.filter(
        (factura) => factura.estado?.toLowerCase() !== 'anulada'
      ).length;
    }

    // Sin filtro, usar el total del backend
    if (options?.usePagination) {
      if (typeof query.data === 'object' && 'total' in query.data) {
        const total = (query.data as PaginatedResponse<Factura>).total ?? 0;
        console.log(
          'useFactura - totalItems desde PaginatedResponse (sin filtro):',
          total
        );
        return total;
      }

      if (Array.isArray(query.data)) {
        console.warn(
          'useFactura - Backend devolvió array cuando se esperaba respuesta paginada.'
        );
        return query.data.length;
      }

      return 0;
    }

    // Sin paginación ni filtro, contar elementos
    if (Array.isArray(query.data)) return query.data.length;

    if (typeof query.data === 'object' && 'total' in query.data) {
      return (query.data as PaginatedResponse<Factura>).total ?? 0;
    }

    return 0;
  }, [
    query.data,
    options?.usePagination,
    options?.excludeAnuladas,
    filteredTotal,
  ]);

  return {
    facturas,
    totalItems,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
