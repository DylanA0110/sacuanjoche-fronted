import { empleadoApi } from '../api/empleadoApi';
import type { Empleado, PaginatedEmpleadoResponse } from '../types/empleado.interface';

export interface GetEmpleadosParams {
  limit?: number;
  offset?: number;
  q?: string;
}

export const getEmpleados = async (params?: GetEmpleadosParams): Promise<Empleado[]> => {
  const response = await empleadoApi.getAll(params);
  
  if (Array.isArray(response)) {
    return response;
  }
  
  const paginated = response as PaginatedEmpleadoResponse;
  return paginated.data || [];
};

