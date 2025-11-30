import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import supabase from '@/shared/utils/supabase';
import { processImages, formatFileSize } from '@/shared/utils/imageUtils';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import {
  createArregloMediaBatch,
  updateArregloMedia,
  deleteArregloMedia,
  getArregloMedia,
} from '../actions/arregloMedia';

// Tipo simplificado para imágenes subidas a Supabase
export interface UploadedImage {
  id: string;
  url: string;
  fileName?: string; // Debe contener el objectKey completo de Supabase
  orden: number;
  isPrimary: boolean;
  altText?: string;
  metadata?: {
    width: number;
    height: number;
  };
  mediaId?: number; // ID del backend si está guardada
}

interface ImagesState {
  images: UploadedImage[];
  uploading: boolean;
  processing: boolean;
  progress: { [key: string]: number };
  dragActive: boolean;
}

interface UseArregloImagesOptions {
  arregloId?: number;
  initialImages?: UploadedImage[];
}

export function useArregloImages({
  arregloId,
  initialImages = [],
}: UseArregloImagesOptions) {
  const [imagesState, setImagesState] = useState<ImagesState>({
    images: initialImages,
    uploading: false,
    processing: false,
    progress: {},
    dragActive: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convertir media del backend a UploadedImage
  const convertMediaToUploadedImage = useCallback(
    (media: any, index: number): UploadedImage => {
      // Asegurar que fileName siempre contenga el objectKey correcto
      let fileName = media.objectKey;
      if (!fileName && media.url) {
        const urlMatch = media.url.match(
          /\/storage\/v1\/object\/public\/CatalogoFloristeria\/(.+)$/
        );
        if (urlMatch) {
          fileName = urlMatch[1];
        }
      }

      return {
        id: media.idArregloMedia
          ? `media-${media.idArregloMedia}`
          : `existing-${index}`,
        url: media.url,
        fileName: fileName || undefined, // Guardar objectKey en fileName
        orden: media.orden || index,
        isPrimary: media.isPrimary || false,
        altText: media.altText,
        metadata:
          media.metadata && media.metadata.width && media.metadata.height
            ? {
                width: media.metadata.width,
                height: media.metadata.height,
              }
            : undefined,
        mediaId: media.idArregloMedia,
      };
    },
    []
  );

  // Cargar imágenes desde el backend
  const loadImages = useCallback(async () => {
    if (!arregloId) return;

    try {
      const mediaList = await getArregloMedia(arregloId);
      const convertedImages = mediaList.map(convertMediaToUploadedImage);
      setImagesState((prev) => ({ ...prev, images: convertedImages }));
    } catch (error) {
      toast.error('Error al cargar las imágenes del arreglo');
    }
  }, [arregloId, convertMediaToUploadedImage]);

  // Procesar y subir imágenes
  const processAndUploadImages = useCallback(
    async (files: File[]) => {
      if (!arregloId) {
        toast.error('Primero debes guardar el arreglo antes de agregar imágenes');
        return;
      }

      setImagesState((prev) => ({ ...prev, processing: true }));

      try {
        // Procesar y comprimir imágenes
        const { processed, errors } = await processImages(Array.from(files), {
          maxSizeMB: 5,
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          maxSizeKB: 500,
        });

        // Mostrar errores si los hay
        if (errors.length > 0) {
          errors.forEach((error) => toast.error(error));
        }

        if (processed.length === 0) {
          setImagesState((prev) => ({ ...prev, processing: false }));
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        // Mostrar información de compresión
        processed.forEach((result) => {
          if (result.compressionRatio > 0) {
            toast.success(
              `${result.file.name}: Comprimido ${formatFileSize(
                result.originalSize
              )} → ${formatFileSize(
                result.compressedSize
              )} (${result.compressionRatio.toFixed(1)}% reducción)`,
              { duration: 3000 }
            );
          }
        });

        setImagesState((prev) => ({
          ...prev,
          processing: false,
          uploading: true,
        }));

        // Subir imágenes procesadas a Supabase Storage
        const newImages: UploadedImage[] = [];

        for (let i = 0; i < processed.length; i++) {
          const compressed = processed[i];
          const fileId = `${Date.now()}-${i}`;

          try {
            setImagesState((prev) => ({
              ...prev,
              progress: { ...prev.progress, [fileId]: 0 },
            }));

            // Generar nombre único para el archivo (objectKey completo)
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 15);
            const fileName = `arreglos/${arregloId}/${timestamp}-${randomId}.jpg`;

            setImagesState((prev) => ({
              ...prev,
              progress: { ...prev.progress, [fileId]: 30 },
            }));

            // Subir imagen a Supabase Storage
            const { error } = await supabase.storage
              .from('CatalogoFloristeria')
              .upload(fileName, compressed.file, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false,
              });

            if (error) {
              throw new Error(`Error al subir imagen: ${error.message}`);
            }

            setImagesState((prev) => ({
              ...prev,
              progress: { ...prev.progress, [fileId]: 70 },
            }));

            // Obtener URL pública de la imagen
            const {
              data: { publicUrl },
            } = supabase.storage
              .from('CatalogoFloristeria')
              .getPublicUrl(fileName);

            // Guardar datos de la imagen (solo localmente, no en backend aún)
            const orden = imagesState.images.length + newImages.length;
            const isPrimary =
              imagesState.images.length === 0 &&
              newImages.length === 0 &&
              i === 0;

            const imageData: UploadedImage = {
              id: `temp-${timestamp}-${i}`,
              url: publicUrl,
              fileName: fileName, // IMPORTANTE: Guardar el objectKey completo
              orden,
              isPrimary,
              metadata: {
                width: compressed.width,
                height: compressed.height,
              },
              altText: compressed.file.name,
            };

            newImages.push(imageData);

            setImagesState((prev) => ({
              ...prev,
              progress: { ...prev.progress, [fileId]: 95 },
              images: [...prev.images, imageData],
            }));

            // Limpiar progreso después de un momento
            setTimeout(() => {
              setImagesState((prev) => {
                const newProgress = { ...prev.progress };
                delete newProgress[fileId];
                return { ...prev, progress: newProgress };
              });
            }, 1000);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Error desconocido';

            // Mostrar un toast más detallado para errores SSL
            const cleanedError = cleanErrorMessage(error);
            
            if (
              errorMessage.includes('certificado SSL') ||
              errorMessage.includes('SSL')
            ) {
              toast.error('Error al agregar imagen', {
                description:
                  'La imagen se comprimió correctamente, pero hay un problema con la conexión segura. Por favor, intenta nuevamente.',
                duration: 6000,
              });
            } else {
              toast.error('Error al agregar imagen', {
                description: cleanedError,
                duration: 5000,
              });
            }

            setImagesState((prev) => {
              const newProgress = { ...prev.progress };
              delete newProgress[fileId];
              return { ...prev, progress: newProgress };
            });
          }
        }

        // Las imágenes se suben a Supabase pero NO se registran automáticamente en el backend
        if (newImages.length > 0) {
          toast.success(
            `${newImages.length} imagen(es) agregada(s) correctamente. Haz clic en "Guardar Imágenes" para finalizar.`,
            { duration: 5000 }
          );
        }
      } catch (error) {
        toast.error('Error al procesar imágenes', {
          description: cleanErrorMessage(error),
          duration: 5000,
        });
      } finally {
        setImagesState((prev) => ({
          ...prev,
          uploading: false,
          processing: false,
        }));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [arregloId, imagesState.images.length]
  );

  // Guardar imágenes en el backend
  const saveImages = useCallback(async () => {
    if (!arregloId) {
      toast.error('Primero debes guardar el arreglo');
      return;
    }

    // Filtrar solo las imágenes que aún no están guardadas en el backend
    const newImages = imagesState.images.filter(
      (img) => !img.id?.match(/^media-(\d+)$/)
    );

    if (newImages.length === 0) {
      toast.info('No hay imágenes nuevas para guardar');
      return;
    }

    setImagesState((prev) => ({ ...prev, uploading: true }));

    try {
      const imagenesToSave = newImages.map((img) => ({
        url: img.url,
        orden: img.orden,
        isPrimary: img.isPrimary || false,
        altText: img.altText || '',
      }));

      // Guardar en el backend
      const savedMedia = await createArregloMediaBatch(arregloId, {
        imagenes: imagenesToSave,
      });

      // Actualizar los IDs de las imágenes guardadas
      let savedIndex = 0;
      setImagesState((prev) => ({
        ...prev,
        images: prev.images.map((img) => {
          if (img.id?.match(/^media-(\d+)$/)) {
            return img; // Ya está guardada
          }
          const saved = savedMedia[savedIndex++];
          return {
            ...img,
            id: saved ? `media-${saved.idArregloMedia}` : img.id,
            mediaId: saved?.idArregloMedia,
          };
        }),
      }));

      toast.success(`${newImages.length} imagen(es) guardada(s) exitosamente`);
    } catch (error: any) {
      toast.error('Error al guardar las imágenes', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    } finally {
      setImagesState((prev) => ({ ...prev, uploading: false }));
    }
  }, [arregloId, imagesState.images]);

  // Marcar imagen como principal
  const setPrimaryImage = useCallback(
    async (imageIndex: number) => {
      if (!arregloId) {
        toast.error('Primero debes guardar el arreglo');
        return;
      }

      const image = imagesState.images[imageIndex];
      if (!image) return;

      // Si ya es principal, no hacer nada
      if (image.isPrimary) {
        toast.info('Esta imagen ya es la principal');
        return;
      }

      try {
        // Actualizar estado local: marcar esta como principal y desmarcar las demás
        setImagesState((prev) => ({
          ...prev,
          images: prev.images.map((img, idx) => ({
            ...img,
            isPrimary: idx === imageIndex,
          })),
        }));

        // Si la imagen tiene un ID del backend (no es temporal), actualizar en el backend
        const mediaIdMatch = image.id?.match(/^media-(\d+)$/);
        if (mediaIdMatch) {
          const mediaId = parseInt(mediaIdMatch[1], 10);
          await updateArregloMedia(arregloId, mediaId, {
            isPrimary: true,
          });

          // También desmarcar las demás imágenes en el backend
          const otherImages = imagesState.images.filter(
            (_, idx) => idx !== imageIndex
          );
          for (const otherImg of otherImages) {
            const otherMediaIdMatch = otherImg.id?.match(/^media-(\d+)$/);
            if (otherMediaIdMatch && otherImg.isPrimary) {
              const otherMediaId = parseInt(otherMediaIdMatch[1], 10);
              await updateArregloMedia(arregloId, otherMediaId, {
                isPrimary: false,
              });
            }
          }

          toast.success('Imagen marcada como principal');
        } else {
          // Si es una imagen temporal (aún no guardada en el backend), solo actualizar estado local
          toast.success(
            'Imagen marcada como principal (se guardará al registrar)'
          );
        }
      } catch (error: unknown) {
        toast.error('Error al establecer imagen principal', {
          description: cleanErrorMessage(error),
          duration: 5000,
        });
        // Revertir cambio local
        setImagesState((prev) => ({
          ...prev,
          images: prev.images.map((img, idx) => ({
            ...img,
            isPrimary: idx === imageIndex ? false : img.isPrimary,
          })),
        }));
      }
    },
    [arregloId, imagesState.images]
  );

  // Eliminar imagen (simplificado y robusto)
  const removeImage = useCallback(
    async (imageIndex: number) => {
      const image = imagesState.images[imageIndex];
      if (!image) return;

      // Confirmar eliminación
      if (
        !window.confirm('¿Estás seguro de que deseas eliminar esta imagen?')
      ) {
        return;
      }

      try {
        const errors: string[] = [];
        let filePathToDelete: string | null = null;

        // ESTRATEGIA MEJORADA: Obtener objectKey del backend ANTES de eliminar
        const mediaIdMatch = image.id?.match(/^media-(\d+)$/);
        if (mediaIdMatch && arregloId) {
          try {
            // Obtener el objectKey del backend antes de eliminar
            const mediaList = await getArregloMedia(arregloId);
            const mediaId = parseInt(mediaIdMatch[1], 10);
            const mediaInfo = mediaList.find(
              (m) => m.idArregloMedia === mediaId
            );

            if (mediaInfo?.objectKey) {
              filePathToDelete = mediaInfo.objectKey;
            }
          } catch (err) {
            // Continuar con otros métodos
          }

          // Eliminar del backend
          try {
            const mediaId = parseInt(mediaIdMatch[1], 10);
            await deleteArregloMedia(arregloId, mediaId);
          } catch (error) {
            errors.push('Error al eliminar del backend');
          }
        }

        // Si no obtuvimos el path del backend, usar fileName (que debe contener el objectKey)
        if (!filePathToDelete) {
          if (image.fileName) {
            // fileName debe contener el objectKey completo
            filePathToDelete = image.fileName;
          } else {
            // Si no hay fileName, es un error crítico
            errors.push(
              'No se pudo determinar la ubicación del archivo. La imagen puede no haberse agregado correctamente.'
            );
            toast.error(
              'No se pudo determinar la ubicación del archivo'
            );
          }
        }

        // Eliminar de Supabase Storage
        if (filePathToDelete) {
          try {
            const { error } = await supabase.storage
              .from('CatalogoFloristeria')
              .remove([filePathToDelete]);

            if (error) {
              const cleanedError = cleanErrorMessage(error);
              errors.push(cleanedError);
            }
          } catch (error: any) {
            const cleanedError = cleanErrorMessage(error);
            errors.push(cleanedError);
          }
        }

        // Eliminar de la lista local
        setImagesState((prev) => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== imageIndex),
        }));

        if (errors.length > 0) {
          toast.warning('Imagen eliminada, pero hubo algunos problemas', {
            description: errors.join(', '),
            duration: 5000,
          });
        } else {
          toast.success('Imagen eliminada exitosamente');
        }
      } catch (error) {
        toast.error('Error al eliminar la imagen', {
          description: cleanErrorMessage(error),
          duration: 5000,
        });
      }
    },
    [arregloId, imagesState.images]
  );

  // Manejar drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setImagesState((prev) => ({ ...prev, dragActive: true }));
    } else if (e.type === 'dragleave') {
      setImagesState((prev) => ({ ...prev, dragActive: false }));
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImagesState((prev) => ({ ...prev, dragActive: false }));

      if (!arregloId) {
        toast.error('Primero debes guardar el arreglo antes de agregar imágenes');
        return;
      }

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        await processAndUploadImages(Array.from(files));
      }
    },
    [arregloId, processAndUploadImages]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      await processAndUploadImages(Array.from(files));
      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [processAndUploadImages]
  );

  // Actualizar imágenes iniciales
  const setImages = useCallback((images: UploadedImage[]) => {
    setImagesState((prev) => ({ ...prev, images }));
  }, []);

  return {
    imagesState,
    fileInputRef,
    processAndUploadImages,
    saveImages,
    setPrimaryImage,
    removeImage,
    handleDrag,
    handleDrop,
    handleFileSelect,
    loadImages,
    setImages,
    convertMediaToUploadedImage,
  };
}
