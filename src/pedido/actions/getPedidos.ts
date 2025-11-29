import { pedidoApi } from '../api/pedidoApi';
import type {
  GetPedidosParams,
  Pedido,
  PedidosResponse,
} from '../types/pedido.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getPedidos = async (
  params?: GetPedidosParams
): Promise<Pedido[] | PaginatedResponse<Pedido>> => {
  try {
    const response = await pedidoApi.get<Pedido[] | PedidosResponse>('/', {
      params,
    });

    // Si hay parámetros de paginación, el backend DEBE devolver un objeto con data y total
    if (params?.limit !== undefined || params?.offset !== undefined) {
      // Si el backend devuelve un array cuando se espera paginación, necesitamos obtener el total
      if (Array.isArray(response.data)) {
        const currentData = response.data;
        const limit = params.limit || 10;
        const offset = params.offset || 0;

        console.log('getPedidos - Backend devolvió array con paginación:', {
          currentDataLength: currentData.length,
          limit,
          offset,
        });

        // SIEMPRE obtener el total real del backend cuando devuelve un array
        // Esto asegura que siempre tengamos el total correcto, no solo el de la página actual
        try {
          console.log(
            'getPedidos - Obteniendo total real del backend (siempre)...'
          );
          // Usar un límite muy alto para obtener todos los elementos y contar el total real
          const totalResponse = await pedidoApi.get<Pedido[] | PedidosResponse>(
            '/',
            {
              params: {
                ...(params?.q ? { q: params.q } : {}),
                limit: 10000, // Límite muy alto para obtener todos
                offset: 0,
              },
            }
          );

          let total = 0;
          if (Array.isArray(totalResponse.data)) {
            total = totalResponse.data.length;
            console.log(
              'getPedidos - Total obtenido contando array completo:',
              total
            );
          } else if (
            totalResponse.data &&
            typeof totalResponse.data === 'object' &&
            'total' in totalResponse.data
          ) {
            total = (totalResponse.data as any).total || 0;
            console.log(
              'getPedidos - Total obtenido del objeto paginado:',
              total
            );
          }

          // Si el total sigue siendo 10 (igual al limit actual), podría ser que el backend tenga un límite máximo
          // En ese caso, usar lógica de estimación basada en si hay más elementos
          if (total === 10 && currentData.length === 10 && limit === 10) {
            console.warn(
              'getPedidos - Total parece estar limitado por el backend, usando estimación'
            );
            // Asumimos que hay más elementos si tenemos exactamente el límite
            total = offset + currentData.length + 1; // +1 para indicar que hay más
            console.log(
              'getPedidos - Total estimado (hay más elementos):',
              total
            );
          }

          console.log('getPedidos - Total final:', total);

          return {
            data: currentData,
            total: total,
          };
        } catch (totalError) {
          console.error('getPedidos - Error al obtener total:', totalError);
          // Si falla obtener el total, usar lógica de fallback
          // Si tenemos menos elementos que el limit, sabemos que es la última página
          if (currentData.length < limit) {
            const calculatedTotal = offset + currentData.length;
            console.log(
              'getPedidos - Fallback: Última página detectada, total calculado:',
              calculatedTotal
            );
            return {
              data: currentData,
              total: calculatedTotal,
            };
          }
          // Si tenemos exactamente 'limit' elementos, asumimos que hay más
          const estimatedTotal = offset + currentData.length + 1;
          console.log(
            'getPedidos - Fallback: Total estimado (podría haber más):',
            estimatedTotal
          );
          return {
            data: currentData,
            total: estimatedTotal,
          };
        }
      }

      // Si el backend devuelve un objeto con data y total, usarlo directamente
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data
      ) {
        const total = response.data.total ?? 0;
        console.log(
          'getPedidos - Backend devolvió objeto paginado, total:',
          total
        );
        return {
          data: response.data.data || [],
          total: total,
        };
      }
    }

    // Sin paginación, devolver array directamente
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
    console.error('Error en getPedidos:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Error response status:', axiosError.response?.status);
      console.error('Error response data:', axiosError.response?.data);
    }
    throw error;
  }
};
