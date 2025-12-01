import { useQuery } from '@tanstack/react-query';
import { getFloresPublic } from '../actions/getFloresPublic';
import type { FlorPublic } from '../types/public.interface';

/**
 * Hook para obtener la lista de flores públicas para los filtros de la landing page.
 * Usa el endpoint GET /flor/public que no requiere autenticación.
 */
export const useFloresPublic = () => {
  return useQuery<FlorPublic[]>({
    queryKey: ['flores-public'],
    queryFn: getFloresPublic,
    staleTime: 1000 * 60 * 10, // 10 minutos - las flores cambian poco
    retry: 1,
    // Asegurar que siempre retorne un array, incluso en caso de error
    select: (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return [];
    },
    // Valor por defecto mientras carga o en caso de error
    initialData: [],
  });
};

