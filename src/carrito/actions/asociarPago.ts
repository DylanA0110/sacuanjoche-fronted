import { carritoApi } from '../api/carritoApi';
import type { Carrito } from '../types/carrito.interface';

export const asociarPagoAlCarrito = async (
  idCarrito: number,
  idPago: number
): Promise<Carrito> => {
  try {
    // Enviar un body vacío para asegurar que el Content-Type sea application/json
    const response = await carritoApi.post<Carrito>(
      `/${idCarrito}/asociar-pago/${idPago}`,
      {} // Body vacío para que el servidor acepte el Content-Type
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
