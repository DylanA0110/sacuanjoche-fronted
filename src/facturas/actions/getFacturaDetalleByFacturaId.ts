import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { FacturaDetalle } from '../types/factura-detalle.interface';

export const getFacturaDetalleByFacturaId = async (
  idFactura: number
): Promise<FacturaDetalle[]> => {
  try {
    const response = await floristeriaApi.get<FacturaDetalle[]>(
      `/factura-detalle/factura/${idFactura}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

