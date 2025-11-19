import { clienteDireccionApi } from '../api/clienteDireccionApi';
import type { UpdateClienteDireccionDto, ClienteDireccion } from '../types/direccion.interface';

export const updateClienteDireccion = async (
  id: number,
  data: UpdateClienteDireccionDto
): Promise<ClienteDireccion> => {
  const response = await clienteDireccionApi.patch<ClienteDireccion>(`/${id}`, data);
  return response.data;
};

