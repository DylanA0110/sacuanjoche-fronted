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
    console.error('❌ [loginAction] Error details:', {
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
        'Error al iniciar sesión';
      
      console.error('❌ [loginAction] Mensaje de error del backend:', errorMessage);
      
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
    
    throw new Error('Error al iniciar sesión. Por favor, intenta nuevamente.');
  }
};

