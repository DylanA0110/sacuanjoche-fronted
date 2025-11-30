import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { RutaConductor, RutaPedido } from '../types/ruta.interface';
import axios from 'axios';

/**
 * Interfaz para respuestas de error del backend
 */
interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

/**
 * Normaliza un número que puede venir como string o number
 */
const toNullableNumber = (value: unknown): number | null => {
  if (value == null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Normaliza una ruta del conductor desde la respuesta del API
 */
const normalizeRuta = (raw: RutaConductor): RutaConductor => {
  const rutaPedidos = (raw.rutaPedidos ?? [])
    .map((pedido) => ({
      ...pedido,
      secuencia: Number(pedido.secuencia),
      lat: toNullableNumber(pedido.lat),
      lng: toNullableNumber(pedido.lng),
      distanciaKm: toNullableNumber(pedido.distanciaKm),
      duracionMin: toNullableNumber(pedido.duracionMin),
    }))
    .filter(
      (pedido) =>
        typeof pedido.lat === 'number' &&
        Number.isFinite(pedido.lat) &&
        typeof pedido.lng === 'number' &&
        Number.isFinite(pedido.lng)
    )
    .map((pedido) => ({
      ...pedido,
      lat: pedido.lat as number,
      lng: pedido.lng as number,
    }))
    .sort((a, b) => a.secuencia - b.secuencia) as RutaPedido[];

  const origenLatParsed = toNullableNumber(raw.origenLat);
  const origenLngParsed = toNullableNumber(raw.origenLng);

  return {
    ...raw,
    origenLat: origenLatParsed ?? 0,
    origenLng: origenLngParsed ?? 0,
    distanciaKm: toNullableNumber(raw.distanciaKm),
    duracionMin: toNullableNumber(raw.duracionMin),
    rutaPedidos,
  };
};

/**
 * Obtiene todas las rutas asignadas al conductor autenticado
 * El backend filtra automáticamente por el conductor del token JWT
 * 
 * Sin parámetros: Devuelve todas las rutas (admin/vendedor) o solo las del conductor autenticado
 * Con idEmpleado: Filtra por ese empleado específico (con validaciones de permisos)
 */
export const getRutasConductor = async (idEmpleado?: number): Promise<RutaConductor[]> => {
  try {
    const url = idEmpleado ? `/rutas?idEmpleado=${idEmpleado}` : '/rutas';
    const response = await floristeriaApi.get<RutaConductor[]>(url);
    return response.data.map(normalizeRuta);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ErrorResponse;
      
      // Error 404: Empleado no encontrado
      if (error.response.status === 404) {
        throw new Error(`Empleado no encontrado: ${errorData.message || 'El empleado especificado no existe'}`);
      }
      
      // Error 403: Conductor intenta ver rutas de otro empleado
      if (error.response.status === 403) {
        throw new Error(errorData.message || 'No tiene permiso para ver las rutas de otros empleados. Solo puede ver sus propias rutas asignadas.');
      }
      
      // Otros errores
      throw new Error(errorData.message || `Error al obtener rutas: ${error.message}`);
    }
    
    console.error('Error al obtener rutas del conductor:', error);
    throw error instanceof Error ? error : new Error('Error desconocido al obtener rutas');
  }
};

/**
 * Obtiene el detalle de una ruta específica por ID
 * 
 * Errores posibles:
 * - 403: Conductor intenta ver ruta de otro empleado
 * - 404: Ruta no encontrada
 */
export const getRutaById = async (idRuta: number): Promise<RutaConductor> => {
  try {
    const response = await floristeriaApi.get<RutaConductor>(`/rutas/${idRuta}`);
    return normalizeRuta(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ErrorResponse;
      
      // Error 403: Conductor intenta ver ruta de otro empleado
      if (error.response.status === 403) {
        throw new Error(errorData.message || 'No tiene permiso para ver esta ruta');
      }
      
      // Error 404: Ruta no encontrada
      if (error.response.status === 404) {
        throw new Error(errorData.message || 'La ruta no existe');
      }
      
      // Otros errores
      throw new Error(errorData.message || `Error al obtener la ruta: ${error.message}`);
    }
    
    console.error('Error al obtener ruta por ID:', error);
    throw error instanceof Error ? error : new Error('Error desconocido al obtener la ruta');
  }
};

