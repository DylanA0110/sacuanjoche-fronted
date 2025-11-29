import { clienteApi } from '../api/clienteApi';
import type { GetClientesParams, Cliente } from '../types/cliente.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

export const getClientes = async (
  params?: GetClientesParams
): Promise<Cliente[] | PaginatedResponse<Cliente>> => {
  try {
    // El backend solo acepta limit, offset y q en los query params
    // No acepta el parámetro 'activo', así que lo filtramos en el frontend
    const queryParams = params
      ? {
          limit: params.limit,
          offset: params.offset,
          ...(params.q && { q: params.q }),
        }
      : undefined;

    const response = await clienteApi.get<any>('/', {
      params: queryParams,
    });

    // Función para mapear un cliente y asegurar que tenga el campo 'estado'
    const mapCliente = (cliente: any): Cliente => ({
      ...cliente,
      estado: cliente.estado || cliente.activo || 'activo', // Mapear 'activo' a 'estado' si es necesario
    });

    // Si hay parámetros de paginación, el backend DEBE devolver un objeto con data y total
    if (params?.limit !== undefined || params?.offset !== undefined) {
      // Si el backend devuelve un array cuando se espera paginación, necesitamos obtener el total
      if (Array.isArray(response.data)) {
        const currentData = response.data.map(mapCliente);
        const limit = params.limit || 10;
        const offset = params.offset || 0;
        
        // SIEMPRE obtener el total real del backend cuando devuelve un array
        try {
          const totalResponse = await clienteApi.get<any>('/', {
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
            total = offset + currentData.length + 1; // +1 para indicar que hay más
          }
          
          return {
            data: currentData,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          if (currentData.length < limit) {
            const calculatedTotal = offset + currentData.length;
            return {
              data: currentData,
              total: calculatedTotal,
            };
          }
          // Si tenemos exactamente 'limit' elementos, asumimos que hay más
          const estimatedTotal = offset + currentData.length + 1;
          return {
            data: currentData,
            total: estimatedTotal,
          };
        }
      }
      
      // Si el backend devuelve un objeto con data y total, usarlo directamente
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data
      ) {
        const total = response.data.total ?? 0;
        return {
          data: (response.data.data || []).map(mapCliente),
          total: total,
        };
      }
    }

    // Sin paginación, devolver array directamente
    if (Array.isArray(response.data)) {
      return response.data.map(mapCliente);
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      return {
        data: (response.data.data || []).map(mapCliente),
        total: response.data.total ?? 0,
      };
    }

    return [];
  } catch (error) {
    throw error;
  }
};
