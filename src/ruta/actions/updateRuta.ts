import { rutaApi } from '../api/rutaApi';
import type { UpdateRutaDto, Ruta } from '../types/ruta.interface';

export const updateRuta = async (idRuta: number, data: UpdateRutaDto): Promise<Ruta> => {
  try {
    const response = await rutaApi.patch<Ruta>(`/${idRuta}`, data);
    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data || {};
    
    if (Array.isArray(errorData.message)) {
      const errorMessages = errorData.message.join(', ');
      const customError = new Error(errorMessages);
      (customError as any).response = error.response;
      throw customError;
    }
    
    throw error;
  }
};

