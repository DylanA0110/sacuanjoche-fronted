import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { CreateEnvioDto, Envio } from '../types/envio.interface';

export const createEnvio = async (
  data: CreateEnvioDto
): Promise<Envio> => {
  try {
    const response = await floristeriaApi.post<Envio>('/envio', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

