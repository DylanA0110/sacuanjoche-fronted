import { accesorioApi } from '../../api/accesorioApi';
import type { Accesorio, UpdateAccesorioDto } from '../../types/accesorio.interface';

export const updateAccesorio = async (
  id: number,
  accesorioData: UpdateAccesorioDto
): Promise<Accesorio> => {
  const response = await accesorioApi.patch<any>(`/${id}`, accesorioData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

