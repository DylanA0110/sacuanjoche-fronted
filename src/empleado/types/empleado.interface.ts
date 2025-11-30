export interface EmpleadoUser {
  id: string;
  email: string;
  loginAttempts: number;
  blockedUntil: string | null;
  estado: 'activo' | 'inactivo';
  roles: string[];
}

export interface Empleado {
  idEmpleado: number;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  sexo: string;
  telefono: string;
  fechaNac: string;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
  user?: EmpleadoUser | null;
}

export interface CreateEmpleadoDto {
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  sexo: 'M' | 'F';
  telefono: string;
  fechaNac: string;
  estado: 'activo' | 'inactivo';
}

export interface UpdateEmpleadoDto {
  primerNombre?: string;
  segundoNombre?: string | null;
  primerApellido?: string;
  segundoApellido?: string | null;
  sexo?: 'M' | 'F';
  telefono?: string;
  fechaNac?: string;
  estado?: 'activo' | 'inactivo';
}

export interface PaginatedEmpleadoResponse {
  data: Empleado[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface RegisterEmployeeUserDto {
  email: string;
  password: string;
  empleadoId: number;
}

export interface UpdateUserRolesDto {
  roles: string[];
}

