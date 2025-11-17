import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CreateAccesorioArregloDto } from '../types/arreglo-insumos.interface';

export interface UpdateAccesorioArregloDto {
  idAccesorio?: number;
  cantidad?: number;
}

export const updateAccesorioArreglo = async (
  idAccesorioArreglo: number,
  data: UpdateAccesorioArregloDto
) => {
  const response = await floristeriaApi.patch(`/accesorios-arreglo/${idAccesorioArreglo}`, data);
  return response.data;
};

