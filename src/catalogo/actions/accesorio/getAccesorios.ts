import { accesorioApi } from '../../api/accesorioApi';
import type { GetAccesoriosParams, Accesorio } from '../../types/accesorio.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getAccesorios = async (
  params?: GetAccesoriosParams
): Promise<Accesorio[] | PaginatedResponse<Accesorio>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
          ...(params.q && { q: params.q }),
        }
      : undefined;

    const response = await accesorioApi.get<any>('/', {
      params: queryParams,
    });

    const mapAccesorio = (accesorio: any): Accesorio => ({
      ...accesorio,
      estado: accesorio.estado || 'activo',
    });

    if (Array.isArray(response.data)) {
      return response.data.map(mapAccesorio);
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: (response.data.data || []).map(mapAccesorio),
        total: response.data.total ?? 0,
      };
    }

    return [];
  } catch (error) {
    console.error('Error en getAccesorios:', error);
    throw error;
  }
};

