import type { MetodoPagoEstado } from '@/shared/types/estados.types';

export interface MetodoPago {
  idMetodoPago: number;
  descripcion: string;
  tipo: string;
  canalesDisponibles: string[];
  estado: MetodoPagoEstado;
}

export interface CreateMetodoPagoDto {
  descripcion: string;
  tipo: string;
  canalesDisponibles: string[];
  estado?: MetodoPagoEstado;
}

export interface UpdateMetodoPagoDto {
  descripcion?: string;
  tipo?: string;
  canalesDisponibles?: string[];
  estado?: MetodoPagoEstado;
}

export interface GetMetodosPagoParams {
  limit?: number;
  offset?: number;
  q?: string;
  estado?: MetodoPagoEstado | boolean;
}

