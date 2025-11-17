import { clienteApi } from '../api/clienteApi';
import type { Cliente, CreateClienteDto } from '../types/cliente.interface';

export const createCliente = async (
  clienteData: CreateClienteDto
): Promise<Cliente> => {
  const response = await clienteApi.post<any>('/', clienteData);
  // Mapear la respuesta para asegurar que tenga el campo 'estado'
  return {
    ...response.data,
    estado: response.data.estado || response.data.activo || 'activo',
  };
};

