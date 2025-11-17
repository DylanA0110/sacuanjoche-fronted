export interface FormaArreglo {
  idFormaArreglo: number;
  descripcion: string;
  activo: boolean;
}

export interface Media {
  idMedia?: number;
  url: string;
  objectKey?: string;
  provider?: string;
  contentType?: string;
  altText?: string;
  orden?: number;
  isPrimary?: boolean;
  metadata?: {
    width?: number;
    height?: number;
  };
}

export interface Arreglo {
  idArreglo: number;
  idFormaArreglo: number;
  nombre: string;
  descripcion: string;
  url?: string;
  precioUnitario: string | number;
  cantidadFlores: number;
  estado: 'activo' | 'inactivo';
  fechaCreacion?: Date | string;
  formaArreglo?: FormaArreglo;
  media?: Media[];
}

export interface CreateArregloDto {
  idFormaArreglo: number;
  nombre: string;
  descripcion: string;
  url?: string;
  precioUnitario: number;
  cantidadFlores: number;
  estado?: 'activo' | 'inactivo';
}

export interface UpdateArregloDto {
  idFormaArreglo?: number;
  nombre?: string;
  descripcion?: string;
  url?: string;
  precioUnitario?: number;
  cantidadFlores?: number;
  estado?: 'activo' | 'inactivo';
}

export interface GetArreglosParams {
  limit?: number;
  offset?: number;
  q?: string;
  estado?: 'activo' | 'inactivo' | boolean;
}

export interface UploadUrlRequest {
  contentType: string;
  contentLength: number;
  fileName: string;
  arregloId: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  expiresAt: string;
  objectKey: string;
  publicUrl: string;
}

export interface CreateMediaDto {
  url: string;
  objectKey?: string;
  provider?: string;
  contentType?: string;
  altText?: string;
  orden?: number;
  isPrimary?: boolean;
  metadata?: {
    width?: number;
    height?: number;
  };
}

export interface UpdateMediaDto {
  url?: string;
  objectKey?: string;
  provider?: string;
  contentType?: string;
  altText?: string;
  orden?: number;
  isPrimary?: boolean;
  metadata?: {
    width?: number;
    height?: number;
  };
}

