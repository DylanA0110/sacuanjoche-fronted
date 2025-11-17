import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CreateAccesorioArregloDto } from '../types/arreglo-insumos.interface';

export const createAccesorioArreglo = async (data: CreateAccesorioArregloDto) => {
  const response = await floristeriaApi.post('/accesorios-arreglo', data);
  return response.data;
};

export const createAccesoriosArregloMany = async (
  items: CreateAccesorioArregloDto[]
) => {
  for (const item of items) {
    await createAccesorioArreglo(item);
  }
};
