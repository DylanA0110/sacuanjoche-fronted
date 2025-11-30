import { carritoApi } from '../api/carritoApi';
import type { Carrito, CreateCarritoDto } from '../types/carrito.interface';
import { logger } from '@/shared/utils/logger';

export const createCarrito = async (
  data: CreateCarritoDto
): Promise<Carrito> => {
  // El backend requiere idUser como UUID string (el UUID del usuario logueado, no idCliente ni idEmpleado)
  if (!data.idUser || typeof data.idUser !== 'string') {
    logger.error(
      '❌ [createCarrito] idUser inválido (debe ser UUID string):',
      data
    );
    throw new Error('idUser es requerido para crear el carrito');
  }

  // Construir el payload
  const payload: CreateCarritoDto = {
    idUser: data.idUser,
  };

  // Solo agregar estado si se especifica explícitamente
  if (data.estado) {
    payload.estado = data.estado;
  }

  try {
    logger.debug(
      '🛒 [createCarrito] Creando carrito con payload:',
      JSON.stringify(payload, null, 2)
    );

    const response = await carritoApi.post<Carrito>('/', payload);
    logger.debug('✅ [createCarrito] Carrito creado:', response.data.idCarrito);
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data || {};
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message.join(', ')
      : errorData.message || error.message;

    logger.error('❌ [createCarrito] Error al crear carrito:', {
      status: error.response?.status,
      message: errorMessage,
      fullMessage: errorData.message,
      data: errorData,
      errors: errorData.errors,
      validationErrors: errorData.validationErrors,
      payload: payload,
    });

    // Si el mensaje es un array, formatearlo
    if (Array.isArray(errorData.message)) {
      const errorMessages = errorData.message.join(', ');
      const customError = new Error(errorMessages);
      (customError as any).response = error.response;
      throw customError;
    }

    // Crear un error más descriptivo
    const descriptiveError = new Error(errorMessage);
    (descriptiveError as any).response = error.response;
    throw descriptiveError;
  }
};
