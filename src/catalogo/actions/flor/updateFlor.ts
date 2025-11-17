import { florApi } from '../../api/florApi';
import type { Flor, UpdateFlorDto } from '../../types/flor.interface';

export const updateFlor = async (
  id: number,
  florData: UpdateFlorDto
): Promise<Flor> => {
  const response = await florApi.patch<any>(`/${id}`, florData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

