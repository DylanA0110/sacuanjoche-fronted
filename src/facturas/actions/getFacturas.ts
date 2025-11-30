import { facturaApi } from '../api/facturaApi';
import type {
  Factura,
  FacturasResponse,
  GetFacturasParams,
} from '../types/factura.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getFacturas = async (
  params?: GetFacturasParams
): Promise<Factura[] | PaginatedResponse<Factura>> => {
  try {
    const response = await facturaApi.get<Factura[] | FacturasResponse>('/', {
      params,
    });

    // Si la respuesta es un array directo
    if (Array.isArray(response.data)) {
      // Si hay parámetros de paginación, necesitamos obtener el total
      if (params?.limit !== undefined || params?.offset !== undefined) {
        const currentData = response.data;
        const limit = params.limit || 10;
        
        // Si tenemos menos elementos que el limit, sabemos que es la última página
        // Total = offset + cantidad de elementos en esta página
        if (currentData.length < limit) {
          const offset = params.offset || 0;
          return {
            data: currentData,
            total: offset + currentData.length,
          };
        }
        
        // SIEMPRE obtener el total real del backend cuando devuelve un array
        // Esto asegura que siempre tengamos el total correcto, no solo el de la página actual
        try {
          // Usar un límite muy alto para obtener todos los elementos y contar el total real
          const totalResponse = await facturaApi.get<Factura[] | FacturasResponse>('/', {
            params: {
              ...(params?.q ? { q: params.q } : {}),
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let total = 0;
          if (Array.isArray(totalResponse.data)) {
            total = totalResponse.data.length;
          } else if (totalResponse.data && typeof totalResponse.data === 'object' && 'total' in totalResponse.data) {
            total = (totalResponse.data as any).total || 0;
          }
          
          // Si el total sigue siendo 10 (igual al limit actual), podría ser que el backend tenga un límite máximo
          if (total === 10 && currentData.length === 10 && limit === 10) {
            const currentOffset = params.offset || 0;
            total = currentOffset + currentData.length + 1; // +1 para indicar que hay más
          }
          
          return {
            data: currentData,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          if (currentData.length < limit) {
            const offset = params.offset || 0;
            const calculatedTotal = offset + currentData.length;
            return {
              data: currentData,
              total: calculatedTotal,
            };
          }
          // Si tenemos exactamente 'limit' elementos, asumimos que hay más
          const offset = params.offset || 0;
          const estimatedTotal = offset + currentData.length + 1;
          return {
            data: currentData,
            total: estimatedTotal,
          };
        }
      }
      // Sin paginación, devolver array directo
      return response.data;
    }

    // Si es un objeto con data y total, lo convertimos a PaginatedResponse
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
      };
    }

    // Fallback: devolver array vacío
    return [];
  } catch (error) {
    throw error; // Re-lanzar para que React Query lo maneje
  }
};
