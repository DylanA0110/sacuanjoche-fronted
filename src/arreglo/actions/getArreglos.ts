import { arregloApi } from '../api/arregloApi';
import type { GetArreglosParams, Arreglo } from '../types/arreglo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getArreglos = async (
  params?: GetArreglosParams
): Promise<Arreglo[] | PaginatedResponse<Arreglo>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
          ...(params.q && { q: params.q }),
        }
      : undefined;

    const response = await arregloApi.get<any>('/', {
      params: queryParams,
    });

    const mapArreglo = (arreglo: any): Arreglo => ({
      ...arreglo,
      estado: arreglo.estado || 'activo',
      media: arreglo.media || [],
    });

    if (Array.isArray(response.data)) {
      return response.data.map(mapArreglo);
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: (response.data.data || []).map(mapArreglo),
        total: response.data.total ?? 0,
      };
    }

    return [];
  } catch (error) {
    console.error('Error en getArreglos:', error);
    throw error;
  }
};

