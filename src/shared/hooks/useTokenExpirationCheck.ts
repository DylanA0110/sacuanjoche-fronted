/**
 * Hook personalizado para verificar la expiración del token
 * Consolida la lógica de verificación para evitar duplicación
 * Implementación profesional con verificación optimizada
 */
import { useEffect, useRef } from 'react';
import { isTokenExpired, getTokenTimeRemaining } from '@/shared/utils/tokenUtils';
import { useAuthStore } from '@/auth/store/auth.store';

interface UseTokenExpirationCheckOptions {
  /**
   * Intervalo de verificación en milisegundos
   * @default 60000 (1 minuto)
   */
  checkInterval?: number;
  
  /**
   * Verificar inmediatamente al montar
   * @default true
   */
  checkImmediately?: boolean;
  
  /**
   * Callback cuando el token expira
   */
  onExpired?: () => void;
}

/**
 * Hook para verificar la expiración del token periódicamente
 * Usa intervalos dinámicos basados en el tiempo restante del token
 */
export const useTokenExpirationCheck = (options: UseTokenExpirationCheckOptions = {}) => {
  const {
    checkInterval = 60000, // 1 minuto por defecto
    checkImmediately = true,
    onExpired,
  } = options;

  const { logout } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Si no hay token, limpiar intervalos
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      if (isTokenExpired(token)) {
        // Token vencido, limpiar y ejecutar callback
        localStorage.removeItem('token');
        logout();
        
        if (onExpired) {
          onExpired();
        } else {
          // Comportamiento por defecto: redirigir a login si no estamos ya ahí
          if (window.location.pathname !== '/login' && window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login';
          }
        }
        
        // Limpiar intervalos
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        return;
      }

      // Obtener tiempo restante para optimizar el siguiente check
      const timeRemaining = getTokenTimeRemaining(token);
      
      // Si el token expira pronto (menos de 2 minutos), verificar más frecuentemente
      if (timeRemaining > 0 && timeRemaining < 120000) {
        // Verificar cada 30 segundos si está por expirar
        const nextCheck = Math.min(30000, timeRemaining);
        
        // Limpiar intervalo anterior si existe
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Programar siguiente verificación
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          checkTokenExpiration();
        }, nextCheck);
      }
    };

    // Verificar inmediatamente si se solicita
    if (checkImmediately) {
      checkTokenExpiration();
    }

    // Configurar intervalo periódico
    intervalRef.current = setInterval(checkTokenExpiration, checkInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [checkInterval, checkImmediately, logout, onExpired]);
};

