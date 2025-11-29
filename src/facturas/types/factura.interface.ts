import type { FacturaEstado } from '@/shared/types/estados.types';

import type { FacturaDetalle } from './factura-detalle.interface';

export interface Factura {
  idFactura: number;
  idPedido: number;
  idEmpleado: number;
  numFactura: string;
  fechaEmision: Date | string;
  estado: FacturaEstado;
  montoTotal: string | number;
  idFolio?: number | null;
  pedido?: Pedido;
  empleado?: Empleado;
  detallesFactura?: FacturaDetalle[]; // Detalles de la factura
}

export interface CreateFacturaDto {
  idPedido: number;
  idEmpleado: number;
  numFactura: string;
  estado: FacturaEstado;
  montoTotal: number;
}

export interface UpdateFacturaDto {
  idPedido?: number;
  idEmpleado?: number;
  numFactura?: string;
  idFolio?: number | null;
  estado?: FacturaEstado;
  montoTotal?: number;
}

export interface FacturasResponse {
  data?: Factura[];
  total?: number;
}

export interface GetFacturasParams {
  limit?: number;
  offset?: number;
  q?: string;
}

export interface Empleado {
  idEmpleado: number;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  sexo: string;
  telefono: string;
  fechaNac: Date;
  activo: boolean;
  fechaCreacion: Date;
}

export interface Cliente {
  idCliente: number;
  primerNombre: string;
  primerApellido: string;
  telefono?: string;
  estado?: string;
  fechaCreacion?: Date | string;
}

export interface Pedido {
  idPedido: number;
  idEmpleado: number;
  idCliente: number;
  idDireccion: number;
  idContactoEntrega: number;
  totalProductos: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaEntregaEstimada: Date;
  direccionTxt: string;
  costoEnvio: string;
  totalPedido: string;
  numeroPedido?: string | null;
  cliente?: Cliente; // Cliente asociado al pedido
}
