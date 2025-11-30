import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { AuthResponse } from '../types/Auth.response';
import { clearTokenCache } from '@/shared/utils/tokenUtils';

export interface RegisterDto {
  email: string;
  password: string;
  clienteId?: number | null;
  empleadoId?: number | null;
  estado: 'activo' | 'inactivo';
}

export const registerAction = async (registerData: RegisterDto): Promise<AuthResponse> => {
  try {
    const { data } = await floristeriaApi.post<AuthResponse>('/auth/register', registerData);
    
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      // Limpiar caché del token anterior
      clearTokenCache();
    }
    
    return data;
  } catch (error: any) {
    // Extraer el mensaje de error del backend de forma consistente
    if (error.response?.data) {
      const errorData = error.response.data;
      const errorMessage = 
        errorData.message || 
        errorData.error || 
        (typeof errorData === 'string' ? errorData : null) ||
        'Error al crear la cuenta';
      
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

