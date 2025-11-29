import { facturaApi } from '../api/facturaApi';
import type { Factura } from '../types/factura.interface';

export const createFacturaDesdePedido = async (
  idPedido: number | string
): Promise<Factura> => {
  try {
    // Validar y convertir a número primero
    const idPedidoNum = typeof idPedido === 'string' 
      ? parseInt(idPedido.trim(), 10) 
      : Number(idPedido);
    
    if (isNaN(idPedidoNum) || idPedidoNum <= 0 || !Number.isInteger(idPedidoNum)) {
      throw new Error('ID de pedido inválido');
    }

    // Convertir a string numérico limpio (sin espacios, sin decimales)
    const idPedidoStr = String(Math.floor(idPedidoNum));

    // El backend requiere idEmpleado en el body, por ahora siempre será 1
    const response = await facturaApi.post<Factura>(
      `/desde-pedido/${idPedidoStr}`,
      {
        idEmpleado: 1,
      }
    );
    return response.data;
  } catch (error: any) {
    // Manejar errores específicos
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // Intentar obtener el mensaje de error de diferentes formas
      const message =
        data?.message ||
        data?.error ||
        data?.error?.message ||
        (typeof data === 'string' ? data : null);

      // Crear un error con el mensaje apropiado
      const errorMessage = message || 
        (status === 400 
          ? 'El pedido no está pagado, ya tiene factura, o no tiene detalles'
          : status === 404
          ? 'Pedido no encontrado'
          : `Error al crear la factura: ${error.response.status}`);

      const customError = new Error(errorMessage);
      // Agregar información adicional al error para que toastHelpers pueda usarla
      (customError as any).response = error.response;
      throw customError;
    }

    // Si no hay response, es un error de red u otro tipo
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Error desconocido al crear la factura');
  }
};

