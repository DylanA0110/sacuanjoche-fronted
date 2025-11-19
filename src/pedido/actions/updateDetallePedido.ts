import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { DetallePedido } from '../types/pedido.interface';

export interface UpdateDetallePedidoDto {
  idPedido?: number;
  idArreglo?: number;
  cantidad?: number;
  precioUnitario?: number;
  subtotal?: number;
}

export const updateDetallePedido = async (
  id: number,
  data: UpdateDetallePedidoDto
): Promise<DetallePedido> => {
  try {
    const response = await floristeriaApi.patch<DetallePedido>(
      `/detalle-pedido/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

