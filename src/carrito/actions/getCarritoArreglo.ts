import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CarritoArreglo } from '../types/carrito.interface';

/**
 * Obtener un carrito arreglo por ID
 * GET /api/carritos-arreglo/{id}
 */
export const getCarritoArreglo = async (idCarritoArreglo: number): Promise<CarritoArreglo> => {
  try {
    const response = await floristeriaApi.get<CarritoArreglo>(`/carritos-arreglo/${idCarritoArreglo}`);
    return response.data;
  } catch (error: any) {
    console.error(`❌ [getCarritoArreglo] Error al obtener carrito arreglo ${idCarritoArreglo}:`, error);
    throw error;
  }
};

