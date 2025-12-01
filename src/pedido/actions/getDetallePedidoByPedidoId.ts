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
    } catch (error1: any) {
      // Si el error es 400 o 404, intentar el otro endpoint
      if (error1?.response?.status === 400 || error1?.response?.status === 404) {
        try {
          // Opción 2: GET /detalle-pedido/pedido/{idPedido}
          response = await floristeriaApi.get<
            DetallePedido[] | { data: DetallePedido[] }
          >(`/detalle-pedido/pedido/${idPedido}`);
        } catch (error2: any) {
          // Si ambas opciones fallan, retornar array vacío silenciosamente
          // No loguear error porque los detalles pueden no existir aún o venir en el pedido
          // Solo loguear si no es un error 400/404 (error inesperado)
          if (error2?.response?.status !== 400 && error2?.response?.status !== 404) {
            console.warn('Error inesperado al obtener detalles del pedido:', error2);
          }
          return [];
        }
      } else {
        // Error inesperado, retornar vacío
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
  } catch (error: any) {
    // No lanzar error, retornar array vacío para que el modal se muestre
    // Los detalles pueden venir en el pedido directamente
    // Solo loguear si no es un error 400/404 (error inesperado)
    if (error?.response?.status !== 400 && error?.response?.status !== 404) {
      console.warn('Error al obtener detalles del pedido:', error);
    }
    return [];
  }
};
