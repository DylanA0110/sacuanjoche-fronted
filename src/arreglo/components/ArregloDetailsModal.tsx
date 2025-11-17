import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MdChevronLeft, MdChevronRight, MdImage, MdInfo } from 'react-icons/md';
import { getArregloMedia } from '../actions';
import type { Arreglo, Media } from '../types/arreglo.interface';

interface ArregloDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arreglo: Arreglo | null;
}

export function ArregloDetailsModal({
  open,
  onOpenChange,
  arreglo,
}: ArregloDetailsModalProps) {
  const [images, setImages] = useState<Media[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (open && arreglo?.idArreglo) {
      setLoadingImages(true);
      getArregloMedia(arreglo.idArreglo)
        .then((media: Media[]) => {
          setImages(media);
          setCurrentImageIndex(0);
        })
        .catch((error: any) => {
          console.error('Error al cargar imágenes:', error);
          setImages(arreglo.media || []);
        })
        .finally(() => {
          setLoadingImages(false);
        });
    } else {
      setImages([]);
      setCurrentImageIndex(0);
    }
  }, [open, arreglo]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!arreglo) return null;

  const precio =
    typeof arreglo.precioUnitario === 'string'
      ? parseFloat(arreglo.precioUnitario)
      : arreglo.precioUnitario;

  const currentImage = images[currentImageIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Sección de Imágenes - Carrusel */}
          <div className="lg:w-1/2 bg-gray-50 flex flex-col relative">
            {loadingImages ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <MdImage className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No hay imágenes para este arreglo
                </p>
              </div>
            ) : (
              <>
                {/* Imagen Principal */}
                <div className="flex-1 relative overflow-hidden bg-gray-900">
                  <img
                    src={currentImage?.url}
                    alt={
                      currentImage?.altText || `Imagen ${currentImageIndex + 1}`
                    }
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />

                  {/* Controles del Carrusel */}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                        aria-label="Imagen anterior"
                      >
                        <MdChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10"
                        aria-label="Imagen siguiente"
                      >
                        <MdChevronRight className="h-6 w-6" />
                      </Button>

                      {/* Indicador de posición */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Miniaturas */}
                {images.length > 1 && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {images.map((image, index) => (
                        <button
                          key={image.idMedia || index}
                          onClick={() => goToImage(index)}
                          className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            index === currentImageIndex
                              ? 'border-[#50C878] ring-2 ring-[#50C878]/30'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.altText || `Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sección de Información */}
          <div className="lg:w-1/2 flex flex-col overflow-y-auto">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {arreglo.nombre}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Información detallada del arreglo
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Estado */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MdInfo className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    Estado
                  </span>
                </div>
                <Badge
                  className={
                    arreglo.estado === 'activo'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  }
                >
                  {arreglo.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Forma de Arreglo */}
              {arreglo.formaArreglo && (
                <div>
                  <span className="text-sm font-semibold text-gray-700 block mb-2">
                    Forma de Arreglo
                  </span>
                  <p className="text-gray-900">
                    {arreglo.formaArreglo.descripcion}
                  </p>
                </div>
              )}

              {/* Descripción */}
              <div>
                <span className="text-sm font-semibold text-gray-700 block mb-2">
                  Descripción
                </span>
                <p className="text-gray-900 leading-relaxed">
                  {arreglo.descripcion}
                </p>
              </div>

              {/* Precio y Cantidad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-700 block mb-2">
                    Precio Unitario
                  </span>
                  <p className="text-xl font-bold text-[#50C878]">
                    C${precio.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-700 block mb-2">
                    Cantidad de Flores
                  </span>
                  <p className="text-xl font-bold text-gray-900">
                    {arreglo.cantidadFlores}
                  </p>
                </div>
              </div>

              {/* URL */}
              {arreglo.url && (
                <div>
                  <span className="text-sm font-semibold text-gray-700 block mb-2">
                    URL Externa
                  </span>
                  <a
                    href={arreglo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#50C878] hover:underline break-all"
                  >
                    {arreglo.url}
                  </a>
                </div>
              )}

              {/* Fechas */}
              {arreglo.fechaCreacion && (
                <div>
                  <span className="text-sm font-semibold text-gray-700 block mb-2">
                    Fecha de Creación
                  </span>
                  <p className="text-gray-900">
                    {new Date(arreglo.fechaCreacion).toLocaleDateString(
                      'es-ES',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
              )}

              {/* Estadísticas de Imágenes */}
              <div className="pt-4 border-t border-gray-200">
                <span className="text-sm font-semibold text-gray-700 block mb-2">
                  Galería de Imágenes
                </span>
                <p className="text-gray-600">
                  {images.length} {images.length === 1 ? 'imagen' : 'imágenes'}{' '}
                  disponible{images.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
