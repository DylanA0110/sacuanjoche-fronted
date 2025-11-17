import { arregloApi } from '../api/arregloApi';
import type { Arreglo, UpdateArregloDto } from '../types/arreglo.interface';

export const updateArreglo = async (
  id: number,
  arregloData: UpdateArregloDto
): Promise<Arreglo> => {
  // cantidadFlores removida del DTO
  const response = await arregloApi.patch<any>(`/${id}`, arregloData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
    media: response.data.media || [],
  };
};

