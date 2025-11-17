import { metodoPagoApi } from '../../api/metodoPagoApi';
import type { MetodoPago, UpdateMetodoPagoDto } from '../../types/metodo-pago.interface';

export const updateMetodoPago = async (
  id: number,
  metodoPagoData: UpdateMetodoPagoDto
): Promise<MetodoPago> => {
  const response = await metodoPagoApi.patch<any>(`/${id}`, metodoPagoData);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
    canalesDisponibles: response.data.canalesDisponibles || [],
  };
};

