export interface Pago {
  idPago: number;
  idMetodoPago: number;
  idPedido?: number | null;
  monto: number;
  estado: 'pendiente' | 'pagado' | 'cancelado' | 'reembolsado';
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
    estado: 'activo' | 'inactivo';
  };
}

export interface CreatePagoPayPalDto {
  idMetodoPago: number;
  monto: number;
}

export interface CreatePagoPayPalResponse {
  idPago: number;
  paypalApprovalUrl: string;
  estado: 'pendiente';
  monto: number;
  idGateway: string;
  gateway: 'PAYPAL';
}

export interface ConfirmPagoPayPalDto {
  orderId: string;
}

export interface ConfirmPagoPayPalResponse {
  idPago: number;
  estado: 'pagado';
  monto: number;
  referencia: string;
  metodoPago?: any;
}

export interface CreatePagoDto {
  idMetodoPago: number;
  monto: number;
  estado?: 'pendiente' | 'pagado' | 'cancelado';
  referencia?: string;
  gateway?: string | null;
}

