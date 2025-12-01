import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type {
  CreatePagoPayPalDto,
  CreatePagoPayPalResponse,
} from '../types/pago.interface';

export const createPagoPayPal = async (
  data: CreatePagoPayPalDto
): Promise<CreatePagoPayPalResponse> => {
  try {
    console.log('📤 Enviando request a /pago/paypal/create:', data);

    const response = await floristeriaApi.post<CreatePagoPayPalResponse>(
      '/pago/paypal/create',
      data
    );

    console.log('📥 Respuesta del servidor:', response.data);

    // Validar que la respuesta tenga los campos necesarios
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.idPago) {
      console.error('❌ Respuesta sin idPago:', response.data);
      throw new Error('El servidor no devolvió un ID de pago');
    }

    if (!response.data.paypalApprovalUrl) {
      console.error('❌ Respuesta sin paypalApprovalUrl:', response.data);
      throw new Error('El servidor no devolvió la URL de aprobación de PayPal');
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Error en createPagoPayPal:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
