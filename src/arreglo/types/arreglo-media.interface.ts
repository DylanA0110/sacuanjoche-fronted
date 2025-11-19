/**
 * Interfaces para la gestión de imágenes de arreglos con Supabase
 */

export interface ArregloMedia {
  idArregloMedia: number;
  idArreglo: number;
  url: string;
  objectKey?: string;
  orden: number;
  isPrimary: boolean;
  tipo: 'imagen' | 'video';
  altText?: string;
  activo: boolean;
  fechaCreacion: string | Date;
  fechaUltAct?: string | Date;
}

export interface CreateArregloMediaSimpleDto {
  url: string;
  orden?: number;
  isPrimary?: boolean;
  altText?: string;
}

export interface CreateArregloMediaBatchDto {
  imagenes: Array<{
    url: string;
    orden?: number;
    isPrimary?: boolean;
    altText?: string;
  }>;
}

export interface UpdateArregloMediaSupabaseDto {
  orden?: number;
  tipo?: 'imagen' | 'video';
  altText?: string;
  isPrimary?: boolean;
}

