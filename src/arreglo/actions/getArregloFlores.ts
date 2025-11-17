import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { ArregloFlor } from '../types/arreglo-asociaciones.interface';

// Obtiene asociaciones de flores para un arreglo específico filtrando cliente-side
export const getArregloFlores = async (idArreglo: number): Promise<ArregloFlor[]> => {
  const response = await floristeriaApi.get<ArregloFlor[]>('/arreglo-flor', {
    params: { limit: 100, offset: 0 },
  });
  return (response.data || []).filter((item) => item.idArreglo === idArreglo);
};
