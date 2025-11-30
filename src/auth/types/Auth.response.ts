export interface EmpleadoAuth {
  idEmpleado: number;
  primerNombre: string | null;
  segundoNombre?: string | null;
  primerApellido: string | null;
  segundoApellido?: string | null;
  nombreCompleto?: string;
  estado?: string; // 'activo' | 'inactivo'
}

export interface ClienteAuth {
  idCliente: number;
  primerNombre: string | null;
  segundoNombre?: string | null;
  primerApellido: string | null;
  segundoApellido?: string | null;
  nombreCompleto?: string;
}

export interface AuthResponse {
    id:            string;
    email:         string;
    loginAttempts: number;
    blockedUntil:  null;
    estado:        string;
    roles:         string[];
    token:         string;
    empleado?:     EmpleadoAuth;
    cliente?:      ClienteAuth;
}
