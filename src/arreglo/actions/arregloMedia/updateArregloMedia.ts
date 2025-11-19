import { arregloMediaApi } from '../../api/arregloMediaApi';
import type { ArregloMedia, UpdateArregloMediaSupabaseDto } from '../../types/arreglo-media.interface';

export const updateArregloMedia = async (
  idArreglo: number,
  mediaId: number,
  data: UpdateArregloMediaSupabaseDto
): Promise<ArregloMedia> => {
  const response = await arregloMediaApi.patch<ArregloMedia>(`/${idArreglo}/media/${mediaId}`, data);
  return response.data;
};

