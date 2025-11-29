export interface FacturaDetalle {
  idFacturaDetalle: number;
  idFactura: number;
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
    estado?: string;
    fechaCreacion?: string | Date;
  };
}

