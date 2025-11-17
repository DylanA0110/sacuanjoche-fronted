import { accesorioApi } from '../../api/accesorioApi';
import type { Accesorio } from '../../types/accesorio.interface';

export const getAccesorioById = async (id: number): Promise<Accesorio> => {
  const response = await accesorioApi.get<any>(`/${id}`);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

