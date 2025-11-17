import { florApi } from '../../api/florApi';
import type { GetFloresParams, Flor } from '../../types/flor.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getFlores = async (
  params?: GetFloresParams
): Promise<Flor[] | PaginatedResponse<Flor>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
          ...(params.q && { q: params.q }),
        }
      : undefined;

    const response = await florApi.get<any>('/', {
      params: queryParams,
    });

    const mapFlor = (flor: any): Flor => ({
      ...flor,
      estado: flor.estado || 'activo',
    });

    if (Array.isArray(response.data)) {
      return response.data.map(mapFlor);
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: (response.data.data || []).map(mapFlor),
        total: response.data.total ?? 0,
      };
    }

    return [];
  } catch (error) {
    console.error('Error en getFlores:', error);
    throw error;
  }
};

