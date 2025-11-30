import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type {
  CarritoArreglo,
  CreateCarritoArregloDto,
} from '../types/carrito.interface';
import { logger } from '@/shared/utils/logger';

export const createCarritoArreglo = async (
  data: CreateCarritoArregloDto
): Promise<CarritoArreglo> => {
  try {
    logger.debug(
      '🛒 [createCarritoArreglo] Agregando producto al carrito...',
      JSON.stringify(data, null, 2)
    );
    const response = await floristeriaApi.post<CarritoArreglo>(
      '/carritos-arreglo',
      data
    );
    logger.debug(
      '✅ [createCarritoArreglo] Producto agregado:',
      response.data.idCarritoArreglo
    );
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data || {};
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || error.message;

    logger.error('❌ [createCarritoArreglo] Error al agregar producto:', {
      status: error.response?.status,
      message: errorMessage,
      fullMessage: errorData.message,
      data: errorData,
      errors: errorData.errors,
      validationErrors: errorData.validationErrors,
      payload: data,
    });

    // Si el mensaje es un array, formatearlo
    if (Array.isArray(errorData.message)) {
      const errorMessages = errorData.message.join(', ');
      const customError = new Error(errorMessages);
      (customError as any).response = error.response;
      throw customError;
    }

    throw error;
  }
};
