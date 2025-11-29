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
  // Solo mostrar si hay más de una página
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="mt-8 sm:mt-12">
      {/* Información superior */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="text-sm sm:text-base text-gray-700 font-medium">
          Total <span className="font-bold text-gray-900">{totalItems}</span>{' '}
          resultados
        </div>
        <div className="flex items-center gap-4 text-sm sm:text-base text-gray-700 font-medium">
          <span>
            Pag. <span className="font-bold text-gray-900">{currentPage}</span>{' '}
            / <span className="font-bold text-gray-900">{totalPages}</span>
          </span>
          <span>
            <span className="font-bold text-gray-900">{itemsPerPage}</span> /
            pag.
          </span>
        </div>
      </div>

      {/* Botones de paginación */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#50C878] hover:text-[#50C878] disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700"
        >
          <HiChevronLeft className="h-4 w-4" />
          <span>Anteriores</span>
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1 sm:gap-2">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#50C878] text-white border-2 border-[#50C878] shadow-sm'
                    : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#50C878] hover:text-[#50C878]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#50C878] hover:text-[#50C878] disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700"
        >
          <span>Siguiente</span>
          <HiChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
