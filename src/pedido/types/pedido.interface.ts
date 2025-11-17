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
  costoEnvio: string | number;
  totalPedido: string | number;
  empleado?: Empleado;
  cliente?: Cliente;
  direccion?: Direccion;
  contactoEntrega?: ContactoEntrega;
}

export interface CreatePedidoDto {
  idEmpleado: number;
  idCliente: number;
  idDireccion: number;
  idContactoEntrega: number;
  totalProductos: number;
  fechaEntregaEstimada: string;
  direccionTxt: string;
  costoEnvio: number;
  totalPedido: number;
}

export interface UpdatePedidoDto {
  idEmpleado?: number;
  idCliente?: number;
  idDireccion?: number;
  idContactoEntrega?: number;
  totalProductos?: number;
  fechaEntregaEstimada?: string;
  direccionTxt?: string;
  costoEnvio?: number;
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
