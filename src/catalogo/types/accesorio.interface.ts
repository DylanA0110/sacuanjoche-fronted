export interface Accesorio {
  idAccesorio: number;
  descripcion: string;
  precioUnitario: string | number;
  estado: 'activo' | 'inactivo';
  categoria: string;
}

export interface CreateAccesorioDto {
  descripcion: string;
  precioUnitario: number;
  estado?: 'activo' | 'inactivo';
  categoria: string;
}

export interface UpdateAccesorioDto {
  descripcion?: string;
  precioUnitario?: number;
  estado?: 'activo' | 'inactivo';
  categoria?: string;
}

export interface GetAccesoriosParams {
  limit?: number;
  offset?: number;
  q?: string;
  estado?: 'activo' | 'inactivo' | boolean;
}

