import { rutaApi } from '../api/rutaApi';
import type { UpdateRutaDto, Ruta } from '../types/ruta.interface';

export const updateRuta = async (idRuta: number, data: UpdateRutaDto): Promise<Ruta> => {
  try {
    const response = await rutaApi.patch<Ruta>(`/${idRuta}`, data);
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data || {};
    const errorMessage = Array.isArray(errorData.message) 
      ? errorData.message.join(', ') 
      : errorData.message || error.message;
    
    console.error('❌ [updateRuta] Error al actualizar ruta:', {
      status: error.response?.status,
      message: errorMessage,
      fullMessage: errorData.message,
      data: errorData,
      payload: data,
    });
    
    if (Array.isArray(errorData.message)) {
      const errorMessages = errorData.message.join(', ');
      const customError = new Error(errorMessages);
      (customError as any).response = error.response;
      throw customError;
    }
    
    throw error;
  }
};

