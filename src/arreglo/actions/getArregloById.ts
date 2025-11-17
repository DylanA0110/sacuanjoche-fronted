import { arregloApi } from '../api/arregloApi';
import type { Arreglo } from '../types/arreglo.interface';

export const getArregloById = async (id: number): Promise<Arreglo> => {
  const response = await arregloApi.get<any>(`/${id}`);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
    media: response.data.media || [],
  };
};

