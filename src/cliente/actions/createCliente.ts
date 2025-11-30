import { clienteApi } from '../api/clienteApi';
import type { Cliente, CreateClienteDto } from '../types/cliente.interface';

export const createCliente = async (
  clienteData: CreateClienteDto
): Promise<Cliente> => {
  console.log('📦 [createCliente] Iniciando creación de cliente...', clienteData);
  try {
    // Enviar solo los campos requeridos: primerNombre, primerApellido, telefono, estado
    const payload = {
      primerNombre: clienteData.primerNombre,
      primerApellido: clienteData.primerApellido,
      telefono: clienteData.telefono,
      estado: clienteData.estado, // Siempre 'activo' para registro
    };
    
    console.log('📤 [createCliente] Enviando payload:', payload);
    const response = await clienteApi.post<Cliente>('/', payload);
    console.log('✅ [createCliente] Respuesta recibida:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('❌ [createCliente] Error al crear cliente:', error);
    console.error('❌ [createCliente] Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });
    
    // Extraer el mensaje de error del backend de forma consistente
    if (error.response?.data) {
      const errorData = error.response.data;
      const errorMessage = 
        errorData.message || 
        errorData.error || 
        (typeof errorData === 'string' ? errorData : null) ||
        'Error al crear el cliente';
      
      console.error('❌ [createCliente] Mensaje de error del backend:', errorMessage);
      
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

