export interface CreateAccesorioArregloDto {
  idAccesorio: number;
  idArreglo: number;
  cantidad: number;
}

export interface CreateArregloFlorDto {
  idArreglo: number;
  idFlor: number;
  cantidad: number;
}

export interface ArregloAssociationsPayload {
  accesorios: Array<{ idAccesorio: number; cantidad: number }>;
  flores: Array<{ idFlor: number; cantidad: number }>;
}
