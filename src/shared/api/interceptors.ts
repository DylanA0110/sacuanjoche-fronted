import { AxiosError, InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import { toast } from 'sonner';
import { isTokenExpired, clearTokenCache } from '@/shared/utils/tokenUtils';

// Caché de verificación de expiración para el interceptor (evita verificar en cada petición)
let lastExpirationCheck: { token: string; isExpired: boolean; checkedAt: number } | null = null;
const EXPIRATION_CHECK_CACHE_TTL = 5000; // Cachear verificación por 5 segundos

/**
 * Limpia el caché de verificación de expiración
 * Útil cuando se actualiza el token después del login
 */
export const clearExpirationCache = () => {
  lastExpirationCheck = null;
};

// Roles que tienen acceso al panel administrativo
const ADMIN_PANEL_ROLES = ['admin', 'vendedor', 'conductor'];

// Endpoints públicos que no requieren autenticación
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/arreglos/public',
  '/flor/public',
  '/accesorio/public',
  '/forma-arreglo/public',
  '/pago/paypal/webhook',
];

/**
 * Crea el interceptor de request para agregar el token de autenticación
 */
const createRequestInterceptor = () => {
  return (config: InternalAxiosRequestConfig) => {
    // Verificar si es un endpoint público (no requiere token)
    const url = config.url || '';
    const isPublic = isPublicEndpoint(url);
    
    // Si es público, no agregar token
    if (isPublic) {
      return config;
    }
    
    // Para endpoints protegidos, agregar token si existe
    const token = localStorage.getItem('token');
    
    // Solo verificar expiración si es un endpoint protegido y hay token
    if (token && config.url) {
      const now = Date.now();
      
      // Usar caché de verificación para evitar decodificar en cada petición
      let isExpired = false;
      
      // Si el token cambió, limpiar el caché
      if (lastExpirationCheck && lastExpirationCheck.token !== token) {
        lastExpirationCheck = null;
      }
      
      if (
        !lastExpirationCheck ||
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
    } else if (!token && !isPublic) {
      // Si no hay token y no es un endpoint público, podría ser un problema
      // Pero no rechazamos aquí para permitir que el backend maneje el error
      console.warn('Petición a endpoint protegido sin token:', config.url);
    }
    
    return config;
  };
};

/**
 * Crea el interceptor de response para manejar errores de autenticación
 */
const createResponseInterceptor = () => {
  return async (error: AxiosError) => {
    // Si el error es 401 (No autorizado)
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/catalogo', '/'];
      
      // Verificar si estamos en una ruta pública
      const isPublicPath = publicPaths.includes(currentPath) || 
                           currentPath.startsWith('/catalogo');
      
      // Si estamos en una ruta pública, NO limpiar el token ni hacer logout
      // Solo permitir que el error se propague normalmente
      if (isPublicPath) {
        return Promise.reject(error);
      }
      
      // Solo para rutas protegidas: limpiar token y redirigir a login
      const isProtectedPath = currentPath.startsWith('/admin') || 
                               currentPath.startsWith('/carrito') ||
                               currentPath.startsWith('/pedido');
      
      if (isProtectedPath) {
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
  if (!url) return false;
  // Normalizar la URL para comparar solo la ruta (sin baseURL)
  const normalizedUrl = url.replace(/^https?:\/\/[^/]+/, ''); // Remover protocolo y dominio
  return PUBLIC_ENDPOINTS.some((endpoint) => normalizedUrl.includes(endpoint));
};

/**
 * Verifica si un usuario tiene acceso al panel administrativo
 */
export const hasAdminPanelAccess = (roles: string[]): boolean => {
  return roles.some((role) => ADMIN_PANEL_ROLES.includes(role));
};

