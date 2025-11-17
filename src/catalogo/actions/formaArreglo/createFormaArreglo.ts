import { formaArregloApi } from '../../api/formaArregloApi';
import type { FormaArreglo, CreateFormaArregloDto } from '../../types/forma-arreglo.interface';

export const createFormaArreglo = async (
  formaArregloData: CreateFormaArregloDto
): Promise<FormaArreglo> => {
  const response = await formaArregloApi.post<any>('/', formaArregloData);
  return {
    ...response.data,
    activo: response.data.activo ?? true,
  };
};

