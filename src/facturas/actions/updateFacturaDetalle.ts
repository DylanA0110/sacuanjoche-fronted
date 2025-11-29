import { facturaApi } from '../api/facturaApi';
import type { FacturaDetalle } from '../types/factura-detalle.interface';

export interface UpdateFacturaDetalleDto {
  idFactura?: number;
  idArreglo?: number;
  cantidad?: number;
  precioUnitario?: number;
  subtotal?: number;
}

/**
 * Actualizar un detalle de factura
 * @param id - ID del detalle de factura a actualizar
 * @param detalleData - Datos a actualizar
 * @returns Promise<FacturaDetalle>
 */
export const updateFacturaDetalle = async (
  id: number,
  detalleData: UpdateFacturaDetalleDto
): Promise<FacturaDetalle> => {
  const response = await facturaApi.patch<FacturaDetalle>(`/factura-detalle/${id}`, detalleData);
  return response.data;
};

