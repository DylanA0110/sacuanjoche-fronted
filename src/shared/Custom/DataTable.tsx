import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MdSearch, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
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
  title,
  columns,
  data,
  onView,
  onEdit,
  onDelete,
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
  const setSearch = onSearchChange || setInternalSearch;

  const filteredData = onSearchChange
    ? data // Si hay búsqueda externa, no filtrar localmente
    : data.filter((item) =>
        columns.some((col) => {
          const value = item[col.key];
          return value?.toString().toLowerCase().includes(search.toLowerCase());
        })
      );

  return (
    <Card className="glass-premium border-border hover:border-primary/20 transition-all">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl sm:text-2xl font-display text-gradient-vibrant">
            {title}
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
              className="pl-10 bg-input border-border/50 focus:border-primary/50 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/70">
                {columns.map((col) => (
                  <TableHead key={col.key} className="text-foreground font-semibold text-xs sm:text-sm whitespace-nowrap">
                    {col.label}
                  </TableHead>
                ))}
                {(onView || onEdit || onDelete) && (
                  <TableHead className="text-right text-foreground font-semibold text-xs sm:text-sm whitespace-nowrap">
                    Acciones
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                          className="text-center py-8 text-muted-foreground text-sm"
                        >
                          Cargando...
                        </TableCell>
                      </TableRow>
                    ) : isError ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                          className="text-center py-8 text-destructive text-sm"
                        >
                          Error al cargar los datos
                        </TableCell>
                      </TableRow>
                    ) : filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)}
                          className="text-center py-8 text-muted-foreground text-sm"
                        >
                          No se encontraron resultados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item, idx) => (
                        <TableRow
                          key={idx}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          {columns.map((col) => (
                            <TableCell key={col.key} className="text-xs sm:text-sm whitespace-nowrap">
                              {col.render ? col.render(item[col.key], item) : item[col.key]}
                            </TableCell>
                          ))}
                          {(onView || onEdit || onDelete) && (
                            <TableCell className="text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                {onView && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onView(item)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-sky/20 hover:text-sky"
                                  >
                                    <MdVisibility className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                )}
                                {onEdit && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEdit(item)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/20 hover:text-primary"
                                  >
                                    <MdEdit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                )}
                                {onDelete && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDelete(item)}
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                                  >
                                    <MdDelete className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
      </CardContent>
    </Card>
  );
}
