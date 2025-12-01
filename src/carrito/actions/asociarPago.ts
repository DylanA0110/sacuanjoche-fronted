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
    console.error('❌ Error al asociar pago al carrito:', {
      idCarrito,
      idPago,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    throw error;
  }
};
