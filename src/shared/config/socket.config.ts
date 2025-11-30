/**
 * Configuración de Socket.IO para conectar al namespace /admin
 * 
 * Socket.IO requiere la URL base del servidor (sin namespace ni /api)
 * y luego maneja el namespace automáticamente cuando se conecta.
 */

// Obtener la URL base del API desde las variables de entorno
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (!envUrl) {
    return 'http://localhost:3000';
  }

  // Remover cualquier ruta adicional (/api, /admin, etc.) para obtener solo la URL base
  // Ejemplo: http://localhost:3000/api/admin -> http://localhost:3000
  let baseUrl = envUrl.trim();
  
  // Remover trailing slash
  baseUrl = baseUrl.replace(/\/+$/, '');
  
  // Remover rutas comunes (/api, /admin) para obtener solo el dominio y puerto
  baseUrl = baseUrl.replace(/\/api\/?.*$/, '');
  baseUrl = baseUrl.replace(/\/admin\/?.*$/, '');
  
  return baseUrl;
};

// URL base del servidor (sin namespace)
export const SOCKET_BASE_URL = getApiBaseUrl();

// Namespace para admin
export const SOCKET_NAMESPACE = '/admin';

// URL completa para Socket.IO
// Socket.IO maneja el namespace automáticamente cuando se pasa en la URL
export const SOCKET_URL = `${SOCKET_BASE_URL}${SOCKET_NAMESPACE}`;










