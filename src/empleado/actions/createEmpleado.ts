import { empleadoApi } from '../api/empleadoApi';
import type { CreateEmpleadoDto, Empleado } from '../types/empleado.interface';

export const createEmpleado = async (data: CreateEmpleadoDto): Promise<Empleado> => {
  return await empleadoApi.create(data);
};

