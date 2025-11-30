import { useQuery } from '@tanstack/react-query';
import { getFormasArregloPublic } from '../actions/getFormasArregloPublic';
import type { FormaArregloPublic } from '../types/public.interface';

/**
 * Hook para obtener la lista de formas de arreglo públicas para los filtros de la landing page.
 * Usa el endpoint GET /forma-arreglo/public que no requiere autenticación.
 */
export const useFormasArregloPublic = () => {
  return useQuery<FormaArregloPublic[]>({
    queryKey: ['formas-arreglo-public'],
    queryFn: getFormasArregloPublic,
    staleTime: 1000 * 60 * 10, // 10 minutos - las formas de arreglo cambian poco
    retry: 1,
    // Asegurar que siempre retorne un array, incluso en caso de error
    select: (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      console.warn('⚠️ [useFormasArregloPublic] Data no es un array:', data);
      return [];
    },
    // Valor por defecto mientras carga o en caso de error
    initialData: [],
  });
};

