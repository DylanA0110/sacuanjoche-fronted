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
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          valid: false,
          error: `Las dimensiones son demasiado grandes. Máximo ${maxWidth}x${maxHeight}px`,
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'No se pudo leer la imagen',
      });
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
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
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
              });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
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
