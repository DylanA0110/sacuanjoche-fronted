import { facturaApi } from '../api/facturaApi';
import type { Factura, UpdateFacturaDto } from '../types/factura.interface';

/**
 * Actualizar una factura
 * @param id - ID de la factura a actualizar
 * @param facturaData - Datos a actualizar
 * @returns Promise<Factura>
 */
export const updateFactura = async (
  id: number,
  facturaData: UpdateFacturaDto
): Promise<Factura> => {
  const response = await facturaApi.patch<Factura>(`/${id}`, facturaData);
  return response.data;
};

