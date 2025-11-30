/**
 * Colores predefinidos para flores
 */
export const COLORES_FLORES = [
  'Rojo',
  'Rosa',
  'Blanco',
  'Amarillo',
  'Naranja',
  'Morado',
  'Azul',
  'Verde',
  'Coral',
  'Melocotón',
  'Lavanda',
  'Fucsia',
  'Bicolor',
  'Multicolor',
] as const;

export type ColorFlor = typeof COLORES_FLORES[number];

/**
 * Categorías predefinidas para accesorios
 */
export const CATEGORIAS_ACCESORIOS = [
  'Cinta',
  'Papel',
  'Vaso',
  'Base',
  'Decoración',
  'Tarjeta',
  'Ribbon',
  'Lazo',
  'Otro',
] as const;

export type CategoriaAccesorio = typeof CATEGORIAS_ACCESORIOS[number];





