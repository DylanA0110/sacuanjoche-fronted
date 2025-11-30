import { empleadoApi } from '../api/empleadoApi';
import type { UpdateUserRolesDto } from '../types/empleado.interface';

export const updateUserRoles = async (userId: string, data: UpdateUserRolesDto): Promise<void> => {
  return await empleadoApi.updateUserRoles(userId, data);
};

