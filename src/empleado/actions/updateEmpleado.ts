import { empleadoApi } from '../api/empleadoApi';
import type { UpdateEmpleadoDto, Empleado } from '../types/empleado.interface';

export const updateEmpleado = async (id: number, data: UpdateEmpleadoDto): Promise<Empleado> => {
  return await empleadoApi.update(id, data);
};

