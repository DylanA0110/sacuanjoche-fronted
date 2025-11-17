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
