import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { DataTable } from '@/shared/components/Custom/DataTable';
import type { Column } from '@/shared/components/Custom/DataTable';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { usePedido } from '../hook/usePedido';
import type { Pedido } from '../types/pedido.interface';
import { PedidoDetailsModal } from '../components/PedidoDetailsModal';
import { MdReceipt, MdAdd, MdEdit, MdVisibility } from 'react-icons/md';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Derivar valores directamente de searchParams (mejor rendimiento)
  const searchQuery = useMemo(
    () => searchParams.get('q') || '',
    [searchParams]
  );
  const limit = useMemo(
    () => parseInt(searchParams.get('limit') || '10', 10),
    [searchParams]
  );
  const currentPage = useMemo(
    () => parseInt(searchParams.get('page') || '1', 10),
    [searchParams]
  );
  const offset = useMemo(() => (currentPage - 1) * limit, [currentPage, limit]);

  const { pedidos, totalItems, isLoading, isError } = usePedido({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
  });

  // Manejar búsqueda con debounce usando URL params directamente
  const handleSearch = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set('q', value);
      } else {
        newParams.delete('q');
      }
      // Resetear a página 1 cuando se busca
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

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

  const handlePageChange = useCallback(
    (page: number) => {
      const newParams = new URLSearchParams(searchParams);
      if (page === 1) {
        newParams.delete('page');
      } else {
        newParams.set('page', String(page));
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
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
            searchValue={searchQuery}
            onSearchChange={handleSearch}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            customActions={(item: Pedido) => (
              <div className="flex items-center justify-center gap-2 sm:gap-2 px-1 sm:px-2 min-w-[130px]">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleView(item)}
                  className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/80 transition-colors duration-150"
                  title="Ver detalles"
                >
                  <MdVisibility className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                  className="h-9 w-9 p-0 text-[#50C878] hover:text-[#3aa85c] rounded-lg hover:bg-[#50C878]/10 transition-colors duration-150"
                  title="Editar"
                >
                  <MdEdit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleGenerateFactura(item)}
                  className="h-9 w-9 p-0 text-[#50C878] hover:text-[#3aa85c] rounded-lg hover:bg-[#50C878]/10 transition-colors duration-150"
                  title="Generar factura"
                  aria-label="Generar factura"
                >
                  <MdReceipt className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Pedidos;
