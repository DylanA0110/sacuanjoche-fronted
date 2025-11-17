export interface MetodoPago {
  idMetodoPago: number;
  descripcion: string;
  tipo: string;
  canalesDisponibles: string[];
  estado: 'activo' | 'inactivo';
}

export interface CreateMetodoPagoDto {
  descripcion: string;
  tipo: string;
  canalesDisponibles: string[];
  estado?: 'activo' | 'inactivo';
}

export interface UpdateMetodoPagoDto {
  descripcion?: string;
  tipo?: string;
  canalesDisponibles?: string[];
  estado?: 'activo' | 'inactivo';
}

export interface GetMetodosPagoParams {
  limit?: number;
  offset?: number;
  q?: string;
  estado?: 'activo' | 'inactivo' | boolean;
}

