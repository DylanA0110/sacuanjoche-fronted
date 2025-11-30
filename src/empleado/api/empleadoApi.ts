import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { 
  Empleado, 
  CreateEmpleadoDto, 
  UpdateEmpleadoDto,
  PaginatedEmpleadoResponse,
  RegisterEmployeeUserDto,
  UpdateUserRolesDto
} from '../types/empleado.interface';

export const empleadoApi = {
  // Obtener todos los empleados
  getAll: async (params?: { limit?: number; offset?: number; q?: string }): Promise<Empleado[] | PaginatedEmpleadoResponse> => {
    const response = await floristeriaApi.get<Empleado[] | PaginatedEmpleadoResponse>('/empleado', {
      params,
    });
    return response.data;
  },

  // Obtener empleado por ID
  getById: async (id: number): Promise<Empleado> => {
    const response = await floristeriaApi.get<Empleado>(`/empleado/${id}`);
    return response.data;
  },

  // Crear empleado
  create: async (data: CreateEmpleadoDto): Promise<Empleado> => {
    const response = await floristeriaApi.post<Empleado>('/empleado', data);
    return response.data;
  },

  // Actualizar empleado
  update: async (id: number, data: UpdateEmpleadoDto): Promise<Empleado> => {
    const response = await floristeriaApi.patch<Empleado>(`/empleado/${id}`, data);
    return response.data;
  },

  // Registrar usuario para empleado
  registerUser: async (data: RegisterEmployeeUserDto): Promise<void> => {
    await floristeriaApi.post('/auth/register/employee', data);
  },

  // Actualizar roles de usuario
  updateUserRoles: async (userId: string, data: UpdateUserRolesDto): Promise<void> => {
    await floristeriaApi.patch(`/auth/users/${userId}/roles`, data);
  },
};

