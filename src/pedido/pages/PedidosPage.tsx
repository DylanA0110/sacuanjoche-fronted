import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable } from '@/shared/Custom/DataTable';
import type { Column } from '@/shared/Custom/DataTable';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { usePedido } from '../hook/usePedido';
import type { Pedido } from '../types/pedido.interface';
import { createFacturaDesdePedido } from '@/facturas/actions/createFacturaDesdePedido';
import { MdReceipt, MdAdd, MdEdit, MdVisibility } from 'react-icons/md';

const columns: Column[] = [
  {
    key: 'cliente',
    label: 'Cliente',
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
    render: (value) => value || 'N/A',
  },
  {
    key: 'totalPedido',
    label: 'Total',
    render: (value: string | number) => {
      const total = typeof value === 'string' ? parseFloat(value) : value;
      return `$${total.toFixed(2)}`;
    },
  },
  {
    key: 'fechaCreacion',
    label: 'Fecha Creación',
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    },
  },
  {
    key: 'fechaEntregaEstimada',
    label: 'Fecha Entrega',
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    },
  },
];

const Pedidos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const searchQuery = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const offset = (currentPage - 1) * limit;

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (searchInput === searchQuery) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newParams.set('q', searchInput);
      } else {
        newParams.delete('q');
      }
      // Resetear a página 1 cuando se busca
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { pedidos, totalItems, isLoading, isError, error, refetch } = usePedido(
    {
      usePagination: true,
      limit,
      offset,
      q: searchQuery || undefined,
    }
  );

  useEffect(() => {
    if (isError && error) {
      console.error('Error en PedidosPage:', error);
    }
  }, [isError, error]);

  const generateFacturaMutation = useMutation({
    mutationFn: (idPedido: number) => createFacturaDesdePedido(idPedido),
    onSuccess: () => {
      toast.success('Factura creada exitosamente desde el pedido');
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      refetch();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Error al generar la factura';
      toast.error(errorMessage);
      console.error('Error al generar factura:', error);
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleGenerateFactura = (pedido: Pedido) => {
    // Asegurar que idPedido sea un número
    const idPedido = typeof pedido.idPedido === 'string' 
      ? parseInt(pedido.idPedido, 10) 
      : Number(pedido.idPedido);
    
    if (isNaN(idPedido)) {
      toast.error('ID de pedido inválido');
      return;
    }

    generateFacturaMutation.mutate(idPedido);
  };

  const handleView = (item: Pedido) => {
    // TODO: Implementar vista de detalles del pedido
    console.log('Ver detalles:', item);
  };

  const handleEdit = (item: Pedido) => {
    // TODO: Implementar edición del pedido
    console.log('Editar:', item);
  };

  const handleDelete = (item: Pedido) => {
    // TODO: Implementar eliminación del pedido
    console.log('Eliminar:', item);
  };

  const handleAddPedido = () => {
    // TODO: Implementar creación de nuevo pedido
    console.log('Agregar nuevo pedido');
  };

  const tableData = pedidos.map((pedido) => ({
    ...pedido,
    id: pedido.idPedido,
  }));

  return (
    <div className="space-y-6 sm:space-y-8 w-full max-w-full mx-auto px-2 sm:px-0">
      {/* Header Premium */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 text-gray-900 font-hero tracking-tight">
            Pedidos
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            Administra los pedidos de tus clientes
          </p>
        </div>
        <Button
          onClick={handleAddPedido}
          className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-2xl shadow-[#50C878]/50 gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-[#50C878]/60"
        >
          <MdAdd className="h-5 w-5" />
          <span className="hidden sm:inline">Agregar Pedido</span>
          <span className="sm:hidden">Agregar</span>
        </Button>
      </div>

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
            searchValue={searchInput}
            onSearchChange={handleSearch}
                    totalItems={totalItems}
                    currentPage={currentPage}
                    itemsPerPage={limit}
                    onPageChange={(page) => {
                      const newParams = new URLSearchParams(searchParams);
                      if (page === 1) {
                        newParams.delete('page');
                      } else {
                        newParams.set('page', String(page));
                      }
                      setSearchParams(newParams, { replace: true });
                    }}
            customActions={(item: Pedido) => (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleView(item)}
                  className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100/80 transition-all duration-200 hover:scale-110"
                  title="Ver detalles"
                >
                  <MdVisibility className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                  className="h-9 w-9 p-0 text-[#50C878] hover:text-[#50C878] rounded-full hover:bg-[#50C878]/10 transition-all duration-200 hover:scale-110"
                  title="Editar"
                >
                  <MdEdit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleGenerateFactura(item)}
                  disabled={generateFacturaMutation.isPending}
                  className="gap-1.5 bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-lg shadow-[#50C878]/30 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-[#50C878]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <MdReceipt className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {generateFacturaMutation.isPending
                      ? 'Generando...'
                      : 'Generar Factura'}
                  </span>
                  <span className="sm:hidden">
                    {generateFacturaMutation.isPending ? '...' : 'Factura'}
                  </span>
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

