import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { AccesorioArreglo } from '../types/arreglo-asociaciones.interface';

// Obtiene asociaciones de accesorios para un arreglo específico filtrando cliente-side
export const getArregloAccesorios = async (idArreglo: number): Promise<AccesorioArreglo[]> => {
  const response = await floristeriaApi.get<AccesorioArreglo[]>('/accesorios-arreglo', {
    params: { limit: 100, offset: 0 },
  });
  return (response.data || []).filter((item) => item.idArreglo === idArreglo);
};
