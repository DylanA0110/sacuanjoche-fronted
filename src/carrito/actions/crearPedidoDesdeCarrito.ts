import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { Pedido } from '@/pedido/types/pedido.interface';

export interface CrearPedidoDesdeCarritoDto {
  idDireccion: number;
  idContactoEntrega: number;
  idFolio: number; // Siempre debe ser 2
  direccionTxt: string;
  // idEmpleado se maneja automáticamente en el backend
  // fechaEntregaEstimada se maneja automáticamente en el backend
}

export const crearPedidoDesdeCarrito = async (
  idCarrito: number,
  data: CrearPedidoDesdeCarritoDto
): Promise<Pedido> => {
  try {
    const response = await floristeriaApi.post<Pedido>(
      `/carrito/${idCarrito}/crear-pedido`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

