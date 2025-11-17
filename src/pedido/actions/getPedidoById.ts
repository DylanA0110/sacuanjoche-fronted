import { pedidoApi } from '../api/pedidoApi';
import type { Pedido } from '../types/pedido.interface';

export const getPedidoById = async (id: number): Promise<Pedido> => {
  const response = await pedidoApi.get<Pedido>(`/${id}`);
  return response.data;
};
