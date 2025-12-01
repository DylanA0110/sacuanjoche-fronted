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

    // Si hay parámetros de paginación, el backend DEBE devolver un objeto con data y total
    if (params?.limit !== undefined || params?.offset !== undefined) {
      // Si el backend devuelve un array cuando se espera paginación, necesitamos obtener el total
      if (Array.isArray(response.data)) {
        const currentData = response.data.map(mapMetodoPago);
        const limit = params.limit || 10;
        const offset = params.offset || 0;
        
        // SIEMPRE obtener el total real del backend cuando devuelve un array
        try {
          const totalResponse = await metodoPagoApi.get<any>('/', {
            params: {
              ...(params?.q ? { q: params.q } : {}),
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let total = 0;
          if (Array.isArray(totalResponse.data)) {
            total = totalResponse.data.length;
          } else if (totalResponse.data && typeof totalResponse.data === 'object' && 'total' in totalResponse.data) {
            total = (totalResponse.data as any).total || 0;
          }
          
          // Si el total sigue siendo 10 (igual al limit actual), usar estimación
          if (total === 10 && currentData.length === 10 && limit === 10) {
            total = offset + currentData.length + 1;
          }
          
          return {
            data: currentData,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          if (currentData.length < limit) {
            return {
              data: currentData,
              total: offset + currentData.length,
            };
          }
          return {
            data: currentData,
            total: offset + currentData.length + 1,
          };
        }
      }
      
      // Si el backend devuelve un objeto con data y total, usarlo directamente
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
    }

    // Sin paginación, devolver array directamente
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
    throw error;
  }
};

