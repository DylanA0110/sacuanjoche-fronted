import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { FormaArregloPublic } from '../types/public.interface';

/**
 * Obtiene la lista de formas de arreglo activas disponibles para usar en los selectores/filtros de la landing page.
 * Endpoint: GET /forma-arreglo/public
 */
export const getFormasArregloPublic = async (): Promise<FormaArregloPublic[]> => {
  try {
    const response = await floristeriaApi.get<FormaArregloPublic[]>('/forma-arreglo/public', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    // Verificar si la respuesta es HTML (error de ngrok)
    if (typeof response.data === 'string' && (response.data as string).trim().startsWith('<!DOCTYPE')) {
      console.error('❌ [getFormasArregloPublic] Ngrok bloqueó la petición, recibió HTML en lugar de JSON');
      return [];
    }
    
    // Asegurar que siempre retornemos un array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    console.warn('⚠️ [getFormasArregloPublic] La respuesta no es un array:', response.data);
    return [];
  } catch (error: any) {
    console.error('❌ [getFormasArregloPublic] Error al cargar formas de arreglo públicas:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isHtml: typeof error.response?.data === 'string' && error.response?.data?.includes('<!DOCTYPE'),
    });
    // Retornar array vacío en caso de error en lugar de lanzar el error
    // Esto permite que la UI funcione aunque falle la carga de formas de arreglo
    return [];
  }
};

