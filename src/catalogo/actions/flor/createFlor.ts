import { florApi } from '../../api/florApi';
import type { Flor, CreateFlorDto } from '../../types/flor.interface';

export const createFlor = async (florData: CreateFlorDto): Promise<Flor> => {
  const response = await florApi.post<any>('/', florData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

