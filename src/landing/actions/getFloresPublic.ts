import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { FlorPublic } from '../types/public.interface';

/**
 * Obtiene la lista de flores activas disponibles para usar en los selectores/filtros de la landing page.
 * Endpoint: GET /flor/public
 */
export const getFloresPublic = async (): Promise<FlorPublic[]> => {
  try {
    const response = await floristeriaApi.get<FlorPublic[]>('/flor/public');
    return response.data || [];
  } catch (error) {
    console.error('Error al cargar flores públicas:', error);
    throw error;
  }
};

