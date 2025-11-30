import { useCallback, useEffect } from 'react';
import { ArregloCard } from '../components/ArregloCard';
import { CatalogPagination } from '../components/CatalogPagination';
import { CatalogFilters } from '../components/CatalogFilters';
import { Header } from '../components/Header';
import { useQueryParameters } from '../hooks/useQueryParameters';
import { usePaginatedArreglos } from '../hooks/usePaginatedArreglos';

const CatalogPage = () => {
  const {
    page,
    limit,
    q,
    orden,
    ordenarPor,
    flores,
    precioMin,
    precioMax,
    idFormaArreglo,
    setSearchParams,
  } = useQueryParameters();

  const { data: arreglosResponse, isLoading, isError } = usePaginatedArreglos({
    page: +page,
    limit: +limit,
    q: q || undefined,
    orden: orden || undefined,
    ordenarPor: ordenarPor || undefined,
    flores: flores || undefined,
    precioMin: precioMin || undefined,
    precioMax: precioMax || undefined,
    idFormaArreglo: idFormaArreglo || undefined,
  });

  const arreglos = arreglosResponse?.arreglos || [];
  const totalItems = arreglosResponse?.total || 0;
  const totalPages = arreglosResponse?.pages || Math.ceil(totalItems / (+limit || 12));

  // Debug: Log para ver qué está pasando
  useEffect(() => {
    console.log('🔍 [CatalogPage] Estado actual:', {
      isLoading,
      isError,
      arreglosCount: arreglos.length,
      totalItems,
      totalPages,
      arreglosResponse,
      arreglos: arreglos.slice(0, 3), // Primeros 3 para no saturar la consola
    });
  }, [isLoading, isError, arreglos.length, totalItems, totalPages, arreglosResponse]);

  // Calcular items por página según tamaño de pantalla
  const calculateItemsPerPage = useCallback(() => {
    if (typeof window === 'undefined') return 12;
    const width = window.innerWidth;
    if (width < 640) return 4;
    if (width < 1024) return 6;
    if (width < 1280) return 9;
    return 12;
  }, []);

  // Sincronizar limit con el tamaño de pantalla
  useEffect(() => {
    const newLimit = calculateItemsPerPage();
    const currentLimit = parseInt(limit, 10);

    if (newLimit !== currentLimit) {
      setSearchParams((prev) => {
        prev.set('limit', String(newLimit));
        if (parseInt(prev.get('page') || '1', 10) > 1) {
          prev.set('page', '1');
        }
        return prev;
      });
    }

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const updatedLimit = calculateItemsPerPage();
        if (updatedLimit !== parseInt(limit, 10)) {
          setSearchParams((prev) => {
            prev.set('limit', String(updatedLimit));
            if (parseInt(prev.get('page') || '1', 10) > 1) {
              prev.set('page', '1');
            }
            return prev;
          });
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateItemsPerPage, limit, setSearchParams]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        prev.set('page', String(newPage));
        return prev;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams]
  );

  const handleFilterChange = useCallback(
    (filters: {
      q: string;
      orden: string;
      ordenarPor: string;
      flores: string;
      precioMin: string;
      precioMax: string;
      idFormaArreglo: string;
    }) => {
      setSearchParams((prev) => {
        // Reset a página 1 cuando cambian los filtros
        prev.set('page', '1');

        // Actualizar filtros
        if (filters.q) prev.set('q', filters.q);
        else prev.delete('q');

        if (filters.orden) prev.set('orden', filters.orden);
        else prev.delete('orden');

        if (filters.ordenarPor) prev.set('ordenarPor', filters.ordenarPor);
        else prev.delete('ordenarPor');

        if (filters.flores) prev.set('flores', filters.flores);
        else prev.delete('flores');

        if (filters.precioMin) prev.set('precioMin', filters.precioMin);
        else prev.delete('precioMin');

        if (filters.precioMax) prev.set('precioMax', filters.precioMax);
        else prev.delete('precioMax');

        if (filters.idFormaArreglo) prev.set('idFormaArreglo', filters.idFormaArreglo);
        else prev.delete('idFormaArreglo');

        return prev;
      });
    },
    [setSearchParams]
  );

  return (
    <div className="min-h-screen">
      <Header />
      <section className="relative bg-linear-to-b from-[#fdf7f9] via-[#ffffff] to-[#f7f9fb] py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-xl bg-[#50C878]/5" />
          <div className="absolute bottom-1/4 right-1/4 w-80 sm:w-[450px] h-80 sm:h-[450px] rounded-full blur-xl bg-[#E91E63]/4" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#00A87F] mb-1 sm:mb-2">
              CATÁLOGO
            </p>
            <h1 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171517] mb-1 sm:mb-2 tracking-tight leading-[1.08]">
              NUESTROS ARREGLOS
            </h1>
            <p className="text-[#665b68] text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 font-medium">
              Descubre nuestra colección de arreglos florales únicos, creados con
              pasión y dedicación para cada ocasión especial.
            </p>
          </div>

          {/* Filtros */}
          <CatalogFilters
            q={q}
            orden={orden}
            ordenarPor={ordenarPor}
            flores={flores}
            precioMin={precioMin}
            precioMax={precioMax}
            idFormaArreglo={idFormaArreglo}
            onFilterChange={handleFilterChange}
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <p className="text-[#665b68] text-lg">
                No se pudieron cargar los arreglos. Por favor, intenta más tarde.
              </p>
            </div>
          ) : arreglos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#665b68] text-lg mb-4">
                {q || flores || precioMin || precioMax || idFormaArreglo
                  ? 'No hay arreglos disponibles con los filtros seleccionados.'
                  : 'No hay arreglos disponibles en este momento.'}
              </p>
              {(q || flores || precioMin || precioMax || idFormaArreglo) && (
                <button
                  onClick={() => {
                    setSearchParams((prev) => {
                      prev.delete('q');
                      prev.delete('flores');
                      prev.delete('precioMin');
                      prev.delete('precioMax');
                      prev.delete('idFormaArreglo');
                      prev.set('page', '1');
                      return prev;
                    });
                  }}
                  className="text-[#00A87F] hover:text-[#00A87F]/80 underline font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {arreglos.map((arreglo) => (
                  <ArregloCard key={arreglo.idArreglo} arreglo={arreglo} />
                ))}
              </div>

              {totalPages > 1 && (
                <CatalogPagination
                  currentPage={+page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={+limit}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;
