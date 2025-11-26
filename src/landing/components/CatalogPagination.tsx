import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const CatalogPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: CatalogPaginationProps) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Calcular qué números de página mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Al inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Al final
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
      {/* Información de resultados */}
      <div className="text-center sm:text-left">
        <p className="text-sm sm:text-base text-[#665b68] font-medium">
          Mostrando{' '}
          <span className="font-bold text-[#171517]">{startItem}</span> -{' '}
          <span className="font-bold text-[#171517]">{endItem}</span> de{' '}
          <span className="font-bold text-[#171517]">{totalItems}</span> arreglos
        </p>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-[10px] text-sm sm:text-base font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-[#E4E4E7] text-[#171517] hover:bg-[#F4F4F5] hover:border-[#50C878]/30 hover:text-[#50C878] disabled:hover:bg-white disabled:hover:border-[#E4E4E7] disabled:hover:text-[#171517]"
        >
          <HiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1 sm:gap-2">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 sm:px-3 py-2 text-[#71717A] font-medium"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 px-2 sm:px-3 rounded-[10px] text-sm sm:text-base font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#50C878] to-[#00A87F] text-white shadow-[0_3px_10px_rgba(80,200,120,0.3)]'
                    : 'bg-white border border-[#E4E4E7] text-[#171517] hover:bg-[#F4F4F5] hover:border-[#50C878]/30 hover:text-[#50C878]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-[10px] text-sm sm:text-base font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-[#E4E4E7] text-[#171517] hover:bg-[#F4F4F5] hover:border-[#50C878]/30 hover:text-[#50C878] disabled:hover:bg-white disabled:hover:border-[#E4E4E7] disabled:hover:text-[#171517]"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <HiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

