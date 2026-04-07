import type { ClienteEstado } from '@/shared/types/estados.types';

export interface Cliente {
  idCliente: number;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  nombreEmpresa?: string | null;
  telefono: string;
  estado: ClienteEstado; // El campo del backend es 'estado'
  fechaCreacion: Date | string;
}

export interface CreateClienteDto {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  nombreEmpresa?: string;
  telefono: string;
  estado: ClienteEstado; // Requerido, siempre 'activo' para registro
}

export interface UpdateClienteDto {
  primerNombre?: string;
  segundoNombre?: string;
  primerApellido?: string;
  segundoApellido?: string;
  nombreEmpresa?: string;
  telefono?: string;
  estado?: ClienteEstado;
}

export interface ClientesResponse {
  data?: Cliente[];
  total?: number;
}

export interface GetClientesParams {
  limit?: number;
  offset?: number;
  q?: string;
  activo?: ClienteEstado | boolean; // Para query params, puede ser boolean (se convierte a 1/0)
}
