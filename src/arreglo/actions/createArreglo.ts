import { arregloApi } from '../api/arregloApi';
import type { Arreglo, CreateArregloDto } from '../types/arreglo.interface';

export const createArreglo = async (
  arregloData: CreateArregloDto
): Promise<Arreglo> => {
  // cantidadFlores removida; enviar solo campos actuales
  const response = await arregloApi.post<any>('/', arregloData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

