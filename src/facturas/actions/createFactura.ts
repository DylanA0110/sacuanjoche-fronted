import { facturaApi } from '../api/facturaApi';
import type { Factura, CreateFacturaDto } from '../types/factura.interface';

export const createFactura = async (
  facturaData: CreateFacturaDto
): Promise<Factura> => {
  const response = await facturaApi.post<Factura>('/', facturaData);
  return response.data;
};
