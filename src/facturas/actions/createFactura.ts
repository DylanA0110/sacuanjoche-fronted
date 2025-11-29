import { facturaApi } from '../api/facturaApi';
import type { Factura, CreateFacturaDto } from '../types/factura.interface';

export const createFactura = async (
  facturaData: CreateFacturaDto
): Promise<Factura> => {
  try {
    const response = await facturaApi.post<Factura>('/', facturaData);
    return response.data;
  } catch (error: any) {
    // Preservar el error original con toda su información
    if (error.response) {
      const customError = new Error(
        error.response.data?.message ||
          error.response.data?.error ||
          error.message ||
          'Error al crear la factura'
      );
      (customError as any).response = error.response;
      throw customError;
    }
    throw error;
  }
};
