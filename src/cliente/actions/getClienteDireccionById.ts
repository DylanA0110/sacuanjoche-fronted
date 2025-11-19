import { clienteDireccionApi } from '../api/clienteDireccionApi';
import type { ClienteDireccion } from '../types/direccion.interface';

export const getClienteDireccionById = async (
  id: number
): Promise<ClienteDireccion> => {
  const response = await clienteDireccionApi.get<ClienteDireccion>(`/${id}`);
  return response.data;
};

