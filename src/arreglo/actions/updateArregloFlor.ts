import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CreateArregloFlorDto } from '../types/arreglo-insumos.interface';

export interface UpdateArregloFlorDto {
  idFlor?: number;
  cantidad?: number;
}

export const updateArregloFlor = async (
  idArregloFlor: number,
  data: UpdateArregloFlorDto
) => {
  const response = await floristeriaApi.patch(`/arreglo-flor/${idArregloFlor}`, data);
  return response.data;
};

