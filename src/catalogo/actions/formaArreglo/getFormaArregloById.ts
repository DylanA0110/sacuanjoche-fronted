import { formaArregloApi } from '../../api/formaArregloApi';
import type { FormaArreglo } from '../../types/forma-arreglo.interface';

export const getFormaArregloById = async (id: number): Promise<FormaArreglo> => {
  const response = await formaArregloApi.get<any>(`/${id}`);
  return {
    ...response.data,
    activo: response.data.activo ?? true,
  };
};

