export interface FormaArreglo {
  idFormaArreglo: number;
  descripcion: string;
  activo: boolean;
}

// Tipo Media compatible con ArregloMedia del backend
export interface Media {
  idArregloMedia?: number;
  idMedia?: number; // Compatibilidad con código existente
  idArreglo?: number;
  url: string;
  objectKey?: string;
  orden: number;
  isPrimary: boolean;
  tipo?: 'imagen' | 'video';
  altText?: string;
  activo?: boolean;
  fechaCreacion?: string | Date;
  fechaUltAct?: string | Date;
  // Campos legacy (para compatibilidad)
  provider?: string;
  contentType?: string;
  metadata?: {
    width?: number;
    height?: number;
  };
}

import type { ArregloEstado } from '@/shared/types/estados.types';

export interface Arreglo {
  idArreglo: number;
  idFormaArreglo: number;
  nombre: string;
  descripcion: string;
  url?: string;
  precioUnitario: string | number;
  estado: ArregloEstado;
  fechaCreacion?: Date | string;
  formaArreglo?: FormaArreglo;
  media?: Media[];
}

export interface CreateArregloDto {
  idFormaArreglo: number;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  estado?: ArregloEstado;
}

export interface UpdateArregloDto {
  idFormaArreglo?: number;
  nombre?: string;
  descripcion?: string;
  precioUnitario?: number;
  estado?: ArregloEstado;
}

export interface GetArreglosParams {
  limit?: number;
  offset?: number;
  q?: string;
  estado?: ArregloEstado | boolean;
}

// Tipos para respuestas del backend (raw)
export interface ArregloMediaResponse {
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

export interface ArregloResponse {
  idArreglo: number;
  idFormaArreglo: number;
  nombre: string;
  descripcion: string;
  url?: string;
  precioUnitario: string | number;
  estado: ArregloEstado;
  fechaCreacion: string | Date;
  formaArreglo?: FormaArreglo;
  media?: ArregloMediaResponse[];
}

export interface ArreglosPaginatedResponse {
  data: ArregloResponse[];
  total: number;
}
