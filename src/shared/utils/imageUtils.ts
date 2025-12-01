/**
 * Utilidades para compresión y validación de imágenes
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

/**
 * Valida el tipo de archivo de imagen
 */
export function validateImageType(file: File): ImageValidationResult {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  // Verificar extensión del archivo
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  const hasValidExtension = validExtensions.includes(fileExtension);

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `El formato ${fileExtension
        .toUpperCase()
        .replace('.', '')} no está permitido. Solo se permiten JPG, PNG o WEBP`,
    };
  }

  // Verificar MIME type
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido (${file.type}). Solo se permiten imágenes JPG, PNG o WEBP`,
    };
  }

  return { valid: true };
}

/**
 * Valida el tamaño del archivo (máximo 5MB)
 */
export function validateImageSize(
  file: File,
  maxSizeMB: number = 5
): ImageValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `La imagen es demasiado grande. Máximo ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

/**
 * Valida las dimensiones de la imagen
 */
export function validateImageDimensions(
  file: File,
  maxWidth: number = 4000,
  maxHeight: number = 4000
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    // Verificar que el archivo tenga contenido
    if (file.size === 0) {
      resolve({
        valid: false,
        error: 'El archivo está vacío',
      });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    let resolved = false;

    // Timeout de seguridad (10 segundos)
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          error: 'Tiempo de espera agotado al leer la imagen. Verifica que el archivo sea una imagen válida.',
        });
      }
    }, 10000);

    img.onload = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      URL.revokeObjectURL(url);

      // Verificar que la imagen tenga dimensiones válidas
      if (img.width === 0 || img.height === 0) {
        resolve({
          valid: false,
          error: 'La imagen no tiene dimensiones válidas',
        });
        return;
      }

      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Las dimensiones son demasiado grandes. Máximo ${maxWidth}x${maxHeight}px`,
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = (error) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      URL.revokeObjectURL(url);

      // Verificar el tipo MIME real del archivo
      const reader = new FileReader();
      reader.onloadend = () => {
        const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }

        // Verificar firmas de archivos de imagen
        let isValidImage = false;
        let detectedType = 'desconocido';

        // JPEG: FF D8 FF
        if (header.startsWith('ffd8ff')) {
          isValidImage = true;
          detectedType = 'JPEG';
        }
        // PNG: 89 50 4E 47
        else if (header.startsWith('89504e47')) {
          isValidImage = true;
          detectedType = 'PNG';
        }
        // GIF: 47 49 46 38
        else if (header.startsWith('47494638')) {
          isValidImage = true;
          detectedType = 'GIF';
        }
        // WEBP: RIFF...WEBP
        else if (header.startsWith('52494646')) {
          isValidImage = true;
          detectedType = 'WEBP';
        }

        if (!isValidImage) {
          resolve({
            valid: false,
            error: `El archivo no es una imagen válida. Tipo detectado: ${detectedType}. Asegúrate de que el archivo sea JPG, PNG o WEBP.`,
          });
        } else {
          resolve({
            valid: false,
            error: `No se pudo leer la imagen (${detectedType}). El archivo puede estar corrupto o dañado. Intenta con otra imagen.`,
          });
        }
      };
      reader.onerror = () => {
        resolve({
          valid: false,
          error: 'No se pudo leer el archivo. Verifica que sea una imagen válida.',
        });
      };
      reader.readAsArrayBuffer(file.slice(0, 4));
    };

    img.src = url;
  });
}

/**
 * Comprime una imagen usando Canvas API
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85,
  maxSizeKB: number = 500
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    // Verificar que el archivo tenga contenido
    if (file.size === 0) {
      reject(new Error('El archivo está vacío'));
      return;
    }

    const reader = new FileReader();
    let timeout: NodeJS.Timeout | null = null;

    reader.onload = (e) => {
      const img = new Image();

      // Timeout de seguridad (15 segundos)
      timeout = setTimeout(() => {
        reject(new Error('Tiempo de espera agotado al procesar la imagen'));
      }, 15000);

      img.onload = () => {
        if (timeout) clearTimeout(timeout);

        // Verificar que la imagen tenga dimensiones válidas
        if (img.width === 0 || img.height === 0) {
          reject(new Error('La imagen no tiene dimensiones válidas'));
          return;
        }

        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        // Crear canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }

        // Mejorar la calidad del renderizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir la imagen'));
              return;
            }

            // Si el tamaño comprimido es mayor al máximo, reducir calidad
            if (blob.size > maxSizeKB * 1024) {
              let currentQuality = quality;
              const reduceQuality = () => {
                canvas.toBlob(
                  (reducedBlob) => {
                    if (!reducedBlob) {
                      reject(new Error('Error al comprimir la imagen'));
                      return;
                    }

                    if (
                      reducedBlob.size > maxSizeKB * 1024 &&
                      currentQuality > 0.3
                    ) {
                      currentQuality -= 0.1;
                      reduceQuality();
                    } else {
                      const compressedFile = new File(
                        [reducedBlob],
                        file.name,
                        {
                          type: 'image/jpeg',
                          lastModified: Date.now(),
                        }
                      );

                      resolve({
                        file: compressedFile,
                        originalSize: file.size,
                        compressedSize: reducedBlob.size,
                        compressionRatio:
                          (1 - reducedBlob.size / file.size) * 100,
                        width: Math.round(width),
                        height: Math.round(height),
                      });
                    }
                  },
                  'image/jpeg',
                  currentQuality
                );
              };
              reduceQuality();
            } else {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: (1 - blob.size / file.size) * 100,
                width: Math.round(width),
                height: Math.round(height),
              });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        if (timeout) clearTimeout(timeout);
        reject(new Error('Error al cargar la imagen. Verifica que el archivo sea una imagen válida y no esté corrupto.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      if (timeout) clearTimeout(timeout);
      reject(new Error('Error al leer el archivo. Verifica que el archivo no esté dañado.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Valida y comprime múltiples imágenes
 */
export async function processImages(
  files: File[],
  options: {
    maxSizeMB?: number;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeKB?: number;
  } = {}
): Promise<{
  processed: CompressedImageResult[];
  errors: string[];
}> {
  const processed: CompressedImageResult[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      // Validar tipo
      const typeValidation = validateImageType(file);
      if (!typeValidation.valid) {
        errors.push(`${file.name}: ${typeValidation.error}`);
        continue;
      }

      // Validar tamaño
      const sizeValidation = validateImageSize(file, options.maxSizeMB);
      if (!sizeValidation.valid) {
        errors.push(`${file.name}: ${sizeValidation.error}`);
        continue;
      }

      // Validar dimensiones
      const dimensionValidation = await validateImageDimensions(
        file,
        options.maxWidth,
        options.maxHeight
      );
      if (!dimensionValidation.valid) {
        errors.push(`${file.name}: ${dimensionValidation.error}`);
        continue;
      }

      // Comprimir
      const compressed = await compressImage(
        file,
        options.maxWidth || 1920,
        options.maxHeight || 1920,
        options.quality || 0.85,
        options.maxSizeKB || 500
      );

      processed.push(compressed);
    } catch (error) {
      errors.push(
        `${file.name}: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  }

  return { processed, errors };
}

/**
 * Convierte bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
