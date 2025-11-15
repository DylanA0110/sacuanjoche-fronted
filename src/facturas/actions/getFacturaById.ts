import { facturaApi } from '../api/facturaApi';
import type { Factura } from '../types/factura.interface';

export const getFacturaById = async (id: number): Promise<Factura> => {
  const response = await facturaApi.get<Factura>(`/${id}`);
  return response.data;
};
