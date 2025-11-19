import { arregloMediaApi } from '../../api/arregloMediaApi';
import type { ArregloMedia, CreateArregloMediaSimpleDto } from '../../types/arreglo-media.interface';

export const createArregloMedia = async (
  idArreglo: number,
  data: CreateArregloMediaSimpleDto
): Promise<ArregloMedia> => {
  const response = await arregloMediaApi.post<ArregloMedia>(`/${idArreglo}/media`, data);
  return response.data;
};

