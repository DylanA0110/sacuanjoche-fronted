export interface Flor {
  idFlor: number;
  nombre: string;
  color: string;
  precioUnitario: string | number;
  tipo: string;
  estado: 'activo' | 'inactivo';
}

export interface CreateFlorDto {
  nombre: string;
  color: string;
  precioUnitario: number;
  tipo: string;
  estado?: 'activo' | 'inactivo';
}

export interface UpdateFlorDto {
  nombre?: string;
  color?: string;
  precioUnitario?: number;
  tipo?: string;
  estado?: 'activo' | 'inactivo';
}

export interface GetFloresParams {
  limit?: number;
  offset?: number;
  q?: string;
  estado?: 'activo' | 'inactivo' | boolean;
}

