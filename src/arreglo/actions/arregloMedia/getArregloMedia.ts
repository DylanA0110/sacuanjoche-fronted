import { arregloMediaApi } from '../../api/arregloMediaApi';
import type { ArregloMedia } from '../../types/arreglo-media.interface';

export const getArregloMedia = async (idArreglo: number): Promise<ArregloMedia[]> => {
  const response = await arregloMediaApi.get<ArregloMedia[]>(`/${idArreglo}/media`);
  return response.data;
};

