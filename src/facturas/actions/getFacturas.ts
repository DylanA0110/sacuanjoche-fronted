import { facturaApi } from '../api/facturaApi';
import type {
  Factura,
  FacturasResponse,
  GetFacturasParams,
} from '../types/factura.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getFacturas = async (
  params?: GetFacturasParams
): Promise<Factura[] | PaginatedResponse<Factura>> => {
  try {
    const response = await facturaApi.get<Factura[] | FacturasResponse>('/', {
      params,
    });

    // Si la respuesta es un array directo, lo devolvemos tal cual
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // Si es un objeto con data y total, lo convertimos a PaginatedResponse
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
      };
    }

    // Fallback: devolver array vacío
    return [];
  } catch (error) {
    console.error('Error en getFacturas:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Error response status:', axiosError.response?.status);
      console.error('Error response data:', axiosError.response?.data);
    }
    throw error; // Re-lanzar para que React Query lo maneje
  }
};
