import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { SearchableSelect } from '@/shared/Custom/SearchableSelect';
import { useFormaArreglo } from '@/catalogo/hooks/useFormaArreglo';
import {
  getUploadUrl,
  createMedia,
  getArregloMedia,
  deleteMedia,
} from '../actions';
import type {
  Arreglo,
  CreateArregloDto,
  UpdateArregloDto,
  Media,
} from '../types/arreglo.interface';
import { MdSave, MdImage, MdClose } from 'react-icons/md';
import { toast } from 'sonner';
import { processImages, formatFileSize } from '@/shared/utils/imageUtils';

interface ArregloFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arreglo?: Arreglo | null;
  onSubmit: (data: CreateArregloDto | UpdateArregloDto) => void;
  isLoading?: boolean;
}

export function ArregloForm({
  open,
  onOpenChange,
  arreglo,
  onSubmit,
  isLoading = false,
}: ArregloFormProps) {
  const [formData, setFormData] = useState<CreateArregloDto>({
    idFormaArreglo: 0,
    nombre: '',
    descripcion: '',
    url: '',
    precioUnitario: 0,
    cantidadFlores: 0,
  });
  const [precioInput, setPrecioInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadedImages, setUploadedImages] = useState<Media[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { formasArreglo } = useFormaArreglo({ activo: true });

  const formaArregloOptions = formasArreglo.map((forma) => ({
    value: String(forma.idFormaArreglo),
    label: forma.descripcion,
  }));

  useEffect(() => {
    if (arreglo) {
      const precio =
        typeof arreglo.precioUnitario === 'string'
          ? parseFloat(arreglo.precioUnitario)
          : arreglo.precioUnitario;
      setFormData({
        idFormaArreglo: arreglo.idFormaArreglo,
        nombre: arreglo.nombre,
        descripcion: arreglo.descripcion,
        url: arreglo.url || '',
        precioUnitario: precio,
        cantidadFlores: arreglo.cantidadFlores,
      });
      setPrecioInput(precio.toString());

      // Cargar imágenes del arreglo
      if (arreglo.idArreglo) {
        getArregloMedia(arreglo.idArreglo)
          .then((media) => {
            setUploadedImages(media);
          })
          .catch((error) => {
            console.error('Error al cargar imágenes:', error);
            setUploadedImages(arreglo.media || []);
          });
      } else {
        setUploadedImages(arreglo.media || []);
      }
    } else {
      setFormData({
        idFormaArreglo: 0,
        nombre: '',
        descripcion: '',
        url: '',
        precioUnitario: 0,
        cantidadFlores: 0,
      });
      setPrecioInput('');
      setUploadedImages([]);
    }
  }, [arreglo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nombre.trim() ||
      !formData.descripcion.trim() ||
      formData.idFormaArreglo === 0 ||
      formData.precioUnitario <= 0
    ) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    const dataToSubmit: CreateArregloDto | UpdateArregloDto = arreglo
      ? formData
      : { ...formData, estado: 'activo' as 'activo' };

    // Si hay imágenes pendientes de subir y es un arreglo nuevo, esperamos a que se cree primero
    // Las imágenes se subirán después de que el arreglo se cree exitosamente
    onSubmit(dataToSubmit);
  };

  const handleChange = (
    field: keyof CreateArregloDto,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!arreglo?.idArreglo) {
      toast.error('Primero debes guardar el arreglo antes de subir imágenes');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setProcessingImages(true);

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
        setProcessingImages(false);
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

      setProcessingImages(false);
      setUploadingImages(true);

      // Subir imágenes procesadas
      for (let i = 0; i < processed.length; i++) {
        const compressed = processed[i];
        const fileId = `${Date.now()}-${i}`;

        try {
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

          // 1. Obtener URL de subida
          const uploadUrlData = await getUploadUrl({
            contentType: 'image/jpeg', // Siempre JPEG después de compresión
            contentLength: compressed.file.size,
            fileName: compressed.file.name.replace(/\.[^/.]+$/, '') + '.jpg', // Cambiar extensión a .jpg
            arregloId: arreglo.idArreglo,
          });

          // Log de la respuesta para debugging
          console.log(
            '📤 Respuesta del endpoint upload-url:',
            JSON.stringify(
              {
                uploadUrl: uploadUrlData.uploadUrl,
                objectKey: uploadUrlData.objectKey,
                publicUrl: uploadUrlData.publicUrl,
              },
              null,
              2
            )
          );

          setUploadProgress((prev) => ({ ...prev, [fileId]: 30 }));

          // 2. Subir archivo a DigitalOcean Spaces
          try {
            const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
              method: 'PUT',
              body: compressed.file,
              headers: {
                'Content-Type': 'image/jpeg',
              },
            });

            if (!uploadResponse.ok) {
              throw new Error(`Error al subir: ${uploadResponse.statusText}`);
            }
          } catch (fetchError: any) {
            // Manejar errores de certificado SSL u otros errores de red
            if (
              fetchError instanceof TypeError &&
              fetchError.message.includes('Failed to fetch')
            ) {
              // El error de certificado SSL es un problema del servidor
              console.error(
                'Error de conexión SSL al subir imagen:',
                fetchError
              );

              // Verificar si es específicamente un error de certificado
              const isSSLError =
                fetchError.message.includes('ERR_CERT') ||
                fetchError.message.includes('certificate') ||
                uploadUrlData.uploadUrl.includes('https://');

              if (isSSLError) {
                throw new Error(
                  `Error de certificado SSL: El servidor de almacenamiento (DigitalOcean Spaces) tiene un problema con su certificado SSL. La imagen se comprimió correctamente (${formatFileSize(
                    compressed.compressedSize
                  )}), pero no se pudo subir. Por favor, contacta al administrador del sistema para verificar la configuración del certificado SSL en DigitalOcean Spaces.`
                );
              }

              throw new Error(
                `Error de conexión: No se pudo conectar con el servidor de almacenamiento. La imagen se comprimió correctamente (${formatFileSize(
                  compressed.compressedSize
                )}). Verifica tu conexión a internet o contacta al administrador.`
              );
            }
            throw fetchError;
          }

          setUploadProgress((prev) => ({ ...prev, [fileId]: 70 }));

          // 3. Registrar la imagen en el backend
          const mediaData = await createMedia(arreglo.idArreglo, {
            url: uploadUrlData.publicUrl || (uploadUrlData as any).url || '',
            objectKey: uploadUrlData.objectKey,
            provider: 'spaces',
            contentType: 'image/jpeg',
            altText: compressed.file.name.replace(/\.[^/.]+$/, ''), // Nombre sin extensión
            isPrimary: uploadedImages.length === 0 && i === 0, // Primera imagen es principal
          });

          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

          setUploadedImages((prev) => [...prev, mediaData]);

          // Limpiar progreso después de un momento
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        } catch (error) {
          console.error(`Error al subir ${compressed.file.name}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : 'Error desconocido';

          // Mostrar un toast más detallado para errores SSL
          if (
            errorMessage.includes('certificado SSL') ||
            errorMessage.includes('SSL')
          ) {
            toast.error(`Error SSL al subir ${compressed.file.name}`, {
              description:
                'La imagen se comprimió correctamente, pero hay un problema con el certificado SSL del servidor. Contacta al administrador.',
              duration: 6000,
            });
          } else {
            toast.error(
              `Error al subir ${compressed.file.name}: ${errorMessage}`,
              { duration: 5000 }
            );
          }

          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }
      }

      toast.success(
        `${processed.length} ${
          processed.length === 1 ? 'imagen subida' : 'imágenes subidas'
        } exitosamente`
      );
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      toast.error(
        `Error al procesar imágenes: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    } finally {
      setUploadingImages(false);
      setProcessingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = async (mediaId?: number) => {
    if (!mediaId || !arreglo?.idArreglo) {
      // Si no tiene ID, es una imagen nueva que aún no se guardó
      setUploadedImages((prev) => prev.slice(0, -1));
      return;
    }

    try {
      await deleteMedia(arreglo.idArreglo, mediaId, false); // No eliminar del storage por defecto
      setUploadedImages((prev) =>
        prev.filter((img) => img.idMedia !== mediaId)
      );
      toast.success('Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {arreglo ? 'Editar Arreglo' : 'Nuevo Arreglo'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {arreglo
              ? 'Modifica la información del arreglo'
              : 'Completa los datos para crear un nuevo arreglo'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="idFormaArreglo"
              className="text-sm font-semibold text-gray-700"
            >
              Forma de Arreglo *
            </Label>
            <SearchableSelect
              options={formaArregloOptions}
              value={
                formData.idFormaArreglo
                  ? String(formData.idFormaArreglo)
                  : undefined
              }
              onChange={(value) =>
                handleChange('idFormaArreglo', parseInt(value, 10))
              }
              placeholder="Selecciona una forma de arreglo"
              searchPlaceholder="Buscar forma de arreglo..."
              emptyText="No se encontraron formas de arreglo"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="nombre"
              className="text-sm font-semibold text-gray-700"
            >
              Nombre *
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ramo de Rosas Rojas"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="descripcion"
              className="text-sm font-semibold text-gray-700"
            >
              Descripción *
            </Label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Hermoso ramo de rosas rojas para ocasiones especiales"
              className="w-full min-h-[100px] px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#50C878]/20 focus:border-[#50C878] transition-all duration-200 resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="precioUnitario"
                className="text-sm font-semibold text-gray-700"
              >
                Precio Unitario *
              </Label>
              <Input
                id="precioUnitario"
                type="text"
                inputMode="decimal"
                value={precioInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setPrecioInput(value);
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      handleChange('precioUnitario', numValue);
                    } else if (value === '') {
                      handleChange('precioUnitario', 0);
                    }
                  }
                }}
                placeholder="25.99"
                className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/20"
                required
              />
              <p className="text-xs text-gray-500">Precio en córdobas (C$)</p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="cantidadFlores"
                className="text-sm font-semibold text-gray-700"
              >
                Cantidad de Flores *
              </Label>
              <Input
                id="cantidadFlores"
                type="number"
                min="0"
                value={formData.cantidadFlores}
                onChange={(e) =>
                  handleChange(
                    'cantidadFlores',
                    parseInt(e.target.value, 10) || 0
                  )
                }
                placeholder="12"
                className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="url"
              className="text-sm font-semibold text-gray-700"
            >
              URL (Opcional)
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com/images/arreglo.jpg"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          {/* Galería de Imágenes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">
                Imágenes del Arreglo
              </Label>
              {uploadedImages.length > 0 && (
                <span className="text-xs text-gray-500">
                  {uploadedImages.length}{' '}
                  {uploadedImages.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages || !arreglo?.idArreglo}
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center gap-3 px-6 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  uploadingImages || processingImages || !arreglo?.idArreglo
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-[#50C878]/40 bg-linear-to-br from-[#50C878]/5 to-[#50C878]/10 hover:from-[#50C878]/10 hover:to-[#50C878]/15 hover:border-[#50C878]'
                }`}
              >
                {processingImages ? (
                  <>
                    <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-gray-700">
                      Procesando y comprimiendo imágenes...
                    </span>
                  </>
                ) : uploadingImages ? (
                  <>
                    <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-gray-700">
                      Subiendo imágenes...
                    </span>
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="w-full max-w-xs">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#50C878] transition-all duration-300"
                            style={{
                              width: `${
                                Object.values(uploadProgress).reduce(
                                  (a, b) => a + b,
                                  0
                                ) / Object.keys(uploadProgress).length
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : !arreglo?.idArreglo ? (
                  <>
                    <MdImage className="h-8 w-8 text-gray-400" />
                    <div className="text-center">
                      <span className="text-sm font-semibold text-gray-500 block">
                        Guarda el arreglo primero
                      </span>
                      <span className="text-xs text-gray-400 block mt-1">
                        Luego podrás subir imágenes
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <MdImage className="h-8 w-8 text-[#50C878]" />
                    <div className="text-center">
                      <span className="text-sm font-semibold text-gray-700 block">
                        Haz clic para subir imágenes
                      </span>
                      <span className="text-xs text-gray-500 block mt-1">
                        JPG, PNG o WEBP • Máx. 5MB • Se comprimirán
                        automáticamente
                      </span>
                    </div>
                  </>
                )}
              </label>

              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div
                      key={image.idMedia || index}
                      className="relative group"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#50C878] transition-all duration-200">
                        <img
                          src={image.url}
                          alt={image.altText || `Imagen ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.idMedia)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                        title="Eliminar imagen"
                      >
                        <MdClose className="h-4 w-4" />
                      </button>
                      {image.isPrimary && (
                        <span className="absolute bottom-2 left-2 bg-[#50C878] text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-md">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploadingImages}
              className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-md shadow-[#50C878]/20 gap-2"
            >
              <MdSave className="h-4 w-4" />
              {isLoading
                ? arreglo
                  ? 'Guardando...'
                  : 'Creando...'
                : arreglo
                ? 'Guardar Cambios'
                : 'Crear Arreglo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
