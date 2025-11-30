import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CarritoArreglo, UpdateCarritoArregloDto } from '../types/carrito.interface';

export const updateCarritoArreglo = async (
  idCarritoArreglo: number,
  data: UpdateCarritoArregloDto
): Promise<CarritoArreglo> => {
  try {
    const response = await floristeriaApi.patch<CarritoArreglo>(
      `/carritos-arreglo/${idCarritoArreglo}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

