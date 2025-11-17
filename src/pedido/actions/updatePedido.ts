import { pedidoApi } from '../api/pedidoApi';
import type { Pedido, UpdatePedidoDto } from '../types/pedido.interface';

export const updatePedido = async (
  id: number,
  pedidoData: UpdatePedidoDto
): Promise<Pedido> => {
  const response = await pedidoApi.patch<Pedido>(`/${id}`, pedidoData);
  return response.data;
};
