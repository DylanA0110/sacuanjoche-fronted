import { arregloApi } from '../../api/arregloApi';
import type { Media } from '../../types/arreglo.interface';

export const getArregloMedia = async (id: number): Promise<Media[]> => {
  const response = await arregloApi.get<Media[]>(`/${id}/media`);
  return response.data || [];
};

