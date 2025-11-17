import { arregloApi } from '../../api/arregloApi';
import type { Media, CreateMediaDto } from '../../types/arreglo.interface';

export const createMedia = async (
  arregloId: number,
  mediaData: CreateMediaDto
): Promise<Media> => {
  const response = await arregloApi.post<Media>(`/${arregloId}/media`, mediaData);
  return response.data;
};

