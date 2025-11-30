import { floristeriaApi } from '@/shared/api/FloristeriaApi';

export const deleteCarritoArreglo = async (idCarritoArreglo: number): Promise<void> => {
  try {
    await floristeriaApi.delete(`/carritos-arreglo/${idCarritoArreglo}`);
  } catch (error: any) {
    throw error;
  }
};

