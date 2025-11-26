import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { MdSearch, MdEdit, MdDelete, MdVisibility } from 'react-icons/md';

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobileHidden?: boolean; // Ocultar en móvil
  priority?: 'high' | 'medium' | 'low'; // Prioridad para mostrar en móvil
  compact?: boolean; // Aplicar estilos compactos (menos padding)
}

interface DataTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  customActions?: (item: any) => React.ReactNode;
  searchPlaceholder?: string;
  isLoading?: boolean;
  isError?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  customActions,
  searchPlaceholder = 'Buscar...',
  isLoading = false,
  isError = false,
  searchValue,
  onSearchChange,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
}: DataTableProps) {
  const [internalSearch, setInternalSearch] = useState('');

  const search = searchValue !== undefined ? searchValue : internalSearch;

  const filteredData = onSearchChange
    ? data
    : data.filter((item) =>
        columns.some((col) => {
          const value = item[col.key];
          return value?.toString().toLowerCase().includes(search.toLowerCase());
        })
      );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="relative">
          <MdSearch className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              const newValue = e.target.value;
              if (onSearchChange) {
                onSearchChange(newValue);
              } else {
                setInternalSearch(newValue);
              }
            }}
            className="pl-8 sm:pl-10 h-9 sm:h-10 md:h-11 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#50C878] focus:ring-[#50C878]/20 text-sm sm:text-base rounded-lg transition-all duration-200"
          />
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg bg-white border border-gray-200 shadow-md scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="min-w-max md:min-w-full">
          <Table className="w-full table-auto min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                {columns.map((col, index) => (
                  <TableHead
                    key={col.key}
                    className={`text-xs sm:text-sm font-semibold text-gray-900 ${
                      col.compact ? 'px-2 sm:px-3 py-2 sm:py-2.5' : 'px-4 sm:px-5 py-3.5 sm:py-4'
                    } ${
                      col.mobileHidden ? 'hidden md:table-cell' : ''
                    } ${
                      col.priority === 'low' ? 'hidden lg:table-cell' : ''
                    } ${
                      // Columna Cliente sticky
                      col.key === 'cliente' 
                        ? 'sticky left-0 z-20 bg-gray-50 min-w-[150px] sm:min-w-[180px]'
                        : col.key === 'direccionTxt'
                        ? 'min-w-[200px] max-w-[250px] whitespace-normal'
                        : col.compact
                        ? 'whitespace-nowrap min-w-[90px] sm:min-w-[100px]'
                        : 'whitespace-nowrap min-w-[80px] sm:min-w-[100px]'
                    }`}
                  >
                    {col.label}
                  </TableHead>
                ))}
                {(onView || onEdit || onDelete || customActions) && (
                  <TableHead className="text-right text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap px-4 sm:px-5 py-3.5 sm:py-4 min-w-[100px] sm:min-w-[120px]">
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (onView || onEdit || onDelete || customActions ? 1 : 0)
                    }
                    className="text-center py-16"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-3 border-[#50C878]/20 border-t-[#50C878] rounded-full animate-spin" />
                      <span className="text-sm text-gray-600 font-medium">
                        Cargando datos...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (onView || onEdit || onDelete || customActions ? 1 : 0)
                    }
                    className="text-center py-16"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <span className="text-sm text-red-600 font-medium">
                        Error al cargar los datos
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      columns.length +
                      (onView || onEdit || onDelete || customActions ? 1 : 0)
                    }
                    className="text-center py-16"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <span className="text-2xl">📭</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        No se encontraron resultados
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-gray-100 hover:bg-[#D0F0C0]/10 transition-colors duration-150 group"
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={`text-sm text-gray-800 ${
                          col.compact ? 'px-2 sm:px-3 py-2 sm:py-2.5' : 'px-4 sm:px-5 py-3.5 sm:py-4'
                        } group-hover:text-gray-900 ${
                      col.mobileHidden ? 'hidden md:table-cell' : ''
                    } ${
                      col.priority === 'low' ? 'hidden lg:table-cell' : ''
                        } ${
                      // Columna Cliente sticky
                      col.key === 'cliente'
                        ? 'sticky left-0 z-10 bg-white group-hover:bg-gray-50 whitespace-nowrap min-w-[150px] sm:min-w-[180px] shadow-[2px_0_4px_rgba(0,0,0,0.05)]'
                        : col.key === 'direccionTxt'
                        ? 'min-w-[200px] max-w-[250px] whitespace-normal break-words'
                        : 'whitespace-nowrap'
                    }`}
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : item[col.key]}
                      </TableCell>
                    ))}
                    {(onView || onEdit || onDelete || customActions) && (
                      <TableCell className="text-right px-4 sm:px-5 py-3.5 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {customActions && customActions(item)}
                          {onView && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onView(item)}
                              className="h-9 w-9 p-0 text-gray-400 hover:text-[#50C878] hover:bg-[#50C878]/10 rounded-lg shrink-0 transition-all duration-200"
                              title="Ver detalles"
                            >
                              <MdVisibility className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(item)}
                              className="h-9 w-9 p-0 text-gray-400 hover:text-[#50C878] hover:bg-[#50C878]/10 rounded-lg shrink-0 transition-all duration-200"
                              title="Editar"
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(item)}
                              className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 transition-all duration-200"
                              title="Eliminar"
                            >
                              <MdDelete className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems && totalItems > 0 && onPageChange && (
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-gray-200 bg-white rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left font-medium">
            Mostrando{' '}
            <span className="font-semibold text-gray-900">
              {Math.min(
                (currentPage || 1) * (itemsPerPage || 10) -
                  (itemsPerPage || 10) +
                  1,
                totalItems
              )}
            </span>{' '}
            -{' '}
            <span className="font-semibold text-gray-900">
              {Math.min((currentPage || 1) * (itemsPerPage || 10), totalItems)}
            </span>{' '}
            de <span className="font-semibold text-gray-900">{totalItems}</span>
          </p>
          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((currentPage || 1) - 1)}
              disabled={(currentPage || 1) === 1}
              className="border-gray-200 text-gray-700 hover:bg-[#50C878]/10 hover:border-[#50C878]/30 hover:text-[#50C878] text-sm font-medium h-9 px-4 flex-1 sm:flex-initial transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((currentPage || 1) + 1)}
              disabled={(currentPage || 1) * (itemsPerPage || 10) >= totalItems}
              className="border-gray-200 text-gray-700 hover:bg-[#50C878]/10 hover:border-[#50C878]/30 hover:text-[#50C878] text-sm font-medium h-9 px-4 flex-1 sm:flex-initial transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
