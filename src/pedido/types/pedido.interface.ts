import type { PedidoEstado, PedidoCanal, ArregloEstado } from '@/shared/types/estados.types';
import type { Envio } from './envio.interface';

export interface Pedido {
  idPedido: number;
  idEmpleado: number;
  idCliente: number;
  idDireccion: number;
  idContactoEntrega: number;
  totalProductos: string | number;
  fechaCreacion: string | Date;
  fechaActualizacion: string | Date;
  fechaEntregaEstimada: string | Date;
  direccionTxt: string;
  costoEnvio?: string | number; // Puede venir directamente o en el objeto envio
  totalPedido: string | number;
  estado?: PedidoEstado;
  idPago?: number | null;
  canal?: PedidoCanal;
  numeroPedido?: string | null;
  idFolio?: number | null;
  empleado?: Empleado;
  cliente?: Cliente;
  direccion?: Direccion;
  contactoEntrega?: ContactoEntrega;
  envio?: Envio; // Objeto envío con costo de envío
  detalles?: DetallePedido[];
}

// DTO para crear un pedido (según documentación de la API)
export interface CreatePedidoDto {
  canal: PedidoCanal; // Siempre "interno"
  idPago?: number | null;
  idEmpleado: number;
  idCliente: number;
  idDireccion: number;
  idContactoEntrega: number;
  idFolio?: number; // Siempre 2
  fechaEntregaEstimada: string; // ISO 8601 format
  direccionTxt: string;
}

// DTO para crear un detalle de pedido
export interface CreateDetallePedidoDto {
  idPedido: number;
  idArreglo: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

// DTO para actualizar un detalle de pedido
export interface UpdateDetallePedidoDto {
  idPedido?: number;
  idArreglo?: number;
  cantidad?: number;
  precioUnitario?: number;
  subtotal?: number;
}

// Interfaz para detalle de pedido
export interface DetallePedido {
  idDetallePedido?: number;
  idPedido: number;
  idArreglo: number;
  cantidad: number;
  precioUnitario: number | string;
  subtotal: number | string;
  arreglo?: {
    idArreglo: number;
    idFormaArreglo?: number;
    nombre: string;
    descripcion?: string;
    url?: string;
    precioUnitario: number | string;
    estado?: ArregloEstado;
    fechaCreacion?: string | Date;
  };
}

export interface UpdatePedidoDto {
  canal?: PedidoCanal; // Siempre "interno"
  idPago?: number | null; // Siempre null para canal interno
  idEmpleado?: number;
  idCliente?: number;
  idDireccion?: number;
  idContactoEntrega?: number;
  idFolio?: number; // Siempre 2
  totalProductos?: number;
  fechaEntregaEstimada?: string;
  direccionTxt?: string;
  totalPedido?: number;
}

export interface PedidosResponse {
  data?: Pedido[];
  total?: number;
}

export interface GetPedidosParams {
  limit?: number;
  offset?: number;
  q?: string;
}

export interface Cliente {
  idCliente: number;
  primerNombre: string;
  primerApellido: string;
  telefono: string;
  activo: boolean;
  fechaCreacion: Date;
}

export interface ContactoEntrega {
  idContactoEntrega: number;
  nombre: string;
  apellido: string;
  telefono: string;
}

export interface Direccion {
  idDireccion: number;
  formattedAddress: string;
  country: string;
  adminArea: null;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  referencia: string;
  lat: string;
  lng: string;
  provider: string;
  placeId: string;
  accuracy: string;
  geolocation: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaUltAct: Date;
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
