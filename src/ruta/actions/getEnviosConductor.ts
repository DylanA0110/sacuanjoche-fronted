import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { EnvioConductor, GetEnviosParams } from '../types/envio.interface';
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
 * Normaliza un envío del conductor desde la respuesta del API
 */
const normalizeEnvio = (raw: EnvioConductor): EnvioConductor => {
  return {
    ...raw,
    origenLat: toNullableNumber(raw.origenLat),
    origenLng: toNullableNumber(raw.origenLng),
    destinoLat: toNullableNumber(raw.destinoLat),
    destinoLng: toNullableNumber(raw.destinoLng),
    costoEnvio: toNullableNumber(raw.costoEnvio),
    distanciaKm: toNullableNumber(raw.distanciaKm),
  };
};

/**
 * Obtiene todos los envíos del conductor autenticado
 * El backend filtra automáticamente por el conductor del token JWT
 * 
 * @param params - Parámetros opcionales de paginación y búsqueda
 */
export const getEnviosConductor = async (
  params?: GetEnviosParams
): Promise<EnvioConductor[]> => {
  try {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      queryParams.offset = params.offset;
    }
    if (params?.q) {
      queryParams.q = params.q;
    }

    const response = await floristeriaApi.get<EnvioConductor[]>('/envio', {
      params: queryParams,
    });
    
    return response.data.map(normalizeEnvio);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ErrorResponse;
      throw new Error(errorData.message || `Error al obtener envíos: ${error.message}`);
    }
    
    console.error('Error al obtener envíos del conductor:', error);
    throw error instanceof Error ? error : new Error('Error desconocido al obtener envíos');
  }
};










