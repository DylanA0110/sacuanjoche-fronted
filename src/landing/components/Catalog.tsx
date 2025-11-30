import { useState, useEffect, useMemo, useCallback } from 'react';
import { ArregloCard } from './ArregloCard';
import { CatalogPagination } from './CatalogPagination';
import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { ArregloResponse, ArreglosPaginatedResponse } from '@/arreglo/types/arreglo.interface';

export const Catalog = () => {
  const [arreglos, setArreglos] = useState<ArregloResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Calcular items por página según tamaño de pantalla
  const calculateItemsPerPage = useCallback(() => {
    if (typeof window === 'undefined') return 12;
    const width = window.innerWidth;
    if (width < 640) return 4;
    if (width < 1024) return 6;
    if (width < 1280) return 9;
    return 12;
  }, []);

  // Inicializar itemsPerPage y manejar resize
  useEffect(() => {
    setItemsPerPage(calculateItemsPerPage());

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newItemsPerPage = calculateItemsPerPage();
        if (newItemsPerPage !== itemsPerPage) {
          setItemsPerPage(newItemsPerPage);
          setCurrentPage(1);
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [calculateItemsPerPage, itemsPerPage]);

  const offset = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);

  // Fetch de arreglos
  useEffect(() => {
    let cancelled = false;

    const fetchArreglos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await floristeriaApi.get<ArregloResponse[] | ArreglosPaginatedResponse>(
          '/arreglos/public',
          {
            params: {
              limit: itemsPerPage,
              offset: offset,
            },
          }
        );

        if (cancelled) return;

        if (response.data && typeof response.data === 'object' && 'data' in response.data && !Array.isArray(response.data)) {
          const paginatedData = response.data as ArreglosPaginatedResponse;
          setArreglos(paginatedData.data || []);
          setTotalItems(paginatedData.total || 0);
        } else if (Array.isArray(response.data)) {
          setArreglos(response.data);
          setTotalItems(response.data.length);
        } else {
          setArreglos([]);
          setTotalItems(0);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error al cargar arreglos:', err);
        setError('No se pudieron cargar los arreglos. Por favor, intenta más tarde.');
        setArreglos([]);
        setTotalItems(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchArreglos();

    return () => {
      cancelled = true;
    };
  }, [offset, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const catalogSection = document.getElementById('catalogo');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <section
      id="catalogo"
      className="relative bg-linear-to-b from-[#fdf7f9] via-[#ffffff] to-[#f7f9fb] py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden"
    >
      {/* Efectos de fondo - simplificados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-xl bg-[#50C878]/5" />
        <div className="absolute bottom-1/4 right-1/4 w-80 sm:w-[450px] h-80 sm:h-[450px] rounded-full blur-xl bg-[#E91E63]/4" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título */}
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#00A87F] mb-1 sm:mb-2">
            CATÁLOGO
          </p>
          <h2 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171517] mb-1 sm:mb-2 tracking-tight leading-[1.08]">
            NUESTROS ARREGLOS
          </h2>
          <p className="text-[#665b68] text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 font-medium">
            Descubre nuestra colección de arreglos florales únicos, creados con
            pasión y dedicación para cada ocasión especial.
          </p>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-[#665b68] text-lg">{error}</p>
          </div>
        ) : arreglos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#665b68] text-lg">
              No hay arreglos disponibles en este momento.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {arreglos.map((arreglo) => (
                <ArregloCard key={arreglo.idArreglo} arreglo={arreglo} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <CatalogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};
