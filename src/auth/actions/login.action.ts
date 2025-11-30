import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { AuthResponse } from '../types/Auth.response';
import { clearTokenCache } from '@/shared/utils/tokenUtils';
import { clearExpirationCache } from '@/shared/api/interceptors';

export interface LoginDto {
  email: string;
  password: string;
}

export const loginAction = async (loginData: LoginDto): Promise<AuthResponse> => {
  try {
    const { data } = await floristeriaApi.post<AuthResponse>('/auth/login', loginData);
    
    // Guardar token en localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
      // Limpiar caché del token anterior y del interceptor
      clearTokenCache();
      clearExpirationCache();
    }
    
    return data;
  } catch (error: any) {
    
    // Extraer el mensaje de error del backend de forma consistente
    // Incluyendo TODOS los campos posibles: message, error, details, reason, intentosRestantes, etc.
    if (error.response?.data) {
      const errorData = error.response.data;
      let errorMessage: string = '';
      const allMessages: string[] = [];
      
      // 1. Extraer mensaje principal (puede ser string o array)
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join('. ');
        allMessages.push(...errorData.message);
      } else if (typeof errorData.message === 'string') {
        errorMessage = errorData.message;
        allMessages.push(errorData.message);
      }
      
      // 2. Extraer campo 'error' si existe
      if (typeof errorData.error === 'string') {
        if (!errorMessage) {
          errorMessage = errorData.error;
        }
        allMessages.push(errorData.error);
      }
      
      // 3. Extraer 'details' o 'reason'
      if (errorData.details) {
        const details = typeof errorData.details === 'string' 
          ? errorData.details 
          : Array.isArray(errorData.details)
          ? errorData.details.join('. ')
          : String(errorData.details);
        if (!errorMessage) {
          errorMessage = details;
        }
        allMessages.push(details);
      }
      
      if (errorData.reason) {
        const reason = String(errorData.reason);
        if (!errorMessage) {
          errorMessage = reason;
        }
        allMessages.push(reason);
      }
      
      // 4. Extraer información de bloqueo de intentos
      if (errorData.intentosRestantes !== undefined) {
        const intentos = errorData.intentosRestantes;
        const intentosMsg = intentos > 0 
          ? `Intentos restantes: ${intentos}`
          : 'Cuenta bloqueada por múltiples intentos fallidos';
        allMessages.push(intentosMsg);
      }
      
      if (errorData.tiempoBloqueo) {
        allMessages.push(`Tiempo de bloqueo: ${errorData.tiempoBloqueo}`);
      }
      
      // 5. Extraer validaciones
      if (errorData.validationErrors) {
        Object.values(errorData.validationErrors).forEach((validationErrors: any) => {
          if (Array.isArray(validationErrors)) {
            allMessages.push(...validationErrors.map((v: any) => String(v)));
          } else {
            allMessages.push(String(validationErrors));
          }
        });
      }
      
      // 6. Extraer errores anidados
      if (errorData.errors) {
        if (Array.isArray(errorData.errors)) {
          allMessages.push(...errorData.errors.map((e: any) => String(e)));
        } else if (typeof errorData.errors === 'object') {
          Object.values(errorData.errors).forEach((err: any) => {
            if (Array.isArray(err)) {
              allMessages.push(...err.map((e: any) => String(e)));
            } else {
              allMessages.push(String(err));
            }
          });
        }
      }
      
      // 7. Si el data completo es un string
      if (typeof errorData === 'string' && !errorMessage) {
        errorMessage = errorData;
        allMessages.push(errorData);
      }
      
      // 8. Si no hay mensaje, usar uno por defecto basado en el status
      if (!errorMessage) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (status === 403) {
          errorMessage = 'Acceso denegado';
        } else if (status === 429) {
          errorMessage = 'Demasiados intentos. Por favor, espera un momento';
        } else if (status === 423) {
          errorMessage = 'Cuenta bloqueada temporalmente';
        } else {
          errorMessage = `Error ${status}: ${error.response.statusText || 'Error al iniciar sesión'}`;
        }
      }
      
      // 9. Si hay múltiples mensajes, unirlos
      if (allMessages.length > 1) {
        const uniqueMessages = [...new Set(allMessages)];
        errorMessage = uniqueMessages.join('. ');
      }
      
      // Crear un nuevo error con el mensaje del backend y toda la información
      const customError = new Error(errorMessage);
      (customError as any).response = error.response;
      (customError as any).status = error.response.status;
      (customError as any).allMessages = allMessages;
      (customError as any).errorData = errorData; // Incluir todos los datos del error
      throw customError;
    }
    
    // Si no hay response, es un error de red
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error al iniciar sesión. Por favor, intenta nuevamente.');
  }
};

