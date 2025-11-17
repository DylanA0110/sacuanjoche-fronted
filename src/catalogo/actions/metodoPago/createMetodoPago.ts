import { metodoPagoApi } from '../../api/metodoPagoApi';
import type { MetodoPago, CreateMetodoPagoDto } from '../../types/metodo-pago.interface';

export const createMetodoPago = async (
  metodoPagoData: CreateMetodoPagoDto
): Promise<MetodoPago> => {
  const response = await metodoPagoApi.post<any>('/', metodoPagoData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
  };
};

