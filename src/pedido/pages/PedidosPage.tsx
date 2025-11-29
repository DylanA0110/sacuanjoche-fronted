import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTablePagination } from '@/shared/hooks/useTablePagination';
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
import { usePedido } from '../hook/usePedido';
import type { Pedido } from '../types/pedido.interface';
import { PedidoDetailsModal } from '../components/PedidoDetailsModal';
import { getOrdenTrabajoPdf } from '../actions';
import { toast } from 'sonner';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import { MdReceipt, MdAdd, MdEdit, MdVisibility, MdMoreVert, MdDescription } from 'react-icons/md';

const columns: Column[] = [
  {
    key: 'cliente',
    label: 'Cliente',
    priority: 'high', // Siempre visible en móvil
    render: (_value, row: Pedido) => {
      if (row.cliente) {
        return `${row.cliente.primerNombre} ${row.cliente.primerApellido}`;
      }
      return row.direccionTxt || 'N/A';
    },
  },
  {
    key: 'direccionTxt',
    label: 'Dirección',
    mobileHidden: true, // Ocultar en móvil
    render: (value) => {
      if (!value) return 'N/A';
      // Truncar direcciones muy largas
      const maxLength = 50;
      return value.length > maxLength
        ? `${value.substring(0, maxLength)}...`
        : value;
    },
  },
  {
    key: 'totalPedido',
    label: 'Total',
    priority: 'high', // Siempre visible en móvil
    render: (value: string | number) => {
      const total = typeof value === 'string' ? parseFloat(value) : value;
      return `$${total.toFixed(2)}`;
    },
  },
  {
    key: 'fechaCreacion',
    label: 'Fecha Creación',
    priority: 'low', // Solo visible en pantallas grandes
    compact: true, // Marca para aplicar estilos compactos
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
  },
  {
    key: 'fechaEntregaEstimada',
    label: 'Fecha Entrega',
    priority: 'medium', // Visible en tablet y desktop
    compact: true, // Marca para aplicar estilos compactos
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
  },
];

const Pedidos = () => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);
  const navigate = useNavigate();

  // Hook de paginación general
  const pagination = useTablePagination(0);

  // Obtener pedidos con paginación usando valores del hook
  const { pedidos, totalItems, isLoading, isError } = usePedido({
    usePagination: true,
    limit: pagination.limit,
    offset: pagination.offset,
    q: pagination.searchQuery || undefined,
  });

  // Debug: Log para verificar valores
  useEffect(() => {
    console.log('PedidosPage - Debug:', {
      totalItems,
      limit: pagination.limit,
      offset: pagination.offset,
      page: pagination.page,
      pedidosCount: pedidos.length,
      calculatedTotalPages: Math.ceil(totalItems / pagination.limit),
    });
  }, [totalItems, pagination.limit, pagination.offset, pagination.page, pedidos.length]);

  // Recalcular paginación con totalItems real
  const finalPagination = useTablePagination(totalItems);

  const handleGenerateFactura = (pedido: Pedido) => {
    // Asegurar que idPedido sea un número
    const idPedido =
      typeof pedido.idPedido === 'string'
        ? parseInt(pedido.idPedido, 10)
        : Number(pedido.idPedido);

    if (isNaN(idPedido)) {
      toast.error('Pedido inválido');
      return;
    }

    // Navegar a NuevaFacturaPage para crear la factura manualmente
    navigate(`/admin/pedidos/${idPedido}/nueva-factura`);
  };

  const handleDownloadOrdenTrabajo = useCallback(async (pedido: Pedido) => {
    const idPedido =
      typeof pedido.idPedido === 'string'
        ? parseInt(pedido.idPedido, 10)
        : Number(pedido.idPedido);

    if (isNaN(idPedido)) {
      toast.error('Pedido inválido');
      return;
    }

    try {
      setDownloadingPdf(idPedido);
      await getOrdenTrabajoPdf(idPedido);
      toast.success('Orden de trabajo descargada exitosamente');
    } catch (error: any) {
      toast.error('Error al descargar orden de trabajo', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    } finally {
      setDownloadingPdf(null);
    }
  }, []);

  const handleView = useCallback((item: Pedido) => {
    setSelectedPedidoId(item.idPedido);
    setIsDetailsOpen(true);
  }, []);

  const handleEdit = useCallback(
    (item: Pedido) => {
      navigate(`/admin/pedidos/${item.idPedido}/editar`);
    },
    [navigate]
  );

  const handleDelete = useCallback((_item: Pedido) => {
    // TODO: Implementar eliminación del pedido
  }, []);

  const handleAddPedido = useCallback(() => {
    navigate('/admin/pedidos/nuevo');
  }, [navigate]);

  // Memoizar datos de tabla para evitar recálculos innecesarios
  const tableData = useMemo(
    () =>
      pedidos.map((pedido) => ({
        ...pedido,
        id: pedido.idPedido,
      })),
    [pedidos]
  );


  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Header Premium - Sticky para mantener visible */}
      <div className="sticky top-0 z-30 bg-[#F9F9F7] pb-4 -mt-6 pt-6 border-b border-gray-200/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-title-large mb-2 sm:mb-3 text-gray-900 tracking-tight">
              Pedidos
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-light">
              Administra los pedidos de tus clientes
            </p>
          </div>
          <Button
            onClick={handleAddPedido}
            className="bg-[#50C878] hover:bg-[#63d68b] text-white shadow-md shadow-[#50C878]/30 gap-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 font-sans rounded-lg w-full sm:w-auto"
          >
            <MdAdd className="h-5 w-5" />
            <span className="hidden sm:inline">Agregar Pedido</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Modal de Detalles del Pedido */}
      <PedidoDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        pedidoId={selectedPedidoId}
      />

      {/* Card con la tabla - Premium Glassmorphism */}
      <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl shadow-black/10 rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="pb-4 sm:pb-5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 border-b border-gray-100">
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            Listado de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
          <DataTable
            columns={columns}
            data={tableData}
            searchPlaceholder="Buscar por número, cliente o dirección..."
            onDelete={handleDelete}
            isLoading={isLoading}
            isError={isError}
            searchValue={finalPagination.searchQuery}
            onSearchChange={finalPagination.setSearch}
            totalItems={totalItems}
            currentPage={finalPagination.page}
            itemsPerPage={finalPagination.limit}
            onPageChange={finalPagination.setPage}
            onLimitChange={finalPagination.setLimit}
            customActions={(item: Pedido) => {
              const idPedido =
                typeof item.idPedido === 'string'
                  ? parseInt(item.idPedido, 10)
                  : Number(item.idPedido);
              const isDownloading = downloadingPdf === idPedido;

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
                        onClick={() => handleGenerateFactura(item)}
                        className="cursor-pointer"
                      >
                        <MdReceipt className="mr-2 h-4 w-4" />
                        <span>Generar factura</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDownloadOrdenTrabajo(item)}
                        disabled={isDownloading}
                        className="cursor-pointer"
                      >
                        <MdDescription className="mr-2 h-4 w-4" />
                        <span>
                          {isDownloading
                            ? 'Descargando...'
                            : 'Descargar orden de trabajo'}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Pedidos;
