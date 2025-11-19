import { arregloMediaApi } from '../../api/arregloMediaApi';
import type { ArregloMedia, CreateArregloMediaBatchDto } from '../../types/arreglo-media.interface';

export const createArregloMediaBatch = async (
  idArreglo: number,
  data: CreateArregloMediaBatchDto
): Promise<ArregloMedia[]> => {
  const response = await arregloMediaApi.post<ArregloMedia[]>(`/${idArreglo}/media/batch`, data);
  return response.data;
};

