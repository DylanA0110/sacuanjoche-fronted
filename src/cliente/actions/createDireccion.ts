import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CreateDireccionDto, Direccion } from '../types/direccion.interface';

export const createDireccion = async (
  data: CreateDireccionDto
): Promise<Direccion> => {
  try {
    const response = await floristeriaApi.post<Direccion>('/direccion', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

