import { florApi } from '../../api/florApi';
import type { Flor } from '../../types/flor.interface';

export const getFlorById = async (id: number): Promise<Flor> => {
  const response = await florApi.get<any>(`/${id}`);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

