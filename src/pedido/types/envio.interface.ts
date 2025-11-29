export interface Envio {
  idEnvio: number;
  idPedido: number;
  idEmpleado: number;
  estadoEnvio: string;
  fechaProgramada?: string | Date;
  fechaSalida?: string | Date;
  fechaEntrega?: string | Date;
  costoEnvio: number | string;
  distanciaKm?: number | string;
  observaciones?: string;
  origenLat?: string;
  origenLng?: string;
  destinoLat?: string;
  destinoLng?: string;
  idRuta?: number | null;
}

export interface CreateEnvioDto {
  idPedido: number;
  idEmpleado: number;
  estadoEnvio: string;
  fechaProgramada?: string;
  fechaSalida?: string;
  fechaEntrega?: string;
  costoEnvio: number;
  observaciones?: string;
}

