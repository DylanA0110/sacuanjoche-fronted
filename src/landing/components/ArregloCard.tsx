import { useState, useMemo } from 'react';
import { HiShoppingBag, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { ArregloResponse } from '@/arreglo/types/arreglo.interface';

interface ArregloCardProps {
  arreglo: ArregloResponse;
  index?: number;
}

export const ArregloCard = ({ arreglo }: ArregloCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Obtener todas las imágenes disponibles
  const images = useMemo(() => {
    if (!arreglo.media || arreglo.media.length === 0) {
      return arreglo.url ? [arreglo.url] : [];
    }
    return arreglo.media
      .filter((m) => m.activo !== false && m.url)
      .sort((a, b) => {
        // Primero las imágenes principales
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.orden - b.orden;
      })
      .map((m) => m.url);
  }, [arreglo.media, arreglo.url]);

  const currentImage = images[currentImageIndex] || '';

  // Formatear precio
  const precio = useMemo(() => {
    const precioNum = parseFloat(
      typeof arreglo.precioUnitario === 'string'
        ? arreglo.precioUnitario
        : String(arreglo.precioUnitario)
    );
    return new Intl.NumberFormat('es-NI', {
      style: 'currency',
      currency: 'NIO',
      minimumFractionDigits: 2,
    }).format(precioNum);
  }, [arreglo.precioUnitario]);

  const hasMultipleImages = images.length > 1;

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group relative w-full bg-white rounded-[15px] shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden hover:-translate-y-[5px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)]">
      {/* Badge */}
      {arreglo.estado === 'activo' && (
        <div className="absolute top-[10px] right-[10px] z-20 bg-linear-to-r from-[#A90329] via-[#C44848] to-[#AA2238] text-white px-[10px] py-[5px] text-[11px] font-semibold tracking-wider uppercase rounded-[10px] shadow-[0_3px_10px_rgba(0,0,0,0.2)]">
          Disponible
        </div>
      )}

      {/* Carrusel de imágenes */}
      <div className="relative overflow-hidden">
        <div className="h-[200px] sm:h-[220px] md:h-[240px] lg:h-[260px] overflow-hidden bg-linear-to-br from-[#F4F4F5] to-[#E4E4E7] flex items-center justify-center">
          {currentImage ? (
            <>
              <img
                src={currentImage}
                alt={arreglo.nombre || 'Arreglo floral'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Controles del carrusel */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    aria-label="Imagen anterior"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    aria-label="Imagen siguiente"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                  {/* Indicadores */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'w-6 bg-white'
                            : 'w-1.5 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-[#71717A] text-sm font-medium">Sin imagen</div>
          )}
        </div>
      </div>

      {/* Información */}
      <div className="p-4 sm:p-5">
        {/* Categoría */}
        <div className="text-[11px] font-semibold tracking-wider uppercase text-[#71717A] mb-[5px]">
          {arreglo.formaArreglo?.descripcion || 'Arreglo Floral'}
        </div>

        {/* Título */}
        <h3 className="text-base sm:text-lg font-bold text-[#18181B] mb-[10px] tracking-[-0.5px] line-clamp-2 min-h-[2.5rem]">
          {arreglo.nombre}
        </h3>

        {/* Descripción */}
        <p className="text-[13px] text-[#52525B] leading-[1.4] mb-3 line-clamp-2">
          {arreglo.descripcion}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-[6px] mb-4">
          {arreglo.formaArreglo && (
            <span className="text-[10px] bg-[#F4F4F5] text-[#71717A] px-2 py-[3px] rounded-[10px] font-medium">
              {arreglo.formaArreglo.descripcion}
            </span>
          )}
          <span className="text-[10px] bg-[#F4F4F5] text-[#71717A] px-2 py-[3px] rounded-[10px] font-medium">
            Fresco
          </span>
        </div>

        {/* Precio y Botón */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="flex flex-col">
            <span className="text-lg sm:text-[20px] font-bold text-[#18181B]">
              {precio}
            </span>
          </div>
          <button className="relative w-full sm:w-auto bg-linear-to-r from-[#18181B] to-[#27272A] text-white border-none rounded-[10px] px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-[6px] transition-all duration-300 shadow-[0_3px_10px_rgba(0,0,0,0.1)] hover:bg-linear-to-r hover:from-[#27272A] hover:to-[#3F3F46] hover:-translate-y-[2px] hover:shadow-[0_5px_15px_rgba(0,0,0,0.15)] group/btn overflow-hidden">
            <span className="relative z-10">Añadir al carrito</span>
            <HiShoppingBag className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:rotate-[-10deg] group-hover/btn:scale-110" />
          </button>
        </div>

        {/* Meta información */}
        <div className="flex justify-between items-center border-t border-[#F4F4F5] pt-3">
          <div className="flex items-center gap-[2px]">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="#FFD700"
                stroke="#FFD700"
                strokeWidth="0.5"
                className="shrink-0"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ))}
          </div>
          <div className="text-[11px] font-semibold text-[#22C55E]">En Stock</div>
        </div>
      </div>
    </div>
  );
};
