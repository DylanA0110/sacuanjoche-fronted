import { accesorioApi } from '../../api/accesorioApi';
import type { Accesorio, CreateAccesorioDto } from '../../types/accesorio.interface';

export const createAccesorio = async (
  accesorioData: CreateAccesorioDto
): Promise<Accesorio> => {
  const response = await accesorioApi.post<any>('/', accesorioData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

