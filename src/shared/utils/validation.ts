/**
 * Utilidades de validación compartidas
 */

/**
 * Sanitiza y formatea un nombre o apellido
 * - Solo letras (sin espacios, números, caracteres especiales)
 * - Primera letra mayúscula, resto minúsculas
 * - Mínimo 2 caracteres, máximo 30
 */
export const sanitizeName = (value: string, maxLength: number = 30): string => {
  // Remover TODO excepto letras (incluyendo espacios, números, símbolos, etc.)
  // Usar regex más estricto que elimina absolutamente todo lo que no sea letra
  let cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/g, '');

  // Limitar longitud
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  // Primera letra mayúscula, resto minúsculas
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  }

  return cleaned;
};

/**
 * Valida un nombre o apellido
 */
export const validateName = (
  value: string,
  fieldName: string = 'Campo'
): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} es requerido`;
  }

  if (value.length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres`;
  }

  if (value.length > 30) {
    return `${fieldName} debe tener máximo 30 caracteres`;
  }

  if (!/^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]*$/.test(value)) {
    return `${fieldName} solo debe contener letras, sin espacios`;
  }

  return null;
};

/**
 * Valida un email
 */
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim().length === 0) {
    return 'El email es requerido';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'El email no es válido';
  }

  return null;
};

/**
 * Formatea un teléfono (solo números, máximo 8 dígitos)
 * El usuario solo puede escribir 8 dígitos, el 505 se agrega internamente
 */
export const formatTelefono = (value: string): string => {
  // Remover todo excepto números
  const cleaned = value.replace(/\D/g, '');
  // Solo permitir máximo 8 dígitos (sin el 505)
  return cleaned.slice(0, 8);
};

/**
 * Valida un teléfono (debe tener exactamente 8 dígitos)
 */
export const validateTelefono = (telefono: string): string | null => {
  const cleaned = formatTelefono(telefono);
  if (cleaned.length !== 8) {
    return 'El teléfono debe tener 8 dígitos';
  }
  return null;
};

/**
 * Formatea el teléfono para enviar al backend (agrega 505 internamente)
 * El usuario solo escribe 8 dígitos, esta función agrega el 505
 */
export const formatTelefonoForBackend = (telefono: string): string => {
  const cleaned = formatTelefono(telefono);
  // Si tiene 8 dígitos, agregar 505 al inicio (sin el +)
  if (cleaned.length === 8) {
    return `505${cleaned}`;
  }
  // Si ya tiene 505, dejarlo como está (pero sin +)
  if (cleaned.startsWith('505') && cleaned.length === 11) {
    return cleaned;
  }
  // Si tiene menos de 8 dígitos, devolverlo como está (el backend validará)
  return cleaned;
};

/**
 * Extrae solo los 8 dígitos del teléfono para mostrar en el input
 * Si el teléfono viene del backend con 505, lo remueve para mostrar solo los 8 dígitos
 */
export const formatTelefonoForInput = (telefono: string): string => {
  if (!telefono) return '';
  // Remover todo excepto números
  const cleaned = telefono.replace(/\D/g, '');
  // Si empieza con 505 y tiene 11 dígitos, extraer solo los últimos 8
  if (cleaned.startsWith('505') && cleaned.length === 11) {
    return cleaned.slice(3);
  }
  // Si tiene más de 8 dígitos, tomar solo los últimos 8
  if (cleaned.length > 8) {
    return cleaned.slice(-8);
  }
  // Devolver tal cual (ya está en formato correcto)
  return cleaned;
};

/**
 * Valida un precio de arreglo (150 - 15000)
 */
export const validatePrecioArreglo = (precio: number): string | null => {
  if (precio < 150) {
    return 'El precio mínimo de un arreglo es C$150';
  }
  if (precio > 15000) {
    return 'El precio máximo de un arreglo es C$15,000';
  }
  return null;
};

/**
 * Valida un precio de flor (100 - 300)
 */
export const validatePrecioFlor = (precio: number): string | null => {
  if (precio < 100) {
    return 'El precio mínimo de una flor es C$100';
  }
  if (precio > 300) {
    return 'El precio máximo de una flor es C$300';
  }
  return null;
};

/**
 * Valida un precio de accesorio (similar a flor: 100 - 300)
 */
export const validatePrecioAccesorio = (precio: number): string | null => {
  if (precio < 100) {
    return 'El precio mínimo de un accesorio es C$100';
  }
  if (precio > 300) {
    return 'El precio máximo de un accesorio es C$300';
  }
  return null;
};

/**
 * Valida y normaliza una cantidad de producto
 * - Mínimo: 1 (nunca puede ser 0)
 * - Máximo: 100 (cantidad razonable para pedidos)
 */
export const validateAndNormalizeCantidad = (
  cantidad: number
): { cantidad: number; error: string | null } => {
  // Convertir a número entero
  const cantidadNum = Math.floor(Number(cantidad));

  // Validar que sea un número válido
  if (isNaN(cantidadNum) || cantidadNum < 1) {
    return { cantidad: 1, error: 'La cantidad mínima es 1' };
  }

  // Validar máximo (100 es una cantidad razonable para pedidos)
  const MAX_CANTIDAD = 100;
  if (cantidadNum > MAX_CANTIDAD) {
    return {
      cantidad: MAX_CANTIDAD,
      error: `La cantidad máxima es ${MAX_CANTIDAD}`,
    };
  }

  return { cantidad: cantidadNum, error: null };
};

/**
 * Valida una descripción (solo texto, máximo caracteres)
 */
export const validateDescripcion = (
  descripcion: string,
  maxLength: number = 500
): string | null => {
  if (!descripcion || descripcion.trim().length === 0) {
    return 'La descripción es requerida';
  }

  if (descripcion.length > maxLength) {
    return `La descripción debe tener máximo ${maxLength} caracteres`;
  }

  // Solo texto (letras, números, espacios, puntuación básica)
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:!?()-]+$/.test(descripcion)) {
    return 'La descripción solo puede contener texto y caracteres básicos';
  }

  return null;
};

/**
 * Valida una fecha (no puede ser en el pasado para fechas futuras)
 */
export const validateFechaFutura = (fecha: string | Date): string | null => {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const ahora = new Date();
  ahora.setHours(0, 0, 0, 0);

  if (fechaObj < ahora) {
    return 'La fecha no puede ser en el pasado';
  }

  return null;
};

/**
 * Valida la cantidad total de flores en un arreglo
 * - Mínimo: 3 flores
 * - Máximo: 50 flores
 */
export const validateCantidadTotalFlores = (
  flores: Array<{ cantidad: number }>
): string | null => {
  const totalFlores = flores.reduce((sum, f) => sum + f.cantidad, 0);
  
  if (totalFlores < 3) {
    return 'Un arreglo debe tener mínimo 3 flores';
  }
  
  if (totalFlores > 50) {
    return 'Un arreglo puede tener máximo 50 flores';
  }
  
  return null;
};

/**
 * Valida la cantidad total de accesorios en un arreglo
 * - Mínimo: 1 accesorio
 * - Máximo: 15 accesorios
 */
export const validateCantidadTotalAccesorios = (
  accesorios: Array<{ cantidad: number }>
): string | null => {
  const totalAccesorios = accesorios.reduce((sum, a) => sum + a.cantidad, 0);
  
  if (totalAccesorios < 1) {
    return 'Un arreglo debe tener mínimo 1 accesorio';
  }
  
  if (totalAccesorios > 15) {
    return 'Un arreglo puede tener máximo 15 accesorios';
  }
  
  return null;
};

/**
 * Calcula el precio sugerido de un arreglo basado en flores y accesorios
 */
export const calcularPrecioSugeridoArreglo = (
  flores: Array<{ precioUnitario: number; cantidad: number }>,
  accesorios: Array<{ precioUnitario: number; cantidad: number }>
): number => {
  const totalFlores = flores.reduce(
    (sum, f) => sum + f.precioUnitario * f.cantidad,
    0
  );
  const totalAccesorios = accesorios.reduce(
    (sum, a) => sum + a.precioUnitario * a.cantidad,
    0
  );
  return totalFlores + totalAccesorios;
};
