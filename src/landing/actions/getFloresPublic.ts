import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { FlorPublic } from '../types/public.interface';

/**
 * Obtiene la lista de flores activas disponibles para usar en los selectores/filtros de la landing page.
 * Endpoint: GET /flor/public
 */
export const getFloresPublic = async (): Promise<FlorPublic[]> => {
  try {
    const response = await floristeriaApi.get<FlorPublic[]>('/flor/public', {
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    
    // Verificar si la respuesta es HTML (error de ngrok)
    if (typeof response.data === 'string' && (response.data as string).trim().startsWith('<!DOCTYPE')) {
      console.error('❌ [getFloresPublic] Ngrok bloqueó la petición, recibió HTML en lugar de JSON');
      return [];
    }
    
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
      isHtml: typeof error.response?.data === 'string' && error.response?.data?.includes('<!DOCTYPE'),
    });
    // Retornar array vacío en caso de error en lugar de lanzar el error
    // Esto permite que la UI funcione aunque falle la carga de flores
    return [];
  }
};

