import { empleadoApi } from '../api/empleadoApi';
import type { RegisterEmployeeUserDto } from '../types/empleado.interface';

export const registerEmployeeUser = async (data: RegisterEmployeeUserDto): Promise<void> => {
  return await empleadoApi.registerUser(data);
};

