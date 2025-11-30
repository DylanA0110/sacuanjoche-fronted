import { empleadoApi } from '../api/empleadoApi';
import type { Empleado } from '../types/empleado.interface';

export const getEmpleadoById = async (id: number): Promise<Empleado> => {
  return await empleadoApi.getById(id);
};

