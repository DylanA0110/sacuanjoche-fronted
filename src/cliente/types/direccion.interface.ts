// Interfaz para Dirección (compartida con pedidos)
export interface Direccion {
  idDireccion?: number;
  formattedAddress: string;
  country: string;
  stateProv: string | null;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  referencia: string;
  lat: number;
  lng: number;
  provider: string;
  placeId: string;
  accuracy: string;
  geolocation: string;
  activo?: boolean;
  fechaCreacion?: Date | string;
  fechaUltAct?: Date | string;
}

// DTO para crear una dirección (según documentación de la API)
export interface CreateDireccionDto {
  formattedAddress: string;
  country: string;
  stateProv?: string | null;
  city: string;
  neighborhood: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  referencia: string;
  lat: number;
  lng: number;
  provider: string;
  placeId: string;
  accuracy: string;
  geolocation: string;
  activo?: boolean;
}

// Interfaz para Cliente Dirección
export interface ClienteDireccion {
  idClienteDireccion: number;
  idCliente: number;
  idDireccion: number;
  etiqueta: string;
  esPredeterminada: boolean;
  activo: boolean;
  fechaCreacion: Date | string;
  fechaUltAct: Date | string;
  cliente?: {
    idCliente: number;
    primerNombre: string;
    primerApellido: string;
    telefono: string;
    estado: string;
  };
  direccion?: Direccion;
}

// DTO para crear una cliente-dirección
export interface CreateClienteDireccionDto {
  idCliente: number;
  idDireccion: number;
  etiqueta: string;
  esPredeterminada: boolean;
  activo?: boolean;
}

// DTO para actualizar una cliente-dirección
export interface UpdateClienteDireccionDto {
  etiqueta?: string;
  esPredeterminada?: boolean;
  activo?: boolean;
}

// Parámetros para obtener cliente-direcciones
export interface GetClienteDireccionesParams {
  limit?: number;
  offset?: number;
  q?: string;
  idCliente?: number;
}

