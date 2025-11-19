import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { ContactoEntrega } from './createContactoEntrega';

export interface UpdateContactoEntregaDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export const updateContactoEntrega = async (
  id: number,
  data: UpdateContactoEntregaDto
): Promise<ContactoEntrega> => {
  try {
    const response = await floristeriaApi.patch<ContactoEntrega>(
      `/contacto-entrega/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

