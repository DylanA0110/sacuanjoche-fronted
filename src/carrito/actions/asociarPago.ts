import { carritoApi } from '../api/carritoApi';
import type { Carrito } from '../types/carrito.interface';

export const asociarPagoAlCarrito = async (
  idCarrito: number,
  idPago: number
): Promise<Carrito> => {
  try {
    const response = await carritoApi.post<Carrito>(
      `/${idCarrito}/asociar-pago/${idPago}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

