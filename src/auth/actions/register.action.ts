import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { AuthResponse } from '../types/Auth.response';
import { clearTokenCache } from '@/shared/utils/tokenUtils';

export interface ClienteDataDto {
  primerNombre: string;
  primerApellido: string;
  ruc?: string | null;
  direccion?: string;
  telefono: string;
  notas?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  clienteId?: number | null;
  empleadoId?: number | null;
  estado?: 'activo' | 'inactivo';
  clienteData?: ClienteDataDto; // Para registro de clientes desde landing
}

export const registerAction = async (registerData: RegisterDto): Promise<AuthResponse> => {
  console.log('📝 [registerAction] Iniciando registro...', { ...registerData, password: '***' });
  try {
    console.log('📤 [registerAction] Enviando request a /auth/register');
    const { data } = await floristeriaApi.post<AuthResponse>('/auth/register', registerData);
    console.log('✅ [registerAction] Respuesta recibida:', { 
      hasToken: !!data.token,
      id: data.id,
      email: data.email,
      roles: data.roles,
    });
    
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('✅ [registerAction] Token guardado en localStorage');
      // Limpiar caché del token anterior
      clearTokenCache();
    } else {
      console.warn('⚠️ [registerAction] No se recibió token en la respuesta');
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ [registerAction] Error al registrar:', error);
    console.error('❌ [registerAction] Error details:', {
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
      let errorMessage: string;
      
      // Si es un array de mensajes (validaciones de NestJS)
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(', ');
      }
      // Si es un string
      else if (typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
      // Si hay un campo 'error'
      else if (typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }
      // Si el data completo es un string
      else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      // Mensaje por defecto
      else {
        errorMessage = 'Error al crear la cuenta';
      }
      
      console.error('❌ [registerAction] Mensaje de error del backend:', errorMessage);
      
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
    
    throw new Error('Error al crear la cuenta. Por favor, intenta nuevamente.');
  }
};

