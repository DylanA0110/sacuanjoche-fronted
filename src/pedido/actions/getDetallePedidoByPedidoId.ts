import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { DetallePedido } from '../types/pedido.interface';

export const getDetallePedidoByPedidoId = async (
  idPedido: number
): Promise<DetallePedido[]> => {
  try {
    // Intentar diferentes formatos de endpoint
    let response;

    try {
      // Opción 1: GET /detalle-pedido?idPedido=X
      response = await floristeriaApi.get<
        DetallePedido[] | { data: DetallePedido[] }
      >(`/detalle-pedido`, {
        params: { idPedido },
      });
    } catch (error1) {
      // Opción 2: GET /detalle-pedido/pedido/{idPedido}
      try {
        response = await floristeriaApi.get<
          DetallePedido[] | { data: DetallePedido[] }
        >(`/detalle-pedido/pedido/${idPedido}`);
      } catch {
        // Si ambas opciones fallan, retornar array vacío
        return [];
      }
    }

    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return response.data.data || [];
    }

    return [];
  } catch {
    // No lanzar error, retornar array vacío para que el modal se muestre
    return [];
  }
};
