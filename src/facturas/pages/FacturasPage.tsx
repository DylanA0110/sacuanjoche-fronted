import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { DataTable } from '@/shared/components/Custom/DataTable';
import type { Column } from '@/shared/components/Custom/DataTable';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { useFactura } from '../hooks/useFactura';
import type { Factura } from '../types/factura.interface';
import { getFacturaPdf } from '../actions/getFacturaPdf';
import { updateFactura } from '../actions/updateFactura';
import { FacturaDetailsModal } from '../components/FacturaDetailsModal';
import { useClienteFromPedido } from '../hooks/useClienteFromPedido';
import { toast } from 'sonner';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MdReceipt, MdEdit, MdVisibility, MdMoreVert, MdDownload, MdDelete } from 'react-icons/md';
import { useTablePagination } from '@/shared/hooks/useTablePagination';

// Componente para renderizar cliente con carga lazy
const ClienteCell = ({ factura }: { factura: Factura }) => {
  const { cliente } = useClienteFromPedido(factura.pedido?.idCliente);
  
  // Si el pedido tiene el objeto cliente completo
  if (factura.pedido?.cliente) {
    const nombre = `${factura.pedido.cliente.primerNombre || ''} ${factura.pedido.cliente.primerApellido || ''}`.trim();
    return <span>{nombre || 'N/A'}</span>;
  }
  
  // Si obtuvimos el cliente por ID
  if (cliente) {
    const nombre = `${cliente.primerNombre || ''} ${cliente.primerApellido || ''}`.trim();
    return <span>{nombre || 'N/A'}</span>;
  }
  
  // Si tenemos idCliente pero aún no se cargó
  if (factura.pedido?.idCliente) {
    return <span className="text-gray-400 text-xs">Cargando...</span>;
  }
  
  return <span>N/A</span>;
};

const columns: Column[] = [
  {
    key: 'numFactura',
    label: 'Número de Factura',
    priority: 'high', // Siempre visible en móvil
    render: (value) => value || 'N/A',
  },
  {
    key: 'pedido',
    label: 'Pedido',
    priority: 'medium', // Oculto en móvil, visible en tablet+
    mobileHidden: true,
    render: (_value, row: Factura) => {
      if (row.pedido?.numeroPedido) {
        return row.pedido.numeroPedido;
      }
      return `PED-${row.idPedido}`;
    },
  },
  {
    key: 'cliente',
    label: 'Cliente',
    priority: 'low', // Solo visible en pantallas grandes
    mobileHidden: true,
    render: (_value, row: Factura) => {
      return <ClienteCell factura={row} />;
    },
  },
  {
    key: 'montoTotal',
    label: 'Monto Total',
    priority: 'high', // Siempre visible en móvil
    render: (value: string | number) => {
      const total = typeof value === 'string' ? parseFloat(value) : value;
      return `$${total.toFixed(2)}`;
    },
  },
  {
    key: 'estado',
    label: 'Estado',
    priority: 'medium', // Oculto en móvil, visible en tablet+
    mobileHidden: true,
    render: (value: string) => {
      const estado = value?.toLowerCase() || '';
      const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success'> = {
        pendiente: 'warning', // Naranja para pendiente (mejor contraste que amarillo)
        pagado: 'success', // Verde para pagado
        pagada: 'success', // Verde para pagada
        anulada: 'destructive', // Rojo para anulada
      };
      return (
        <Badge variant={variantMap[estado] || 'outline'}>
          {value || 'N/A'}
        </Badge>
      );
    },
  },
  {
    key: 'fechaEmision',
    label: 'Fecha Emisión',
    priority: 'low', // Solo visible en pantallas grandes
    mobileHidden: true,
    compact: true,
    render: (value) => {
      if (!value) return 'N/A';
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
  },
];

const FacturasPage = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedFacturaId, setSelectedFacturaId] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);
  const navigate = useNavigate();

  // Hook de paginación general
  // Nota: totalItems se actualizará después del query, pero el hook recalcula totalPages automáticamente
  const pagination = useTablePagination(0);

  const queryClient = useQueryClient();

  // Obtener facturas con paginación usando valores del hook (excluyendo anuladas)
  const { facturas, totalItems, isLoading, isError } = useFactura({
    usePagination: true,
    limit: pagination.limit,
    offset: pagination.offset,
    q: pagination.searchQuery || undefined,
    excludeAnuladas: true, // Solo mostrar facturas no anuladas
  });

  // Recalcular paginación con totalItems real (solo para totalPages correcto)
  // limit, page, offset, searchQuery vienen de searchParams y son consistentes
  const finalPagination = useTablePagination(totalItems);

  const handleView = (factura: Factura) => {
    setSelectedFacturaId(factura.idFactura);
    setIsDetailsOpen(true);
  };

  const handleEdit = (factura: Factura) => {
    navigate(`/admin/facturas/${factura.idFactura}/editar`);
  };

  const handleDownloadPdf = useCallback(
    async (factura: Factura) => {
      try {
        setDownloadingPdf(factura.idFactura);
        await getFacturaPdf(factura.idFactura);
        toast.success('PDF de factura descargado');
      } catch (error: any) {
        toast.error('Error al descargar PDF', {
          description: cleanErrorMessage(error),
          duration: 5000,
        });
      } finally {
        setDownloadingPdf(null);
      }
    },
    []
  );

  // Mutación para anular factura
  const anularFacturaMutation = useMutation({
    mutationFn: (id: number) => updateFactura(id, { estado: 'anulada' }),
    onSuccess: () => {
      toast.success('Factura anulada exitosamente', {
        description: 'La factura ha sido anulada correctamente',
        duration: 3000,
      });
      // Invalidar queries para actualizar la lista y paginación
      queryClient.invalidateQueries({ 
        queryKey: ['facturas'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['factura'],
        refetchType: 'active'
      });
    },
    onError: (error: any) => {
      toast.error('Error al anular la factura', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
  });

  const handleAnular = useCallback(
    (factura: Factura) => {
      if (window.confirm(`¿Estás seguro de que deseas anular la factura ${factura.numFactura}?`)) {
        anularFacturaMutation.mutate(factura.idFactura);
      }
    },
    [anularFacturaMutation]
  );

  const tableData = useMemo(
    () =>
      facturas.map((factura) => ({
        ...factura,
        id: factura.idFactura,
      })),
    [facturas]
  );

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F9F9F7] pb-4 -mt-6 pt-6 border-b border-gray-200/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-title-large mb-2 sm:mb-3 text-gray-900 tracking-tight truncate">
              Facturas
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-light">
              Administra las facturas de tus pedidos
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Detalles de la Factura */}
      <FacturaDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        facturaId={selectedFacturaId}
      />

      {/* Card con la tabla */}
      <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl shadow-black/10 rounded-2xl sm:rounded-3xl overflow-hidden min-w-0">
        <CardHeader className="pb-4 sm:pb-5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 border-b border-gray-100">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
            Listado de Facturas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4 md:p-6 lg:p-8 min-w-0">
          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <DataTable
            columns={columns}
            data={tableData}
            searchPlaceholder="Buscar por número, estado, pedido o empleado..."
            isLoading={isLoading}
            isError={isError}
            searchValue={finalPagination.searchQuery}
            onSearchChange={finalPagination.setSearch}
            totalItems={totalItems}
            currentPage={finalPagination.page}
            itemsPerPage={finalPagination.limit}
            onPageChange={finalPagination.setPage}
            onLimitChange={finalPagination.setLimit}
            customActions={(item: Factura) => {
              const isDownloading = downloadingPdf === item.idFactura;

              return (
                <div className="flex items-center justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-colors duration-150"
                        aria-label="Más acciones"
                      >
                        <MdMoreVert className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem
                        onClick={() => handleView(item)}
                        className="cursor-pointer"
                      >
                        <MdVisibility className="mr-2 h-4 w-4" />
                        <span>Ver detalles</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEdit(item)}
                        className="cursor-pointer"
                      >
                        <MdEdit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDownloadPdf(item)}
                        disabled={isDownloading}
                        className="cursor-pointer"
                      >
                        <MdDownload className="mr-2 h-4 w-4" />
                        <span>
                          {isDownloading
                            ? 'Descargando...'
                            : 'Descargar PDF'}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleAnular(item)}
                        disabled={anularFacturaMutation.isPending}
                        className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <MdDelete className="mr-2 h-4 w-4" />
                        <span>
                          {anularFacturaMutation.isPending
                            ? 'Anulando...'
                            : 'Anular'}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }}
          />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacturasPage;


