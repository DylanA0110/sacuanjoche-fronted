import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { FormaArregloPublic } from '../types/public.interface';

/**
 * Obtiene la lista de formas de arreglo activas disponibles para usar en los selectores/filtros de la landing page.
 * Endpoint: GET /forma-arreglo/public
 */
export const getFormasArregloPublic = async (): Promise<FormaArregloPublic[]> => {
  try {
    const response = await floristeriaApi.get<FormaArregloPublic[]>('/forma-arreglo/public');
    
    // Asegurar que siempre retornemos un array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    // Retornar array vacío en caso de error en lugar de lanzar el error
    // Esto permite que la UI funcione aunque falle la carga de formas de arreglo
    return [];
  }
};

