import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { AuthResponse } from '../types/Auth.response';
import { clearTokenCache } from '@/shared/utils/tokenUtils';
import { clearExpirationCache } from '@/shared/api/interceptors';

export interface LoginDto {
  email: string;
  password: string;
}

export const loginAction = async (loginData: LoginDto): Promise<AuthResponse> => {
  console.log('🔐 [loginAction] Iniciando login...', { ...loginData, password: '***' });
  try {
    console.log('📤 [loginAction] Enviando request a /auth/login');
    const { data } = await floristeriaApi.post<AuthResponse>('/auth/login', loginData);
    console.log('✅ [loginAction] Respuesta recibida:', { 
      hasToken: !!data.token,
      id: data.id,
      email: data.email,
      roles: data.roles,
      hasCliente: !!data.cliente,
      hasEmpleado: !!data.empleado,
    });
    
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      console.log('✅ [loginAction] Token guardado en localStorage');
      // Limpiar caché del token anterior y del interceptor
      clearTokenCache();
      clearExpirationCache();
    } else {
      console.warn('⚠️ [loginAction] No se recibió token en la respuesta');
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ [loginAction] Error al hacer login:', error);
    
    // Mostrar TODOS los detalles del error del backend
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method,
      requestData: error.config?.data ? { ...JSON.parse(error.config.data), password: '***' } : null,
    };
    
    console.error('❌ [loginAction] Detalles completos del error:', errorDetails);
    console.error('❌ [loginAction] Response data completo:', JSON.stringify(error.response?.data, null, 2));
    
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
      // Si hay un objeto con detalles
      else if (errorData.details || errorData.reason) {
        errorMessage = errorData.details || errorData.reason || 'Error al iniciar sesión';
      }
      // Mensaje por defecto
      else {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Error al iniciar sesión'}`;
      }
      
      console.error('❌ [loginAction] Mensaje de error extraído:', errorMessage);
      console.error('❌ [loginAction] Status code:', error.response.status);
      
      // Crear un nuevo error con el mensaje del backend y toda la información
      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      (customError as any).status = error.response.status;
      (customError as any).errorDetails = errorDetails;
      throw customError;
    }
    
    // Si no hay response, es un error de red
    if (error instanceof Error) {
      console.error('❌ [loginAction] Error de red o sin respuesta del servidor');
      throw error;
    }
    
    throw new Error('Error al iniciar sesión. Por favor, intenta nuevamente.');
  }
};

