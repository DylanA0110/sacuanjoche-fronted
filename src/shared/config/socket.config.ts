// Configuración para conectar al namespace admin
// URL base del servidor (sin namespace)
export const SOCKET_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/admin$/, '') ??
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000';

// Namespace para admin
export const SOCKET_NAMESPACE = '/admin';

// URL completa para Socket.IO (Socket.IO maneja el namespace automáticamente)
export const SOCKET_URL = `${SOCKET_BASE_URL}${SOCKET_NAMESPACE}`;



