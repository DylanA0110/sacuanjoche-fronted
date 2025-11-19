import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { Direccion } from '../types/direccion.interface';

export interface UpdateDireccionDto {
  formattedAddress?: string;
  country?: string;
  stateProv?: string | null;
  city?: string;
  neighborhood?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  referencia?: string;
  lat?: number;
  lng?: number;
  provider?: string;
  placeId?: string;
  accuracy?: string;
  geolocation?: string;
  activo?: boolean;
}

export const updateDireccion = async (
  id: number,
  data: UpdateDireccionDto
): Promise<Direccion> => {
  try {
    const response = await floristeriaApi.patch<Direccion>(
      `/direccion/${id}`,
      data
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

