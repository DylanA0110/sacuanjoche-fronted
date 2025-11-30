import { AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { isTokenExpired, clearTokenCache } from '@/shared/utils/tokenUtils';

// Caché de verificación de expiración para el interceptor (evita verificar en cada petición)
let lastExpirationCheck: { token: string; isExpired: boolean; checkedAt: number } | null = null;
const EXPIRATION_CHECK_CACHE_TTL = 5000; // Cachear verificación por 5 segundos

// Roles que tienen acceso al panel administrativo
const ADMIN_PANEL_ROLES = ['admin', 'vendedor', 'conductor'];

// Endpoints públicos que no requieren autenticación
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/arreglos/public',
  '/flor/public',
  '/accesorio/public',
  '/pago/paypal/webhook',
];

/**
 * Crea el interceptor de request para agregar el token de autenticación
 */
const createRequestInterceptor = () => {
  return (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    // Solo verificar expiración si es un endpoint protegido
    if (token && config.url && !isPublicEndpoint(config.url)) {
      const now = Date.now();
      
      // Usar caché de verificación para evitar decodificar en cada petición
      let isExpired = false;
      
      if (
        !lastExpirationCheck ||
        lastExpirationCheck.token !== token ||
        now - lastExpirationCheck.checkedAt > EXPIRATION_CHECK_CACHE_TTL
      ) {
        // Verificar expiración solo si el caché expiró o el token cambió
        isExpired = isTokenExpired(token);
        lastExpirationCheck = {
          token,
          isExpired,
          checkedAt: now,
        };
      } else {
        // Usar resultado del caché
        isExpired = lastExpirationCheck.isExpired;
      }
      
      if (isExpired) {
        // Token vencido, limpiar cachés y redirigir
        localStorage.removeItem('token');
        clearTokenCache();
        lastExpirationCheck = null;
        
        // Importar y usar el store de forma dinámica para evitar dependencias circulares
        (async () => {
          try {
            const { useAuthStore } = await import('@/auth/store/auth.store');
            useAuthStore.getState().logout();
          } catch (err) {
            console.error('Error al limpiar store de autenticación:', err);
          }
          
          // Solo redirigir si no estamos ya en la página de login y estamos en el panel
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        })();
        
        // Rechazar la petición
        return Promise.reject(new Error('Token expirado'));
      }
      
      // Agregar token al header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  };
};

/**
 * Crea el interceptor de response para manejar errores de autenticación
 */
const createResponseInterceptor = () => {
  return async (error: AxiosError) => {
    // Si el error es 401 (No autorizado), limpiar token y redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      clearTokenCache();
      lastExpirationCheck = null;
      
      // Importar y usar el store de forma dinámica para evitar dependencias circulares
      try {
        const { useAuthStore } = await import('@/auth/store/auth.store');
        useAuthStore.getState().logout();
      } catch (err) {
        // Si falla la importación, solo limpiar localStorage
        console.error('Error al limpiar store de autenticación:', err);
      }
      
      // Solo redirigir si no estamos ya en la página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // No mostrar toast automáticamente aquí - dejar que los componentes manejen los errores
    // Solo manejar errores 401 que requieren redirección
    // Los demás errores serán manejados por los componentes que llaman a la API
    
    return Promise.reject(error);
  };
};

/**
 * Configura los interceptores en una instancia de axios
 */
const setupInterceptorsForInstance = (axiosInstance: AxiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    createRequestInterceptor(),
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    createResponseInterceptor()
  );
};

// Lista de instancias de axios que necesitan interceptores
const axiosInstances: AxiosInstance[] = [];

/**
 * Registra una instancia de axios para aplicar interceptores
 * Debe ser llamado cuando se crea una nueva instancia
 */
export const registerAxiosInstance = (instance: AxiosInstance) => {
  if (!axiosInstances.includes(instance)) {
    axiosInstances.push(instance);
    setupInterceptorsForInstance(instance);
  }
};

/**
 * Configura los interceptores para todas las instancias de axios
 * Nota: Las instancias se registran automáticamente cuando se importan
 * Esta función mantiene compatibilidad con código existente
 */
export const setupRequestInterceptor = () => {
  // Las instancias se registran automáticamente al importarse
  // gracias a registerAxiosInstance() en cada archivo de API
};

/**
 * Configura los interceptores de response (mantiene compatibilidad con código existente)
 */
export const setupResponseInterceptor = () => {
  // Ya está incluido en setupInterceptorsForInstance
  // Esta función mantiene compatibilidad con código existente
};

/**
 * Verifica si un endpoint es público (no requiere autenticación)
 */
const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

/**
 * Verifica si un usuario tiene acceso al panel administrativo
 */
export const hasAdminPanelAccess = (roles: string[]): boolean => {
  return roles.some((role) => ADMIN_PANEL_ROLES.includes(role));
};

