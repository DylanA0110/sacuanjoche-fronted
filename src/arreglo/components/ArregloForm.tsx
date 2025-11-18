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
import { SearchableSelect } from '@/shared/components/Custom/SearchableSelect';
import { useFlor } from '@/catalogo/hooks/useFlor';
import { useAccesorio } from '@/catalogo/hooks/useAccesorio';
import type { ArregloAssociationsPayload } from '../types/arreglo-insumos.interface';
import { useFormaArreglo } from '@/catalogo/hooks/useFormaArreglo';
import {
  getUploadUrl,
  createMedia,
  getArregloMedia,
  deleteMedia,
  getArregloFlores,
  getArregloAccesorios,
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
  onSubmit: (
    data: CreateArregloDto | UpdateArregloDto,
    associations: ArregloAssociationsPayload
  ) => void;
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
  const { flores } = useFlor({ estado: 'activo' });
  const { accesorios } = useAccesorio({ estado: 'activo' });

  // Estados para asociaciones
  const [selectedFlorId, setSelectedFlorId] = useState<string | undefined>();
  const [florCantidad, setFlorCantidad] = useState<number>(1);
  const [florList, setFlorList] = useState<
    Array<{ idFlor: number; nombre: string; cantidad: number }>
  >([]);

  const [selectedAccesorioId, setSelectedAccesorioId] = useState<
    string | undefined
  >();
  const [accesorioCantidad, setAccesorioCantidad] = useState<number>(1);
  const [accesorioList, setAccesorioList] = useState<
    Array<{ idAccesorio: number; nombre: string; cantidad: number }>
  >([]);
  // (cantidadFlores eliminada) Si se requiere total de flores, se puede calcular localmente:
  const totalFlores = florList.reduce((sum, f) => sum + f.cantidad, 0);

  const formaArregloOptions = formasArreglo.map((forma) => ({
    value: String(forma.idFormaArreglo),
    label: forma.descripcion,
  }));

  const florOptions = flores.map((flor) => {
    const isSelected = florList.some((f) => f.idFlor === flor.idFlor);
    const selectedItem = florList.find((f) => f.idFlor === flor.idFlor);
    return {
      value: String(flor.idFlor),
      label: flor.nombre,
      subtitle: flor.color ? `Color: ${flor.color}` : undefined,
      isSelected,
      disabled: isSelected, // Deshabilitar si ya está seleccionado
      metadata: {
        color: flor.color,
        cantidad: selectedItem?.cantidad,
      },
    };
  });

  const accesorioOptions = accesorios.map((acc) => {
    const isSelected = accesorioList.some(
      (a) => a.idAccesorio === acc.idAccesorio
    );
    const selectedItem = accesorioList.find(
      (a) => a.idAccesorio === acc.idAccesorio
    );
    return {
      value: String(acc.idAccesorio),
      label: acc.descripcion,
      subtitle: acc.categoria ? `Categoria: ${acc.categoria}` : undefined,
      isSelected,
      disabled: isSelected, // Deshabilitar si ya está seleccionado
      metadata: {
        categoria: acc.categoria,
        cantidad: selectedItem?.cantidad,
      },
    };
  });

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

        // Cargar asociaciones existentes (flores y accesorios)
        Promise.all([
          getArregloFlores(arreglo.idArreglo).catch(() => []),
          getArregloAccesorios(arreglo.idArreglo).catch(() => []),
        ]).then(([floresData, accesoriosData]) => {
          // Cargar flores
          const floresList = floresData.map((item) => ({
            idFlor: item.idFlor,
            nombre: item.flor?.nombre || `Flor ${item.idFlor}`,
            cantidad: item.cantidad,
          }));
          setFlorList(floresList);

          // Cargar accesorios
          const accesoriosList = accesoriosData.map((item) => ({
            idAccesorio: item.idAccesorio,
            nombre:
              item.accesorio?.descripcion || `Accesorio ${item.idAccesorio}`,
            cantidad: item.cantidad && item.cantidad > 0 ? item.cantidad : 1,
          }));
          setAccesorioList(accesoriosList);
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
      });
      setPrecioInput('');
      setUploadedImages([]);
      setFlorList([]);
      setAccesorioList([]);
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

    if (florList.length === 0) {
      toast.error('Agrega al menos una flor al arreglo');
      return;
    }

    const dataToSubmit: CreateArregloDto | UpdateArregloDto = arreglo
      ? formData
      : { ...formData, estado: 'activo' as 'activo' };

    // Preparar asociaciones
    const associations: ArregloAssociationsPayload = {
      accesorios: accesorioList.map(({ idAccesorio, cantidad }) => ({
        idAccesorio,
        cantidad: cantidad && cantidad > 0 ? cantidad : 1,
      })),
      flores: florList.map(({ idFlor, cantidad }) => ({
        idFlor,
        cantidad: cantidad && cantidad > 0 ? cantidad : 1,
      })),
    };

    // Enviar datos
    onSubmit(dataToSubmit, associations);
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

          // Valores que se usarán tanto para generar la URL como para el PUT
          const contentType = 'image/jpeg'; // Siempre JPEG después de compresión
          const contentLength = compressed.file.size; // Tamaño del archivo comprimido
          const fileName =
            compressed.file.name.replace(/\.[^/.]+$/, '') + '.jpg'; // Cambiar extensión a .jpg

          // 1. Obtener URL de subida con los valores exactos que se usarán en el PUT
          const uploadUrlData = await getUploadUrl({
            contentType,
            contentLength,
            fileName,
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

          // 2. Corregir URL de upload si tiene dominio duplicado (bug del backend)
          let correctedUploadUrl = uploadUrlData.uploadUrl;
          // Detectar y corregir dominio duplicado: images-prueba.images-prueba.sfo3 -> images-prueba.sfo3
          // Ejemplo: https://images-prueba.images-prueba.sfo3.digitaloceanspaces.com -> https://images-prueba.sfo3.digitaloceanspaces.com
          if (correctedUploadUrl.includes('.images-prueba.images-prueba.')) {
            correctedUploadUrl = correctedUploadUrl.replace(
              /\.images-prueba\.images-prueba\./g,
              '.images-prueba.'
            );
            console.warn(
              '⚠️ URL de upload corregida (dominio duplicado detectado):',
              correctedUploadUrl
            );
          } else if (correctedUploadUrl.match(/([^.]+)\.\1\./)) {
            // Patrón genérico para cualquier bucket duplicado
            correctedUploadUrl = correctedUploadUrl.replace(
              /(https:\/\/)([^.]+)\.\2\.([^/]+)/,
              '$1$2.$3'
            );
            console.warn(
              '⚠️ URL de upload corregida (dominio duplicado genérico detectado):',
              correctedUploadUrl
            );
          }

          // 3. Subir archivo a DigitalOcean Spaces
          // IMPORTANTE SOBRE CORS Y PREFLIGHT:
          // - La URL firmada solo incluye 'content-length' y 'host' en los signed headers
          // - NO enviamos headers manualmente para evitar preflight requests
          // - Convertimos File a Blob sin tipo MIME para evitar que el navegador agregue Content-Type
          // - Si el error de CORS persiste, se requiere:
          //   1. Configurar CORS en DigitalOcean Spaces (Settings → CORS Configurations)
          //   2. El BACKEND debe usar unsignPayload: true al generar la URL firmada
          //
          // SOLUCIÓN EN EL BACKEND (spaces.service.ts):
          // const uploadUrl = await getSignedUrl(this.client!, command, {
          //   expiresIn,
          //   unsignPayload: true, // Permite variaciones en headers, evita problemas de CORS
          // });
          try {
            // Convertir File a Blob sin tipo MIME para evitar que el navegador agregue Content-Type
            // Esto puede ayudar a evitar el preflight request, pero CORS aún debe estar configurado
            const blob = new Blob([compressed.file], { type: '' }); // Blob sin tipo MIME

            const uploadResponse = await fetch(correctedUploadUrl, {
              method: 'PUT',
              // NO incluir headers - el navegador maneja Content-Length automáticamente
              // Usamos Blob sin tipo para evitar que el navegador agregue Content-Type
              body: blob, // Blob sin tipo MIME en lugar de File
            });

            if (!uploadResponse.ok) {
              throw new Error(`Error al subir: ${uploadResponse.statusText}`);
            }
          } catch (fetchError: any) {
            // Manejar errores de CORS, SSL u otros errores de red
            console.error('Error al subir imagen:', fetchError);

            // El error de CORS generalmente aparece como "Failed to fetch" en el catch,
            // pero el mensaje real está en la consola del navegador
            // Detectar error de CORS de múltiples formas
            const errorMessage = fetchError?.message || '';
            const errorString = String(fetchError || '');

            const isCORSError =
              errorMessage.includes('CORS') ||
              errorMessage.includes('Access-Control-Allow-Origin') ||
              errorMessage.includes('blocked') ||
              errorString.includes('CORS') ||
              errorString.includes('Access-Control-Allow-Origin') ||
              errorString.includes('blocked') ||
              (fetchError instanceof TypeError &&
                errorMessage.includes('Failed to fetch') &&
                // Si es un error de red sin más detalles, probablemente es CORS
                !errorMessage.includes('ERR_CERT') &&
                !errorMessage.includes('certificate'));

            if (
              isCORSError ||
              (fetchError instanceof TypeError &&
                errorMessage.includes('Failed to fetch'))
            ) {
              // Priorizar mensaje de CORS si está claro, sino asumir que es CORS
              // (ya que es el error más común con pre-signed URLs)
              const spaceName = correctedUploadUrl.split('/')[2].split('.')[0];
              throw new Error(
                `Error de CORS: El preflight (OPTIONS) está fallando. La imagen se comprimió correctamente (${formatFileSize(
                  compressed.compressedSize
                )}), pero no se pudo subir.\n\n` +
                  `⚠️ SOLUCIÓN REQUERIDA EN EL BACKEND:\n` +
                  `El backend debe usar \`unsignPayload: true\` al generar la URL firmada.\n\n` +
                  `En spaces.service.ts (o donde generes las URLs):\n` +
                  `\`\`\`typescript\n` +
                  `const uploadUrl = await getSignedUrl(this.client!, command, {\n` +
                  `  expiresIn,\n` +
                  `  unsignPayload: true, // ← AGREGAR ESTO\n` +
                  `});\n` +
                  `\`\`\`\n\n` +
                  `✅ VERIFICAR CORS EN DIGITALOCEAN SPACES:\n` +
                  `1. Space: ${spaceName}\n` +
                  `2. Settings → CORS Configurations\n` +
                  `3. Debe incluir:\n` +
                  `   - Origin: ${window.location.origin} (o * para desarrollo)\n` +
                  `   - Allowed Methods: GET, PUT, OPTIONS (OPTIONS es crucial)\n` +
                  `   - Allowed Headers: *\n` +
                  `   - Max Age: 3000\n\n` +
                  `📄 Ver archivo CORS_FIX_BACKEND.md para más detalles.`
              );
            }

            // Verificar si es específicamente un error de certificado SSL
            const isSSLError =
              errorMessage.includes('ERR_CERT') ||
              errorMessage.includes('ERR_CERT_COMMON_NAME_INVALID') ||
              errorMessage.includes('certificate') ||
              errorString.includes('ERR_CERT') ||
              errorString.includes('certificate');

            if (isSSLError) {
              throw new Error(
                `Error de certificado SSL: El servidor de almacenamiento (DigitalOcean Spaces) tiene un problema con su certificado SSL. La imagen se comprimió correctamente (${formatFileSize(
                  compressed.compressedSize
                )}), pero no se pudo subir. Por favor, contacta al administrador del sistema para verificar la configuración del certificado SSL en DigitalOcean Spaces.`
              );
            }

            // Error genérico de conexión
            throw new Error(
              `Error de conexión: No se pudo conectar con el servidor de almacenamiento. La imagen se comprimió correctamente (${formatFileSize(
                compressed.compressedSize
              )}). Verifica tu conexión a internet o contacta al administrador.\n\n` +
                `Detalles: ${errorMessage || String(fetchError)}`
            );
          }

          setUploadProgress((prev) => ({ ...prev, [fileId]: 70 }));

          // 4. Registrar la imagen en el backend
          const mediaData = await createMedia(arreglo.idArreglo, {
            url: uploadUrlData.publicUrl || (uploadUrlData as any).url || '',
            objectKey: uploadUrlData.objectKey,
            provider: 'spaces',
            contentType: 'image/jpeg',
            altText: compressed.file.name.replace(/\.[^/.]+$/, ''), // Nombre sin extensión
            orden: uploadedImages.length + i, // Orden basado en el índice
            isPrimary: uploadedImages.length === 0 && i === 0, // Primera imagen es principal
            metadata: {
              width: compressed.width,
              height: compressed.height,
            },
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

  const handleAddFlor = () => {
    if (!selectedFlorId) return;
    const idFlor = parseInt(selectedFlorId, 10);
    if (!idFlor || florCantidad <= 0) return;
    const flor = flores.find((f) => f.idFlor === idFlor);
    if (!flor) return;

    setFlorList((prev) => {
      const existing = prev.find((i) => i.idFlor === idFlor);
      if (existing) {
        return prev.map((i) =>
          i.idFlor === idFlor
            ? { ...i, cantidad: i.cantidad + florCantidad }
            : i
        );
      }
      return [...prev, { idFlor, nombre: flor.nombre, cantidad: florCantidad }];
    });
    setSelectedFlorId(undefined);
    setFlorCantidad(1);
  };

  const handleRemoveFlor = (idFlor: number) => {
    setFlorList((prev) => prev.filter((i) => i.idFlor !== idFlor));
  };

  const handleAddAccesorio = () => {
    if (!selectedAccesorioId) return;
    const idAccesorio = parseInt(selectedAccesorioId, 10);
    const cantidad = accesorioCantidad > 0 ? accesorioCantidad : 1;
    if (!idAccesorio || cantidad <= 0) return;
    const acc = accesorios.find((a) => a.idAccesorio === idAccesorio);
    if (!acc) return;

    setAccesorioList((prev) => {
      const existing = prev.find((i) => i.idAccesorio === idAccesorio);
      if (existing) {
        return prev.map((i) =>
          i.idAccesorio === idAccesorio
            ? { ...i, cantidad: (i.cantidad || 1) + cantidad }
            : i
        );
      }
      return [...prev, { idAccesorio, nombre: acc.descripcion, cantidad }];
    });
    setSelectedAccesorioId(undefined);
    setAccesorioCantidad(1);
  };

  const handleRemoveAccesorio = (idAccesorio: number) => {
    setAccesorioList((prev) =>
      prev.filter((i) => i.idAccesorio !== idAccesorio)
    );
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

          <div className="grid grid-cols-1 gap-4">
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
          </div>
          {/* Indicador visual del total de flores (no se envía al backend) */}
          {florList.length > 0 && (
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Total de Flores seleccionadas
              </Label>
              <div className="px-3 py-2 rounded-lg border-2 border-[#50C878]/30 bg-[#50C878]/5 text-sm font-semibold text-[#16804a]">
                {totalFlores} flor{totalFlores === 1 ? '' : 'es'}
              </div>
            </div>
          )}

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

          {/* Flores del Arreglo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Flores del Arreglo
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <SearchableSelect
                  options={florOptions.map(
                    ({ isSelected, disabled, metadata, ...opt }) => ({
                      ...opt,
                      disabled,
                    })
                  )}
                  value={selectedFlorId}
                  onChange={setSelectedFlorId}
                  placeholder="Selecciona una flor"
                  searchPlaceholder="Buscar flor..."
                  emptyText="No se encontraron flores"
                  className={
                    selectedFlorId &&
                    florList.some((f) => String(f.idFlor) === selectedFlorId)
                      ? 'border-[#50C878] bg-[#50C878]/10 ring-2 ring-[#50C878]/20'
                      : selectedFlorId
                      ? 'border-[#50C878] bg-[#50C878]/5'
                      : ''
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  min={1}
                  value={florCantidad}
                  onChange={(e) =>
                    setFlorCantidad(
                      Math.max(1, parseInt(e.target.value || '1', 10))
                    )
                  }
                  placeholder="Cant."
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={handleAddFlor}
                  className="w-full"
                >
                  Agregar
                </Button>
              </div>
            </div>
            {florList.length > 0 && (
              <div className="mt-2 border-2 border-[#50C878]/30 rounded-lg divide-y divide-[#50C878]/10 bg-linear-to-br from-[#50C878]/10 to-[#50C878]/5 shadow-sm">
                {florList.map((f) => {
                  const florInfo = flores.find((fl) => fl.idFlor === f.idFlor);
                  const isSelected = selectedFlorId === String(f.idFlor);
                  return (
                    <div
                      key={f.idFlor}
                      className={`flex items-center justify-between px-4 py-3 transition-all ${
                        isSelected
                          ? 'bg-[#50C878]/20 border-l-4 border-[#50C878]'
                          : 'hover:bg-[#50C878]/15'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {florInfo?.color ? (
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-md ring-2 ring-[#50C878]/30"
                            style={{ backgroundColor: florInfo.color }}
                            title={florInfo.color}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-200 shadow-sm" />
                        )}
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-gray-900">
                            {f.nombre}
                          </span>
                          <span className="text-xs text-gray-600">
                            Cantidad:{' '}
                            <span className="font-semibold text-[#50C878]">
                              {f.cantidad}
                            </span>
                            {florInfo?.color && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/60 text-gray-700 text-[10px]">
                                {florInfo.color}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveFlor(f.idFlor)}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all shrink-0"
                      >
                        Quitar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accesorios del Arreglo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Accesorios del Arreglo
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <SearchableSelect
                  options={accesorioOptions.map(
                    ({ isSelected, disabled, metadata, ...opt }) => ({
                      ...opt,
                      disabled,
                    })
                  )}
                  value={selectedAccesorioId}
                  onChange={setSelectedAccesorioId}
                  placeholder="Selecciona un accesorio"
                  searchPlaceholder="Buscar accesorio..."
                  emptyText="No se encontraron accesorios"
                  className={
                    selectedAccesorioId &&
                    accesorioList.some(
                      (a) => String(a.idAccesorio) === selectedAccesorioId
                    )
                      ? 'border-[#50C878] bg-[#50C878]/10 ring-2 ring-[#50C878]/20'
                      : selectedAccesorioId
                      ? 'border-[#50C878] bg-[#50C878]/5'
                      : ''
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  min={1}
                  value={accesorioCantidad}
                  onChange={(e) =>
                    setAccesorioCantidad(
                      Math.max(1, parseInt(e.target.value || '1', 10))
                    )
                  }
                  placeholder="Cant."
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={handleAddAccesorio}
                  className="w-full"
                >
                  Agregar
                </Button>
              </div>
            </div>
            {accesorioList.length > 0 && (
              <div className="mt-2 border-2 border-[#50C878]/30 rounded-lg divide-y divide-[#50C878]/10 bg-linear-to-br from-[#50C878]/10 to-[#50C878]/5 shadow-sm">
                {accesorioList.map((a) => {
                  const accInfo = accesorios.find(
                    (acc) => acc.idAccesorio === a.idAccesorio
                  );
                  const isSelected =
                    selectedAccesorioId === String(a.idAccesorio);
                  return (
                    <div
                      key={a.idAccesorio}
                      className={`flex items-center justify-between px-4 py-3 transition-all ${
                        isSelected
                          ? 'bg-[#50C878]/20 border-l-4 border-[#50C878]'
                          : 'hover:bg-[#50C878]/15'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-[#50C878] border-2 border-white shadow-md ring-2 ring-[#50C878]/30" />
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-gray-900">
                            {a.nombre}
                          </span>
                          <span className="text-xs text-gray-600">
                            Cantidad:{' '}
                            <span className="font-semibold text-[#50C878]">
                              {a.cantidad}
                            </span>
                            {accInfo?.categoria && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/60 text-gray-700 text-[10px]">
                                {accInfo.categoria}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveAccesorio(a.idAccesorio)}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all shrink-0"
                      >
                        Quitar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
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
