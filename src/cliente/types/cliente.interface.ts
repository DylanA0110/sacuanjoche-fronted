export interface Cliente {
  idCliente: number;
  primerNombre: string;
  primerApellido: string;
  telefono: string;
  estado: 'activo' | 'inactivo'; // El campo del backend es 'estado'
  fechaCreacion: Date | string;
}

export interface CreateClienteDto {
  primerNombre: string;
  primerApellido: string;
  telefono: string;
  estado?: 'activo' | 'inactivo';
}

export interface UpdateClienteDto {
  primerNombre?: string;
  primerApellido?: string;
  telefono?: string;
  estado?: 'activo' | 'inactivo';
}

export interface ClientesResponse {
  data?: Cliente[];
  total?: number;
}

export interface GetClientesParams {
  limit?: number;
  offset?: number;
  q?: string;
  activo?: 'activo' | 'inactivo' | boolean; // Para query params, puede ser boolean (se convierte a 1/0)
}
