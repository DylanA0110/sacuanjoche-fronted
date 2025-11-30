import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { FlorPublic } from '../types/public.interface';

/**
 * Obtiene la lista de flores activas disponibles para usar en los selectores/filtros de la landing page.
 * Endpoint: GET /flor/public
 */
export const getFloresPublic = async (): Promise<FlorPublic[]> => {
  try {
    const response = await floristeriaApi.get<FlorPublic[]>('/flor/public');
    
    // Asegurar que siempre retornemos un array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    console.warn('⚠️ [getFloresPublic] La respuesta no es un array:', response.data);
    return [];
  } catch (error: any) {
    console.error('❌ [getFloresPublic] Error al cargar flores públicas:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    // Retornar array vacío en caso de error en lugar de lanzar el error
    // Esto permite que la UI funcione aunque falle la carga de flores
    return [];
  }
};

