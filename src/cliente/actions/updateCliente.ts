import { clienteApi } from '../api/clienteApi';
import type { Cliente, UpdateClienteDto } from '../types/cliente.interface';

export const updateCliente = async (
  id: number,
  clienteData: UpdateClienteDto
): Promise<Cliente> => {
  const payload: UpdateClienteDto = {
    ...clienteData,
    ...(clienteData.telefono !== undefined
      ? { telefono: clienteData.telefono.replace(/\D/g, '') }
      : {}),
  };

  const response = await clienteApi.patch<any>(`/${id}`, payload);
  // Mapear la respuesta para asegurar que tenga el campo 'estado'
  return {
    ...response.data,
    estado: response.data.estado || response.data.activo || 'activo',
  };
};

