import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { AccesorioPublic } from '../types/public.interface';

/**
 * Obtiene la lista de accesorios activos disponibles para usar en los selectores/filtros de la landing page.
 * Endpoint: GET /accesorio/public
 */
export const getAccesoriosPublic = async (): Promise<AccesorioPublic[]> => {
  try {
    const response = await floristeriaApi.get<AccesorioPublic[]>('/accesorio/public');
    return response.data || [];
  } catch (error) {
    console.error('Error al cargar accesorios públicos:', error);
    throw error;
  }
};

