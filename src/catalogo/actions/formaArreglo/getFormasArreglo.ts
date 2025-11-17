import { formaArregloApi } from '../../api/formaArregloApi';
import type { GetFormasArregloParams, FormaArreglo } from '../../types/forma-arreglo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getFormasArreglo = async (
  params?: GetFormasArregloParams
): Promise<FormaArreglo[] | PaginatedResponse<FormaArreglo>> => {
  try {
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
          ...(params.q && { q: params.q }),
        }
      : undefined;

    const response = await formaArregloApi.get<any>('/', {
      params: queryParams,
    });

    const mapFormaArreglo = (forma: any): FormaArreglo => ({
      ...forma,
      activo: forma.activo ?? true,
    });

    if (Array.isArray(response.data)) {
      return response.data.map(mapFormaArreglo);
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: (response.data.data || []).map(mapFormaArreglo),
        total: response.data.total ?? 0,
      };
    }

    return [];
  } catch (error) {
    console.error('Error en getFormasArreglo:', error);
    throw error;
  }
};

