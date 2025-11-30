// Interfaces para envíos del conductor (respuesta del API /envio)
export interface EnvioConductor {
  idEnvio: number;
  idPedido: number;
  idEmpleado: number;
  estadoEnvio: string;
  fechaProgramada?: string | null;
  fechaSalida?: string | null;
  fechaEntrega?: string | null;
  origenLat?: string | number | null;
  origenLng?: string | number | null;
  destinoLat?: string | number | null;
  destinoLng?: string | number | null;
  costoEnvio?: string | number | null;
  distanciaKm?: string | number | null;
  observaciones?: string | null;
  idRuta?: number | null;
  pedido?: {
    idPedido: number;
    idEmpleado: number;
    idCliente: number;
    idDireccion: number;
    idContactoEntrega: number;
    totalProductos: string | number;
    fechaCreacion: string;
    fechaActualizacion: string;
    fechaEntregaEstimada: string;
    direccionTxt: string;
    totalPedido: string | number;
    estado: string;
    idPago?: number | null;
    canal?: string;
    numeroPedido?: string | null;
    idFolio?: number | null;
  } | null;
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
  ruta?: {
    idRuta: number;
    nombre: string;
    idEmpleado: number;
    estado: string;
    fechaProgramada?: string | null;
    distanciaKm?: string | number | null;
    duracionMin?: string | number | null;
    geometry?: string | null;
    mapboxRequestId?: string | null;
    profile?: string;
    origenLat?: string | number;
    origenLng?: string | number;
    fechaCreacion: string;
    fechaActualizacion: string;
  } | null;
}

export interface GetEnviosParams {
  limit?: number;
  offset?: number;
  q?: string;
}










