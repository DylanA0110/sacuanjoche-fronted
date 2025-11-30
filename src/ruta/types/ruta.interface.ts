export interface Ruta {
  idRuta: number;
  nombre: string;
  idEmpleado: number;
  fechaProgramada: string | Date;
  profile: 'driving' | 'walking' | 'cycling';
  origenLat?: number;
  origenLng?: number;
  roundTrip: boolean;
  fechaCreacion: string | Date;
  fechaUltAct: string | Date;
  empleado?: EmpleadoConductor;
  pedidos?: PedidoRuta[];
}

export interface EmpleadoConductor {
  idEmpleado: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  nombreCompleto?: string;
  telefono: string;
  activo: boolean;
  roles?: string[];
}

export interface PedidoRuta {
  idPedido: number;
  numeroPedido?: string;
  cliente?: {
    idCliente: number;
    primerNombre: string;
    primerApellido: string;
    nombreCompleto?: string;
  };
  direccion?: {
    idDireccion: number;
    direccionTxt: string;
    lat?: number;
    lng?: number;
  };
  estado?: string;
  fechaEntregaEstimada?: string | Date;
}

export interface CreateRutaDto {
  nombre: string;
  idEmpleado: number;
  pedidoIds: number[];
  fechaProgramada: string; // ISO 8601
  profile?: 'driving' | 'walking' | 'cycling';
  origenLat?: number;
  origenLng?: number;
  roundTrip?: boolean;
}

export interface UpdateRutaDto {
  nombre?: string;
  idEmpleado?: number;
  pedidoIds?: number[];
  fechaProgramada?: string;
  profile?: 'driving' | 'walking' | 'cycling';
  origenLat?: number;
  origenLng?: number;
  roundTrip?: boolean;
}

export interface GetRutasParams {
  limit?: number;
  offset?: number;
  q?: string;
}

// Interfaces para la respuesta del API de empleados
export interface EmpleadoUser {
  id: string;
  email: string;
  loginAttempts: number;
  blockedUntil: string | null;
  estado: 'activo' | 'inactivo';
  roles: string[];
}

export interface EmpleadoResponse {
  idEmpleado: number;
  primerNombre: string;
  segundoNombre?: string | null;
  primerApellido: string;
  segundoApellido?: string | null;
  sexo: string;
  telefono: string;
  fechaNac: string;
  estado: 'activo' | 'inactivo';
  fechaCreacion: string;
  user?: EmpleadoUser;
}

export interface PaginatedEmpleadoResponse {
  data: EmpleadoResponse[];
  total?: number;
}

// Interfaces para las rutas del conductor (respuesta del API)
export interface RutaPedido {
  idRutaPedido: number;
  idRuta: number;
  idPedido: number;
  secuencia: number;
  distanciaKm?: number | string | null;
  duracionMin?: number | string | null;
  lat: number | string;
  lng: number | string;
  direccionResumen?: string | null;
  estadoEntrega: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface RutaConductor {
  idRuta: number;
  nombre?: string | null;
  idEmpleado?: number | null;
  estado: string;
  fechaProgramada?: string | null;
  distanciaKm?: number | string | null;
  duracionMin?: number | string | null;
  profile: string;
  origenLat: number | string;
  origenLng: number | string;
  geometry?: string | null;
  mapboxRequestId?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  empleado?: {
    idEmpleado: number;
    primerNombre: string;
    segundoNombre?: string | null;
    primerApellido: string;
    segundoApellido?: string | null;
    sexo?: string;
    telefono?: string;
    fechaNac?: string;
    estado?: string;
    fechaCreacion?: string;
  } | null;
  rutaPedidos: RutaPedido[];
}

