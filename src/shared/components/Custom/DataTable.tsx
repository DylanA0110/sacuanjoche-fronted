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
            className="pl-8 sm:pl-10 h-9 sm:h-10 md:h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 text-sm sm:text-base"
          />
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-x-auto border border-gray-200 rounded-lg bg-white">
        <div className="min-w-[640px]">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200 hover:bg-gray-50">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap px-3 sm:px-4 py-3 min-w-[100px]"
                  >
                    {col.label}
                  </TableHead>
                ))}
                {(onView || onEdit || onDelete || customActions) && (
                  <TableHead className="text-right text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap px-3 sm:px-4 py-3 min-w-[120px]">
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
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">
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
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span className="text-sm text-red-600">
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
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-lg">📭</span>
                      <span className="text-sm text-gray-500">
                        No se encontraron resultados
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className="text-sm text-gray-900 px-3 sm:px-4 py-3 whitespace-nowrap"
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : item[col.key]}
                      </TableCell>
                    ))}
                    {(onView || onEdit || onDelete || customActions) && (
                      <TableCell className="text-right px-3 sm:px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {customActions && customActions(item)}
                          {onView && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onView(item)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100 shrink-0"
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
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
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
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
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

      {/* Pagination Premium */}
      {totalItems && totalItems > 0 && onPageChange && (
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-t border-gray-200/80 bg-gray-50/50 rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4">
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
          <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((currentPage || 1) - 1)}
              disabled={(currentPage || 1) === 1}
              className="border-gray-300/80 text-gray-700 hover:bg-gray-100 hover:border-gray-400 text-sm font-medium h-9 px-5 flex-1 sm:flex-initial transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange((currentPage || 1) + 1)}
              disabled={(currentPage || 1) * (itemsPerPage || 10) >= totalItems}
              className="border-gray-300/80 text-gray-700 hover:bg-gray-100 hover:border-gray-400 text-sm font-medium h-9 px-5 flex-1 sm:flex-initial transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
