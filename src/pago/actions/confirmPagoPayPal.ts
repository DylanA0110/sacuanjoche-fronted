import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import { logger } from '@/shared/utils/logger';
import type {
  ConfirmPagoPayPalDto,
  ConfirmPagoPayPalResponse,
} from '../types/pago.interface';

export const confirmPagoPayPal = async (
  idPago: number,
  data: ConfirmPagoPayPalDto
): Promise<ConfirmPagoPayPalResponse> => {
  try {
    logger.debug('📤 Confirmando pago PayPal:', {
      idPago,
      orderId: data.orderId,
      endpoint: `/pago/paypal/confirm/${idPago}`,
    });

    const response = await floristeriaApi.post<ConfirmPagoPayPalResponse>(
      `/pago/paypal/confirm/${idPago}`,
      data
    );

    logger.debug('📥 Respuesta de confirmación:', response.data);

    // Validar respuesta
    if (!response.data) {
      throw new Error('No se recibió respuesta al confirmar el pago');
    }

    if (!response.data.idPago) {
      logger.error('❌ Respuesta sin idPago:', response.data);
      throw new Error('El servidor no devolvió un ID de pago válido');
    }

    if (response.data.idPago !== idPago) {
      logger.error('❌ idPago no coincide:', {
        esperado: idPago,
        recibido: response.data.idPago,
      });
      throw new Error('El ID del pago confirmado no coincide con el esperado');
    }

    return response.data;
  } catch (error: any) {
    logger.error('❌ Error en confirmPagoPayPal:', {
      idPago,
      orderId: data.orderId,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};
