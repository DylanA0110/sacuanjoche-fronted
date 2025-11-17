export interface ArregloFlor {
  idArregloFlor: number;
  idArreglo: number;
  idFlor: number;
  cantidad: number;
  flor?: {
    idFlor: number;
    nombre: string;
    color?: string;
    precioUnitario: string | number;
    tipo?: string;
    estado: string;
  };
}

export interface AccesorioArreglo {
  idAccesorioArreglo: number;
  idAccesorio: number;
  idArreglo: number;
  cantidad: number;
  accesorio?: {
    idAccesorio: number;
    descripcion: string;
    precioUnitario: string | number;
    estado: string;
    categoria?: string;
  };
}
