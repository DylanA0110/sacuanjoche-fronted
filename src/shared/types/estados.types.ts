/**
 * Archivo centralizado con todos los tipos de estados del sistema
 */

/**
 * Estados de un arreglo (articulo_arreglo)
 */
export type ArregloEstado = 'activo' | 'inactivo';

/**
 * Estados de un artículo
 */
export type ArticuloEstado = 'activo' | 'inactivo';

/**
 * Estados de un carrito
 */
export type CarritoEstado = 'activo' | 'cerrado' | 'expirado';

/**
 * Estados de una categoría
 */
export type CategoriaEstado = 'activo' | 'inactivo';

/**
 * Estados de un cliente
 */
export type ClienteEstado = 'activo' | 'inactivo';

/**
 * Estados de un empleado
 */
export type EmpleadoEstado = 'activo' | 'inactivo';

/**
 * Estados de una factura
 */
export type FacturaEstado = 'pendiente' | 'pagado' | 'anulada';

/**
 * Estados de un método de pago
 */
export type MetodoPagoEstado = 'activo' | 'inactivo';

/**
 * Tipos de método de pago
 */
export type MetodoPagoTipo = 'online' | 'efectivo' | 'tarjeta_fisica' | 'mixto';

/**
 * Estados de un pago
 */
export type PagoEstado = 'pendiente' | 'pagado' | 'fallido' | 'reembolsado';

/**
 * Canales de venta de un pedido
 */
export type PedidoCanal = 'web' | 'interno';

/**
 * Estados de un pedido
 */
export type PedidoEstado =
  | 'pendiente'
  | 'procesando'
  | 'en_envio'
  | 'entregado'
  | 'cancelado'
  | 'pagado';

/**
 * Estados de un usuario
 */
export type UserEstado = 'activo' | 'inactivo';
