import { clienteDireccionApi } from '../api/clienteDireccionApi';
import type { GetClienteDireccionesParams, ClienteDireccion } from '../types/direccion.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getClienteDirecciones = async (
  params?: GetClienteDireccionesParams
): Promise<ClienteDireccion[] | PaginatedResponse<ClienteDireccion>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
          ...(params.q && { q: params.q }),
          ...(params.idCliente && { idCliente: params.idCliente }),
        }
      : undefined;

    const response = await clienteDireccionApi.get<any>('/', {
      params: queryParams,
    });

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: response.data.data || [],
        total: response.data.total ?? 0,
      };
    }

    return [];
  } catch (error) {
    throw error;
  }
};

