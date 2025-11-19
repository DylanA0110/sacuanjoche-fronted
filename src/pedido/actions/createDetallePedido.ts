import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CreateDetallePedidoDto, DetallePedido } from '../types/pedido.interface';

export const createDetallePedido = async (
  data: CreateDetallePedidoDto
): Promise<DetallePedido> => {
  try {
    const response = await floristeriaApi.post<DetallePedido>('/detalle-pedido', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

