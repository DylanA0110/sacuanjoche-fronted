import { formaArregloApi } from '../../api/formaArregloApi';
import type { FormaArreglo, UpdateFormaArregloDto } from '../../types/forma-arreglo.interface';

export const updateFormaArreglo = async (
  id: number,
  formaArregloData: UpdateFormaArregloDto
): Promise<FormaArreglo> => {
  const response = await formaArregloApi.patch<any>(`/${id}`, formaArregloData);
  return {
    ...response.data,
    activo: response.data.activo ?? true,
  };
};

