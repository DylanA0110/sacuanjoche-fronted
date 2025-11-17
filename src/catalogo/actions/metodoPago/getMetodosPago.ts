import { metodoPagoApi } from '../../api/metodoPagoApi';
import type { GetMetodosPagoParams, MetodoPago } from '../../types/metodo-pago.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getMetodosPago = async (
  params?: GetMetodosPagoParams
): Promise<MetodoPago[] | PaginatedResponse<MetodoPago>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
          ...(params.q && { q: params.q }),
        }
      : undefined;

    const response = await metodoPagoApi.get<any>('/', {
      params: queryParams,
    });

    const mapMetodoPago = (metodo: any): MetodoPago => ({
      ...metodo,
      estado: metodo.estado || 'activo',
      canalesDisponibles: metodo.canalesDisponibles || [],
    });

    if (Array.isArray(response.data)) {
      return response.data.map(mapMetodoPago);
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: (response.data.data || []).map(mapMetodoPago),
        total: response.data.total ?? 0,
      };
    }

    return [];
  } catch (error) {
    console.error('Error en getMetodosPago:', error);
    throw error;
  }
};

