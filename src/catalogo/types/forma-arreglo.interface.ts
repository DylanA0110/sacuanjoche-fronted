export interface FormaArreglo {
  idFormaArreglo: number;
  descripcion: string;
  activo: boolean;
}

export interface CreateFormaArregloDto {
  descripcion: string;
}

export interface UpdateFormaArregloDto {
  descripcion?: string;
  activo?: boolean;
}

export interface GetFormasArregloParams {
  limit?: number;
  offset?: number;
  q?: string;
  activo?: boolean;
}

