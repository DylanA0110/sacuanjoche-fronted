export interface Carrito {
  idCarrito: number;
  idUser: string;
  idPago?: number | null;
  fechaCreacion: string | Date;
  fechaUltAct: string | Date;
  estado: 'activo' | 'cerrado' | 'expirado';
  user?: any;
  pago?: any;
  carritosArreglo?: CarritoArreglo[];
}

import type { Media } from '@/arreglo/types/arreglo.interface';

export interface CarritoArreglo {
  idCarritoArreglo: number;
  idCarrito: number;
  idArreglo: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number;
  fechaCreacion: string | Date;
  fechaUltAct: string | Date;
  arreglo?: {
    idArreglo: number;
    nombre: string;
    descripcion?: string;
    precioUnitario: number;
    estado: 'activo' | 'inactivo';
    url?: string;
    media?: Media[]; // Usar el tipo Media completo para compatibilidad
  };
}

export interface CreateCarritoDto {
  idUser: string; // UUID del usuario logueado (user.id)
  estado?: 'activo' | 'cerrado' | 'expirado';
}

export interface CreateCarritoArregloDto {
  idCarrito: number;
  idArreglo: number;
  cantidad: number;
  precioUnitario: number;
  totalLinea: number; // Requerido - se calcula como cantidad * precioUnitario
}

export interface UpdateCarritoArregloDto {
  cantidad?: number;
  precioUnitario?: number;
}

export interface GetCarritosParams {
  limit?: number;
  offset?: number;
  estado?: 'activo' | 'cerrado' | 'expirado';
}

