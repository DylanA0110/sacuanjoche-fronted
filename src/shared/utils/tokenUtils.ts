/**
 * Utilidades para manejar tokens JWT con caché optimizado
 * Implementación profesional siguiendo mejores prácticas de la industria
 */

// Caché del token decodificado con TTL (Time To Live)
interface TokenCache {
  token: string;
  decoded: any;
  expirationTime: number;
  cachedAt: number;
}

let tokenCache: TokenCache | null = null;
const CACHE_TTL = 10000; // Cachear por 10 segundos (suficiente para evitar decodificaciones repetidas)

/**
 * Limpia el caché del token (llamar cuando se actualiza el token)
 */
export const clearTokenCache = (): void => {
  tokenCache = null;
};

/**
 * Decodifica un token JWT sin verificar la firma
 * Utiliza caché para evitar decodificaciones repetidas del mismo token
 * @param token Token JWT
 * @returns Payload decodificado o null si hay error
 */
const decodeTokenCached = (token: string): any | null => {
  if (!token) return null;

  const now = Date.now();
  
  // Si el token cambió, el caché expiró, o no hay caché, decodificar de nuevo
  if (
    !tokenCache ||
    tokenCache.token !== token ||
    now - tokenCache.cachedAt > CACHE_TTL
  ) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        tokenCache = null;
        return null;
      }
      
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      
      // Extraer exp si existe
      const expirationTime = decoded.exp ? decoded.exp * 1000 : 0;
      
      // Guardar en caché
      tokenCache = {
        token,
        decoded,
        expirationTime,
        cachedAt: now,
      };
    } catch (error) {
      // En caso de error, limpiar caché y retornar null
      tokenCache = null;
      console.error('Error al decodificar token:', error);
      return null;
    }
  }
  
  return tokenCache.decoded;
};

/**
 * Decodifica un token JWT sin verificar la firma (función pública)
 * @param token Token JWT
 * @returns Payload decodificado o null si hay error
 */
export const decodeToken = (token: string): any | null => {
  return decodeTokenCached(token);
};

/**
 * Verifica si un token JWT está vencido
 * Implementación optimizada con caché para evitar decodificaciones repetidas
 * @param token Token JWT
 * @returns true si está vencido, false si no
 */
export const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  
  try {
    const decoded = decodeTokenCached(token);
    if (!decoded || !decoded.exp) {
      return true; // Si no tiene exp, considerarlo vencido por seguridad
    }
    
    // Usar el tiempo de expiración del caché si está disponible
    const expirationTime = tokenCache?.expirationTime || decoded.exp * 1000;
    const currentTime = Date.now();
    
    // Considerar vencido si falta menos de 1 minuto (margen de seguridad)
    // Esto evita problemas de sincronización de reloj y da tiempo para refrescar
    return currentTime >= (expirationTime - 60000);
  } catch (error) {
    // En caso de error, considerar vencido por seguridad
    console.error('Error al verificar expiración del token:', error);
    return true;
  }
};

/**
 * Obtiene el tiempo restante del token en milisegundos
 * Implementación optimizada con caché
 * @param token Token JWT
 * @returns Tiempo restante en milisegundos o 0 si está vencido
 */
export const getTokenTimeRemaining = (token: string): number => {
  if (!token) return 0;
  
  try {
    const decoded = decodeTokenCached(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const expirationTime = tokenCache?.expirationTime || decoded.exp * 1000;
    const currentTime = Date.now();
    const remaining = expirationTime - currentTime;
    
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Obtiene la fecha de expiración del token
 * @param token Token JWT
 * @returns Fecha de expiración en milisegundos o null si no tiene exp
 */
export const getTokenExpiration = (token: string): number | null => {
  if (!token) return null;
  
  try {
    const decoded = decodeTokenCached(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return tokenCache?.expirationTime || decoded.exp * 1000;
  } catch (error) {
    return null;
  }
};
