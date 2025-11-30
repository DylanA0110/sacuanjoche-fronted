import { useQuery } from '@tanstack/react-query';
import { getAccesoriosPublic } from '../actions/getAccesoriosPublic';
import type { AccesorioPublic } from '../types/public.interface';

/**
 * Hook para obtener la lista de accesorios públicos para los filtros de la landing page.
 * Usa el endpoint GET /accesorio/public que no requiere autenticación.
 */
export const useAccesoriosPublic = () => {
  return useQuery<AccesorioPublic[]>({
    queryKey: ['accesorios-public'],
    queryFn: getAccesoriosPublic,
    staleTime: 1000 * 60 * 10, // 10 minutos - los accesorios cambian poco
    retry: 1,
  });
};

