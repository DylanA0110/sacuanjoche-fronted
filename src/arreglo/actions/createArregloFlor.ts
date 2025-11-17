import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CreateArregloFlorDto } from '../types/arreglo-insumos.interface';

export const createArregloFlor = async (data: CreateArregloFlorDto) => {
  const response = await floristeriaApi.post('/arreglo-flor', data);
  return response.data;
};

export const createArregloFlorMany = async (
  items: CreateArregloFlorDto[]
) => {
  for (const item of items) {
    await createArregloFlor(item);
  }
};
