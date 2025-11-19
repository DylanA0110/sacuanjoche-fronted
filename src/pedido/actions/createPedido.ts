import { pedidoApi } from '../api/pedidoApi';
import type { CreatePedidoDto, Pedido } from '../types/pedido.interface';

export const createPedido = async (
  pedidoData: CreatePedidoDto
): Promise<Pedido> => {
  try {
    const response = await pedidoApi.post<Pedido>('/', pedidoData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
