import { arregloApi } from '../api/arregloApi';
import type { Arreglo, UpdateArregloDto } from '../types/arreglo.interface';

export const updateArreglo = async (
  id: number,
  arregloData: UpdateArregloDto
): Promise<Arreglo> => {
  const response = await arregloApi.patch<any>(`/${id}`, arregloData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
    media: response.data.media || [],
  };
};

