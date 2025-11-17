import { clienteApi } from '../api/clienteApi';
import type { Cliente } from '../types/cliente.interface';

export const getClienteById = async (id: number): Promise<Cliente> => {
  const response = await clienteApi.get<any>(`/${id}`);
  // Mapear 'activo' a 'estado' si es necesario
  return {
    ...response.data,
    estado: response.data.estado || response.data.activo || 'activo',
  };
};
