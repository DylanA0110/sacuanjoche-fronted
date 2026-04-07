import { clienteApi } from '../api/clienteApi';
import type { Cliente, CreateClienteDto } from '../types/cliente.interface';

export const createCliente = async (
  clienteData: CreateClienteDto
): Promise<Cliente> => {
  try {
    const telefonoNormalizado = (clienteData.telefono || '').replace(/\D/g, '');

    // Enviar campos del cliente según contrato del backend
    const payload = {
      primerNombre: clienteData.primerNombre,
      ...(clienteData.segundoNombre?.trim()
        ? { segundoNombre: clienteData.segundoNombre.trim() }
        : {}),
      primerApellido: clienteData.primerApellido,
      ...(clienteData.segundoApellido?.trim()
        ? { segundoApellido: clienteData.segundoApellido.trim() }
        : {}),
      ...(clienteData.nombreEmpresa?.trim()
        ? { nombreEmpresa: clienteData.nombreEmpresa.trim() }
        : {}),
      telefono: telefonoNormalizado,
      estado: clienteData.estado, // Siempre 'activo' para registro
    };
    
    const response = await clienteApi.post<Cliente>('/', payload);
    
    return response.data;
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

