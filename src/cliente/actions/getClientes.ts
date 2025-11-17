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
    console.error('Error en getClientes:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Error response status:', axiosError.response?.status);
      console.error('Error response data:', axiosError.response?.data);
    }
    throw error;
  }
};
