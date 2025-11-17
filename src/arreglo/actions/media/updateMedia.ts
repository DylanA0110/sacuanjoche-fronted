import { arregloApi } from '../../api/arregloApi';
import type { Media, UpdateMediaDto } from '../../types/arreglo.interface';

export const updateMedia = async (
  arregloId: number,
  mediaId: number,
  mediaData: UpdateMediaDto
): Promise<Media> => {
  const response = await arregloApi.patch<Media>(
    `/${arregloId}/media/${mediaId}`,
    mediaData
  );
  return response.data;
};

