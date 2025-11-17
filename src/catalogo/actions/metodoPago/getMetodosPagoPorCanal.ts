import { metodoPagoApi } from '../../api/metodoPagoApi';
import type { MetodoPago } from '../../types/metodo-pago.interface';

export const getMetodosPagoPorCanal = async (
  canal: string
): Promise<MetodoPago[]> => {
  try {
    const response = await metodoPagoApi.get<any>(`/por-canal/${canal}`);
    
    if (Array.isArray(response.data)) {
      return response.data.map((metodo: any) => ({
        ...metodo,
        estado: metodo.estado || 'activo',
        canalesDisponibles: metodo.canalesDisponibles || [],
      }));
    }

    return [];
  } catch (error) {
    console.error('Error en getMetodosPagoPorCanal:', error);
    throw error;
  }
};

