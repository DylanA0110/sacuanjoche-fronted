/**
 * Helper para limpiar y formatear mensajes de error para mostrar al usuario
 * Elimina IDs, términos técnicos y hace los mensajes más amigables
 */
export function cleanErrorMessage(error: any): string {
  // Intentar obtener el mensaje de diferentes formas
  let message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    (typeof error === 'string' ? error : null) ||
    'Ocurrió un error inesperado';
  
  // Si el mensaje es un objeto, intentar extraer el mensaje
  if (typeof message === 'object' && message !== null) {
    message = message.message || message.error || 'Ocurrió un error inesperado';
  }

  // NO eliminar IDs de factura o pedido en mensajes de error importantes
  // Solo eliminar IDs genéricos que no aportan información útil
  // Mantener IDs cuando están en contexto útil (ej: "factura asociada (ID: 21)")
  if (!message.includes('factura') && !message.includes('pedido')) {
    message = message.replace(/\b(id|ID|Id):\s*\d+\b/gi, '');
    message = message.replace(/\b\d{3,}\b/g, ''); // Eliminar números largos (probablemente IDs)
    message = message.replace(/\b(id|ID|Id)\s+\d+\b/gi, '');
  }

  // Reemplazar términos técnicos con lenguaje amigable
  const replacements: [RegExp, string][] = [
    [/subir\s+(?:a|en|al)\s+Supabase/gi, 'agregar'],
    [/subir\s+(?:a|en|al)\s+backend/gi, 'guardar'],
    [/subir\s+(?:a|en|al)\s+servidor/gi, 'guardar'],
    [/registrar\s+(?:en|al)\s+backend/gi, 'guardar'],
    [/registrar\s+(?:en|al)\s+servidor/gi, 'guardar'],
    [/backend/gi, 'sistema'],
    [/servidor/gi, 'sistema'],
    [/Supabase/gi, ''],
    [/SSL/gi, 'conexión segura'],
    [/certificado\s+SSL/gi, 'certificado de seguridad'],
    [/Error\s+SSL/gi, 'Error de conexión'],
    [/Error\s+al\s+subir/gi, 'Error al agregar'],
    [/subir\s+imágenes?/gi, 'agregar imágenes'],
    [/subida\(s\)/gi, 'agregada(s)'],
    [/subido\(s\)/gi, 'agregado(s)'],
    [/subiendo/gi, 'agregando'],
    [/Error\s+al\s+procesar/gi, 'Error al procesar'],
    [/Error\s+desconocido/gi, 'Ocurrió un error inesperado'],
    [/Error\s+al\s+eliminar\s+de\s+Supabase/gi, 'Error al eliminar'],
    [/Error\s+al\s+marcar\s+imagen/gi, 'Error al establecer imagen principal'],
  ];

  for (const [pattern, replacement] of replacements) {
    message = message.replace(pattern, replacement);
  }

  // Limpiar espacios múltiples y puntos al final
  message = message.replace(/\s+/g, ' ').trim();
  message = message.replace(/\.{2,}/g, '.');
  message = message.replace(/^\s*[.,;]\s*/g, '');

  // Si el mensaje quedó muy corto o vacío, usar un mensaje genérico
  if (message.length < 5) {
    return 'Ocurrió un error inesperado';
  }

  return message;
}

/**
 * Helper para limpiar nombres de archivos de mensajes de error
 */
export function cleanFileName(fileName: string): string {
  // Extraer solo el nombre del archivo sin la ruta completa
  const name = fileName.split('/').pop() || fileName;
  // Si el nombre es muy largo, truncarlo
  if (name.length > 30) {
    const ext = name.split('.').pop();
    const base = name.substring(0, 20);
    return `${base}...${ext ? '.' + ext : ''}`;
  }
  return name;
}

