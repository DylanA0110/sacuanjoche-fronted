import { pedidoApi } from '../api/pedidoApi';
import type { CreatePedidoDto, Pedido } from '../types/pedido.interface';

export const createPedido = async (
  pedidoData: CreatePedidoDto
): Promise<Pedido> => {
  const response = await pedidoApi.post<Pedido>('/', pedidoData);
  return response.data;
};
