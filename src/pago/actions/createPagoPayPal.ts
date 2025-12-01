import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type {
  CreatePagoPayPalDto,
  CreatePagoPayPalResponse,
} from '../types/pago.interface';

export const createPagoPayPal = async (
  data: CreatePagoPayPalDto
): Promise<CreatePagoPayPalResponse> => {
  try {
    const response = await floristeriaApi.post<CreatePagoPayPalResponse>(
      '/pago/paypal/create',
      data
    );

    // Validar que la respuesta tenga los campos necesarios
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.idPago) {
      throw new Error('El servidor no devolvió un ID de pago');
    }

    if (!response.data.paypalApprovalUrl) {
      throw new Error('El servidor no devolvió la URL de aprobación de PayPal');
    }

    return response.data;
  } catch (error: any) {
    throw error;
  }
};
