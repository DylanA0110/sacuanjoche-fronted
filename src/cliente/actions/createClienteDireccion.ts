import { clienteDireccionApi } from '../api/clienteDireccionApi';
import type { CreateClienteDireccionDto, ClienteDireccion } from '../types/direccion.interface';

export const createClienteDireccion = async (
  data: CreateClienteDireccionDto
): Promise<ClienteDireccion> => {
  const response = await clienteDireccionApi.post<ClienteDireccion>('/', data);
  return response.data;
};

