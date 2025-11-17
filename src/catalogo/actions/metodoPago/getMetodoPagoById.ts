import { metodoPagoApi } from '../../api/metodoPagoApi';
import type { MetodoPago } from '../../types/metodo-pago.interface';

export const getMetodoPagoById = async (id: number): Promise<MetodoPago> => {
  const response = await metodoPagoApi.get<any>(`/${id}`);
  return {
    ...response.data,
    estado: response.data.estado || 'activo',
    canalesDisponibles: response.data.canalesDisponibles || [],
  };
};

