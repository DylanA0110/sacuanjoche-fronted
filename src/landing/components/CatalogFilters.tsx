import { useState, useCallback, useEffect, useMemo } from 'react';
import { HiFilter } from 'react-icons/hi';
import { useFormasArregloPublic } from '../hooks/useFormasArregloPublic';
import { useFloresPublic } from '../hooks/useFloresPublic';

interface CatalogFiltersProps {
  q: string;
  orden: string;
  ordenarPor: string;
  flores: string;
  precioMin: string;
  precioMax: string;
  idFormaArreglo: string;
  onFilterChange: (filters: {
    q: string;
    orden: string;
    ordenarPor: string;
    flores: string;
    precioMin: string;
    precioMax: string;
    idFormaArreglo: string;
  }) => void;
}

export const CatalogFilters = ({
  q,
  orden,
  ordenarPor,
  flores,
  precioMin,
  precioMax,
  idFormaArreglo,
  onFilterChange,
}: CatalogFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    q: q || '',
    orden: orden || '',
    ordenarPor: ordenarPor || '',
    flores: flores || '',
    precioMin: precioMin || '',
    precioMax: precioMax || '',
    idFormaArreglo: idFormaArreglo || '',
  });

  const { data: formasArregloData, isLoading: isLoadingFormas } = useFormasArregloPublic();
  const { data: floresListData, isLoading: isLoadingFlores } = useFloresPublic();
  
  // Asegurar que siempre sean arrays - validación más robusta
  const formasArreglo = useMemo(() => {
    if (!formasArregloData) return [];
    if (Array.isArray(formasArregloData)) return formasArregloData;
    console.warn('⚠️ [CatalogFilters] formasArregloData no es un array:', formasArregloData);
    return [];
  }, [formasArregloData]);
  
  const floresList = useMemo(() => {
    if (!floresListData) return [];
    if (Array.isArray(floresListData)) return floresListData;
    console.warn('⚠️ [CatalogFilters] floresListData no es un array:', floresListData);
    return [];
  }, [floresListData]);

  // Sincronizar filtros locales con props cuando cambian desde URL
  useEffect(() => {
    setLocalFilters({
      q: q || '',
      orden: orden || '',
      ordenarPor: ordenarPor || '',
      flores: flores || '',
      precioMin: precioMin || '',
      precioMax: precioMax || '',
      idFormaArreglo: idFormaArreglo || '',
    });
  }, [q, orden, ordenarPor, flores, precioMin, precioMax, idFormaArreglo]);

  const selectedFloresIds = localFilters.flores
    ? localFilters.flores.split(',').map((id) => id.trim()).filter(Boolean)
    : [];

  const handleApplyFilters = useCallback(() => {
    onFilterChange(localFilters);
    setIsOpen(false);
  }, [localFilters, onFilterChange]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      q: '',
      orden: '',
      ordenarPor: '',
      flores: '',
      precioMin: '',
      precioMax: '',
      idFormaArreglo: '',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  }, [onFilterChange]);

  const hasActiveFilters =
    q || orden || ordenarPor || flores || precioMin || precioMax || idFormaArreglo;

  const toggleFlor = useCallback(
    (florId: string) => {
      const currentIds = localFilters.flores
        ? localFilters.flores.split(',').map((id) => id.trim()).filter(Boolean)
        : [];
      const newIds = currentIds.includes(florId)
        ? currentIds.filter((id) => id !== florId)
        : [...currentIds, florId];
      setLocalFilters((prev) => ({
        ...prev,
        flores: newIds.join(','),
      }));
    },
    [localFilters.flores]
  );

  return (
    <div className="mb-6 sm:mb-8">
      {/* Botón para abrir filtros */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E4E4E7] rounded-[10px] text-sm font-semibold text-[#171517] hover:bg-[#F4F4F5] hover:border-[#50C878]/30 transition-all"
        >
          <HiFilter className="w-4 h-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-[#50C878] text-white text-xs rounded-full">
              {[
                q && '1',
                orden && '1',
                ordenarPor && '1',
                flores && '1',
                precioMin && '1',
                precioMax && '1',
                idFormaArreglo && '1',
              ].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Filtros activos visibles */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-sm text-[#71717A] hover:text-[#171517] font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      {isOpen && (
        <div className="bg-white border border-[#E4E4E7] rounded-[15px] p-4 sm:p-6 shadow-[0_5px_20px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Búsqueda por texto */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-[#171517] mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={localFilters.q}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, q: e.target.value }))
                }
                placeholder="Buscar por nombre, descripción o forma..."
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-[10px] text-sm text-[#171517] bg-white focus:outline-none focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
              />
            </div>

            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-semibold text-[#171517] mb-2">
                Ordenar por
              </label>
              <select
                value={localFilters.ordenarPor}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, ordenarPor: e.target.value }))
                }
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-[10px] text-sm text-[#171517] bg-white focus:outline-none focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
              >
                <option value="">Seleccionar...</option>
                <option value="precio">Precio</option>
                <option value="nombre">Nombre</option>
                <option value="fechaCreacion">Fecha</option>
              </select>
            </div>

            {/* Dirección del orden */}
            {localFilters.ordenarPor && (
              <div>
                <label className="block text-sm font-semibold text-[#171517] mb-2">
                  Dirección
                </label>
                <select
                  value={localFilters.orden}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, orden: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[#E4E4E7] rounded-[10px] text-sm text-[#171517] bg-white focus:outline-none focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
                >
                  <option value="ASC">Ascendente</option>
                  <option value="DESC">Descendente</option>
                </select>
              </div>
            )}

            {/* Forma de arreglo */}
            <div>
              <label className="block text-sm font-semibold text-[#171517] mb-2">
                Tipo de arreglo
              </label>
              <select
                value={localFilters.idFormaArreglo}
                onChange={(e) =>
                  setLocalFilters((prev) => ({ ...prev, idFormaArreglo: e.target.value }))
                }
                disabled={isLoadingFormas}
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-[10px] text-sm text-[#171517] bg-white focus:outline-none focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Todas</option>
                {isLoadingFormas ? (
                  <option value="" disabled>Cargando...</option>
                ) : (
                  formasArreglo.map((forma) => (
                    <option key={forma.idFormaArreglo} value={String(forma.idFormaArreglo)}>
                      {forma.descripcion}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="block text-sm font-semibold text-[#171517] mb-2">
                Precio mínimo (C$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={localFilters.precioMin}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setLocalFilters((prev) => ({ ...prev, precioMin: value }));
                  }
                }}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-[10px] text-sm text-[#171517] bg-white focus:outline-none focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-semibold text-[#171517] mb-2">
                Precio máximo (C$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={localFilters.precioMax}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                    setLocalFilters((prev) => ({ ...prev, precioMax: value }));
                  }
                }}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-[#E4E4E7] rounded-[10px] text-sm text-[#171517] bg-white focus:outline-none focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20"
              />
            </div>
          </div>

          {/* Filtro de flores */}
          {isLoadingFlores ? (
            <div className="mt-4 sm:mt-6">
              <label className="block text-sm font-semibold text-[#171517] mb-3">
                Flores
              </label>
              <div className="text-sm text-[#71717A]">Cargando flores...</div>
            </div>
          ) : floresList.length > 0 ? (
            <div className="mt-4 sm:mt-6">
              <label className="block text-sm font-semibold text-[#171517] mb-3">
                Flores
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {floresList.map((flor) => {
                  const isSelected = selectedFloresIds.includes(String(flor.idFlor));
                  return (
                    <button
                      key={flor.idFlor}
                      type="button"
                      onClick={() => toggleFlor(String(flor.idFlor))}
                      className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#50C878] text-white'
                          : 'bg-[#F4F4F5] text-[#71717A] hover:bg-[#E4E4E7]'
                      }`}
                      title={flor.color ? `${flor.nombre} - ${flor.color}` : flor.nombre}
                    >
                      {flor.nombre}
                      {flor.color && (
                        <span className="ml-1 text-[10px] opacity-75">
                          ({flor.color})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-[#E4E4E7]">
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2 bg-linear-to-r from-[#50C878] to-[#00A87F] text-white rounded-[10px] font-semibold text-sm hover:from-[#00A87F] hover:to-[#50C878] transition-all"
            >
              Aplicar filtros
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-white border border-[#E4E4E7] text-[#171517] rounded-[10px] font-semibold text-sm hover:bg-[#F4F4F5] transition-all"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

