import type {
  PagoEstado,
  MetodoPagoEstado,
} from '@/shared/types/estados.types';

export interface Pago {
  idPago: number;
  idMetodoPago: number;
  idPedido?: number | null;
  monto: number;
  estado: PagoEstado;
  referencia?: string | null;
  gateway?: string | null;
  idGateway?: string | null;
  fechaCreacion: string | Date;
  fechaUltAct: string | Date;
  metodoPago?: {
    idMetodoPago: number;
    descripcion: string;
    tipo: string;
    canalesDisponibles: string[];
    estado: MetodoPagoEstado;
  };
}

export interface CreatePagoPayPalDto {
  idMetodoPago: number;
  monto: number;
}

export interface CreatePagoPayPalResponse {
  idPago: number;
  paypalApprovalUrl: string;
  estado: PagoEstado;
  monto: number;
  idGateway: string;
  gateway: 'PAYPAL';
}

export interface ConfirmPagoPayPalDto {
  orderId: string;
}

export interface ConfirmPagoPayPalResponse {
  idPago: number;
  estado: PagoEstado;
  monto: number;
  referencia: string;
  metodoPago?: {
    idMetodoPago: number;
    descripcion: string;
    tipo: string;
    canalesDisponibles: string[];
    estado: MetodoPagoEstado;
  };
}

export interface CreatePagoDto {
  idMetodoPago: number;
  monto: number;
  estado?: PagoEstado;
  referencia?: string;
  gateway?: string | null;
}
