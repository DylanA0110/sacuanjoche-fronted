import { useReducer, useEffect, useMemo, useCallback, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MdChevronLeft, MdChevronRight, MdImage } from 'react-icons/md';
import {
  getArregloMedia,
  getArregloFlores,
  getArregloAccesorios,
} from '../actions';
import type { Arreglo, Media } from '../types/arreglo.interface';
import type {
  ArregloFlor,
  AccesorioArreglo,
} from '../types/arreglo-asociaciones.interface';

interface ArregloDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arreglo: Arreglo | null;
}

// Estado del modal usando useReducer en lugar de múltiples useState
interface ModalState {
  images: Media[];
  currentImageIndex: number;
  loadingImages: boolean;
  loadingAssoc: boolean;
  flores: ArregloFlor[];
  accesorios: AccesorioArreglo[];
}

type ModalAction =
  | { type: 'SET_IMAGES'; payload: Media[] }
  | { type: 'SET_CURRENT_IMAGE_INDEX'; payload: number }
  | { type: 'SET_LOADING_IMAGES'; payload: boolean }
  | { type: 'SET_LOADING_ASSOC'; payload: boolean }
  | { type: 'SET_FLORES'; payload: ArregloFlor[] }
  | { type: 'SET_ACCESORIOS'; payload: AccesorioArreglo[] }
  | { type: 'RESET' }
  | { type: 'NEXT_IMAGE' }
  | { type: 'PREV_IMAGE' };

const initialState: ModalState = {
  images: [],
  currentImageIndex: 0,
  loadingImages: false,
  loadingAssoc: false,
  flores: [],
  accesorios: [],
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'SET_IMAGES':
      return { ...state, images: action.payload, currentImageIndex: 0 };
    case 'SET_CURRENT_IMAGE_INDEX':
      return { ...state, currentImageIndex: action.payload };
    case 'SET_LOADING_IMAGES':
      return { ...state, loadingImages: action.payload };
    case 'SET_LOADING_ASSOC':
      return { ...state, loadingAssoc: action.payload };
    case 'SET_FLORES':
      return { ...state, flores: action.payload };
    case 'SET_ACCESORIOS':
      return { ...state, accesorios: action.payload };
    case 'NEXT_IMAGE':
      return {
        ...state,
        currentImageIndex:
          (state.currentImageIndex + 1) % (state.images.length || 1),
      };
    case 'PREV_IMAGE':
      return {
        ...state,
        currentImageIndex:
          (state.currentImageIndex - 1 + state.images.length) %
          state.images.length,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function ArregloDetailsModal({
  open,
  onOpenChange,
  arreglo,
}: ArregloDetailsModalProps) {
  // Usar useReducer en lugar de múltiples useState
  const [state, dispatch] = useReducer(modalReducer, initialState);

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open && arreglo?.idArreglo) {
      dispatch({ type: 'SET_LOADING_IMAGES', payload: true });
      dispatch({ type: 'SET_LOADING_ASSOC', payload: true });
      const id = arreglo.idArreglo;

      // Si el arreglo ya tiene media, usarlo directamente
      if (arreglo.media && arreglo.media.length > 0) {
        dispatch({ type: 'SET_IMAGES', payload: arreglo.media });
        dispatch({ type: 'SET_LOADING_IMAGES', payload: false });
      } else {
        // Fallback: obtener del endpoint si no viene en el arreglo
        getArregloMedia(id)
          .then((media: Media[]) => {
            dispatch({ type: 'SET_IMAGES', payload: media });
          })
          .catch(() => {
            dispatch({ type: 'SET_IMAGES', payload: [] });
          })
          .finally(() =>
            dispatch({ type: 'SET_LOADING_IMAGES', payload: false })
          );
      }

      Promise.all([getArregloFlores(id), getArregloAccesorios(id)])
        .then(([f, a]) => {
          dispatch({ type: 'SET_FLORES', payload: f });
          dispatch({ type: 'SET_ACCESORIOS', payload: a });
        })
        .catch(() => {
          dispatch({ type: 'SET_FLORES', payload: [] });
          dispatch({ type: 'SET_ACCESORIOS', payload: [] });
        })
        .finally(() => dispatch({ type: 'SET_LOADING_ASSOC', payload: false }));
    } else {
      dispatch({ type: 'RESET' });
    }
  }, [open, arreglo]);

  // Handlers memoizados
  const goToImage = useCallback((index: number) => {
    dispatch({ type: 'SET_CURRENT_IMAGE_INDEX', payload: index });
  }, []);

  const nextImage = useCallback(() => {
    dispatch({ type: 'NEXT_IMAGE' });
  }, []);

  const prevImage = useCallback(() => {
    dispatch({ type: 'PREV_IMAGE' });
  }, []);

  // Valores derivados usando useMemo (ANTES del return condicional)
  const precio = useMemo(
    () =>
      arreglo
        ? typeof arreglo.precioUnitario === 'string'
          ? parseFloat(arreglo.precioUnitario)
          : arreglo.precioUnitario
        : 0,
    [arreglo?.precioUnitario]
  );

  const currentImage = useMemo(
    () => state.images[state.currentImageIndex],
    [state.images, state.currentImageIndex]
  );

  // Estado para el aspecto de la imagen actual
  const [imageAspect, setImageAspect] = useState<{
    width: number;
    height: number;
    ratio: number;
  } | null>(null);

  // Detectar el aspecto de la imagen cuando cambia
  useEffect(() => {
    if (currentImage?.url) {
      const img = new Image();
      let isMounted = true;

      img.onload = () => {
        if (isMounted) {
          const ratio = img.width / img.height;
          setImageAspect({
            width: img.width,
            height: img.height,
            ratio,
          });
        }
      };

      img.onerror = () => {
        if (isMounted) {
          setImageAspect(null);
        }
      };

      img.src = currentImage.url;

      return () => {
        isMounted = false;
      };
    } else {
      setImageAspect(null);
    }
  }, [currentImage?.url]);

  const totalFlores = useMemo(
    () => state.flores.reduce((sum, f) => sum + f.cantidad, 0),
    [state.flores]
  );

  const totalAccesorios = useMemo(
    () => state.accesorios.reduce((sum, a) => sum + a.cantidad, 0),
    [state.accesorios]
  );

  // Return condicional DESPUÉS de todos los hooks
  if (!arreglo) return null;

  // Clases CSS para evitar warnings del linter (bg-linear-to-* son las clases correctas de Tailwind)
  const badgeActiveClass =
    'bg-linear-to-r from-[#50C878] to-[#00A87F] text-white border-2 border-[#50C878]/40 rounded-full px-4 py-1.5 text-sm font-medium shadow-sm';
  const florBadgeClass =
    'px-4 py-2 rounded-full text-sm font-medium bg-linear-to-r from-[#50C878]/15 to-[#50C878]/10 text-[#50C878] border-2 border-[#50C878]/30 flex items-center gap-2 shadow-sm';
  const precioCardClass =
    'bg-linear-to-br from-[#50C878]/10 to-[#50C878]/5 rounded-xl p-6 border-2 border-[#50C878]/30 shadow-sm';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200/60 shadow-2xl max-w-[95vw] sm:max-w-6xl max-h-[95vh] overflow-hidden p-0 rounded-xl sm:rounded-2xl">
        <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
          {/* Sección de Imágenes - Carrusel */}
          <div className="w-full lg:w-1/2 bg-[#F9F9F7] flex flex-col relative lg:rounded-l-2xl rounded-t-xl lg:rounded-tr-none min-h-[250px] sm:min-h-[300px] md:min-h-[350px] lg:min-h-0 lg:max-h-full">
            {state.loadingImages ? (
              <div className="flex items-center justify-center h-full min-h-[250px] sm:min-h-[300px] md:min-h-[350px]">
                <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
              </div>
            ) : state.images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[250px] sm:min-h-[300px] md:min-h-[350px] gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <MdImage className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No hay imágenes para este arreglo
                </p>
              </div>
            ) : (
              <>
                {/* Imagen Principal - Responsive según aspecto */}
                <div
                  className={`flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center ${
                    imageAspect
                      ? imageAspect.ratio > 1
                        ? 'h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-full lg:min-h-[400px]'
                        : 'h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-full lg:min-h-[500px]'
                      : 'h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-full lg:min-h-[400px]'
                  }`}
                >
                  <img
                    src={currentImage?.url}
                    alt={
                      currentImage?.altText ||
                      `Imagen ${state.currentImageIndex + 1}`
                    }
                    className={`${
                      imageAspect
                        ? imageAspect.ratio > 1.2
                          ? 'w-full h-auto max-h-full object-contain'
                          : imageAspect.ratio < 0.8
                          ? 'w-auto h-full max-w-full object-contain'
                          : 'w-full h-full object-contain'
                        : 'w-full h-full object-contain'
                    }`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />

                  {/* Controles del Carrusel */}
                  {state.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={prevImage}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-lg border border-gray-200/60 z-10"
                        aria-label="Imagen anterior"
                      >
                        <MdChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={nextImage}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 rounded-full h-10 w-10 sm:h-12 sm:w-12 shadow-lg border border-gray-200/60 z-10"
                        aria-label="Imagen siguiente"
                      >
                        <MdChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>

                      {/* Indicador de posición */}
                      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-lg border border-gray-200/60 z-10">
                        {state.currentImageIndex + 1} / {state.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Miniaturas */}
                {state.images.length > 1 && (
                  <div className="p-2 sm:p-3 md:p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200/60 shrink-0">
                    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {state.images.map((image, index) => (
                        <button
                          key={image.idMedia || index}
                          onClick={() => goToImage(index)}
                          className={`shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                            index === state.currentImageIndex
                              ? 'border-[#50C878] ring-2 ring-[#50C878]/30 shadow-md scale-105'
                              : 'border-gray-200 hover:border-[#50C878]/50 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.altText || `Miniatura ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
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
          <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto lg:rounded-r-2xl rounded-b-xl lg:rounded-bl-none max-h-[50vh] lg:max-h-full">
            <DialogHeader className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6 border-b border-gray-200/60 shrink-0">
              <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-title-large text-gray-900 mb-2 sm:mb-3 leading-tight">
                {arreglo.nombre}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-xs sm:text-sm">
                Detalles del arreglo floral
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-y-auto">
              {/* Precio - DESTACADO */}
              <div className={precioCardClass}>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2 block">
                  Precio Unitario
                </span>
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-title-large text-[#1E5128] leading-none">
                  C${precio.toFixed(2)}
                </p>
              </div>

              {/* Estado */}
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2 block">
                  Estado
                </span>
                <Badge
                  className={
                    arreglo.estado === 'activo'
                      ? badgeActiveClass
                      : 'bg-red-50 text-red-700 border-red-200 rounded-full px-4 py-1.5 text-sm font-medium'
                  }
                >
                  {arreglo.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Forma de Arreglo */}
              {arreglo.formaArreglo && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2 block">
                    Forma de Arreglo
                  </span>
                  <p className="text-gray-900 font-medium text-lg">
                    {arreglo.formaArreglo.descripcion}
                  </p>
                </div>
              )}

              {/* Descripción */}
              {arreglo.descripcion && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-2 block">
                    Descripción
                  </span>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {arreglo.descripcion}
                  </p>
                </div>
              )}

              {/* Flores asociadas */}
              <div className="pt-4 border-t border-gray-200/60">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3 block">
                  Flores Asociadas
                  {state.loadingAssoc && (
                    <span className="ml-2 text-xs text-gray-400 normal-case">
                      (Cargando...)
                    </span>
                  )}
                </span>
                {state.flores.length === 0 && !state.loadingAssoc ? (
                  <p className="text-gray-500 text-sm">
                    No hay flores asociadas
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {state.flores.map((f) => (
                      <div key={f.idArregloFlor} className={florBadgeClass}>
                        <span>{f.flor?.nombre || 'Flor'}</span>
                        <span className="text-[#1E5128] font-semibold">
                          x{f.cantidad}
                        </span>
                        {f.flor?.color && (
                          <span className="text-gray-500 text-xs">
                            • {f.flor.color}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Total flores:{' '}
                  <span className="font-medium text-gray-700">
                    {totalFlores}
                  </span>
                </p>
              </div>

              {/* Accesorios asociados */}
              <div className="pt-4 border-t border-gray-200/60">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3 block">
                  Accesorios Asociados
                  {state.loadingAssoc && (
                    <span className="ml-2 text-xs text-gray-400 normal-case">
                      (Cargando...)
                    </span>
                  )}
                </span>
                {state.accesorios.length === 0 && !state.loadingAssoc ? (
                  <p className="text-gray-500 text-sm">
                    No hay accesorios asociados
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {state.accesorios.map((a) => (
                      <div
                        key={a.idAccesorioArreglo}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-2"
                      >
                        <span>{a.accesorio?.descripcion || 'Accesorio'}</span>
                        <span className="text-amber-700 font-semibold">
                          x{a.cantidad}
                        </span>
                        {a.accesorio?.categoria && (
                          <span className="text-amber-600 text-xs">
                            • {a.accesorio.categoria}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Total accesorios:{' '}
                  <span className="font-medium text-gray-700">
                    {totalAccesorios}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
