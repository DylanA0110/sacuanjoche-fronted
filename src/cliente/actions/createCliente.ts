import { clienteApi } from '../api/clienteApi';
import type { Cliente, CreateClienteDto } from '../types/cliente.interface';

export const createCliente = async (
  clienteData: CreateClienteDto
): Promise<Cliente> => {
  try {
    const response = await clienteApi.post<any>('/', clienteData);
    // Mapear la respuesta para asegurar que tenga el campo 'estado'
    return {
      ...response.data,
      estado: response.data.estado || response.data.activo || 'activo',
    };
  } catch (error: any) {
    // Extraer el mensaje de error del backend de forma consistente
    if (error.response?.data) {
      const errorData = error.response.data;
      const errorMessage = 
        errorData.message || 
        errorData.error || 
        (typeof errorData === 'string' ? errorData : null) ||
        'Error al crear el cliente';
      
      // Crear un nuevo error con el mensaje del backend
      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      (customError as any).status = error.response.status;
      throw customError;
    }
    
    // Si no hay response, es un error de red
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error al crear el cliente. Por favor, intenta nuevamente.');
  }
};

