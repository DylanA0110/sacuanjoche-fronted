import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable } from '@/shared/Custom/DataTable';
import type { Column } from '@/shared/Custom/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFactura } from '../hooks/useFactura';
import { createFactura } from '../actions/createFactura';
import { updateFactura } from '../actions/updateFactura';
import { FacturaForm } from '../components/FacturaForm';
import type {
  Factura,
  CreateFacturaDto,
  UpdateFacturaDto,
} from '../types/factura.interface';
import { MdAdd } from 'react-icons/md';

const columns: Column[] = [
  { key: 'numFactura', label: 'Número de Factura' },
  {
    key: 'pedido',
    label: 'Pedido',
    render: (_value, row: Factura) => {
      return row.pedido ? `PED-${row.pedido.idPedido}` : 'N/A';
    },
  },
  {
    key: 'cliente',
    label: 'Cliente',
    render: (_value, row: Factura) => {
      // Si tienes información del cliente en el pedido, úsala aquí
      return row.pedido?.direccionTxt || 'N/A';
    },
  },
  {
    key: 'montoTotal',
    label: 'Monto Total',
    render: (value: string) => `$${parseFloat(value).toFixed(2)}`,
  },
  {
    key: 'fechaEmision',
    label: 'Fecha Emisión',
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    },
  },
  {
    key: 'estado',
    label: 'Estado',
    render: (value) => {
      const colors = {
        Emitida: 'bg-sky/20 text-sky',
        Pagada: 'bg-primary/20 text-primary',
        Pendiente: 'bg-coral/20 text-coral',
        Anulada: 'bg-destructive/20 text-destructive',
      };
      return (
        <Badge className={colors[value as keyof typeof colors] || ''}>
          {value}
        </Badge>
      );
    },
  },
];

const Facturas = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const queryClient = useQueryClient();

  // Leer parámetros de la URL
  const searchQuery = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  // Sincronizar el input con la URL al cargar
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Debounce para actualizar la URL después de escribir
  useEffect(() => {
    // Solo actualizar si el input es diferente al valor en la URL
    if (searchInput === searchQuery) return;

    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newParams.set('q', searchInput);
      } else {
        newParams.delete('q');
      }
      newParams.set('offset', '0'); // Reset offset when searching
      setSearchParams(newParams, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { facturas, totalItems, isLoading, isError, error, refetch } =
    useFactura({
      usePagination: true,
      limit,
      offset,
      q: searchQuery || undefined,
    });

  // Log error en consola si existe
  useEffect(() => {
    if (isError && error) {
      console.error('Error en FacturasPage:', error);
    }
  }, [isError, error]);

  const createMutation = useMutation({
    mutationFn: createFactura,
    onSuccess: () => {
      toast.success('Factura creada exitosamente');
      setIsFormOpen(false);
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      refetch();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear la factura';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacturaDto }) =>
      updateFactura(id, data),
    onSuccess: () => {
      toast.success('Factura actualizada exitosamente');
      setIsFormOpen(false);
      setSelectedFactura(null);
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      refetch();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al actualizar la factura';
      toast.error(errorMessage);
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleEdit = (item: Factura) => {
    setSelectedFactura(item);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedFactura(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: CreateFacturaDto | UpdateFacturaDto) => {
    if (selectedFactura) {
      await updateMutation.mutateAsync({
        id: selectedFactura.idFactura,
        data: data as UpdateFacturaDto,
      });
    } else {
      await createMutation.mutateAsync(data as CreateFacturaDto);
    }
  };

  const handleView = (item: Factura) => {
    console.log('View:', item);
    // TODO: Implementar vista detallada
  };

  const handleDelete = (item: Factura) => {
    console.log('Delete:', item);
    // TODO: Implementar confirmación y eliminación
  };

  // Transformar facturas para la tabla
  const tableData = facturas.map((factura) => ({
    ...factura,
    id: factura.idFactura,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display text-gradient-fire mb-2 sm:mb-3">
            Facturas
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
            Administra las facturas de tus pedidos
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full sm:w-auto">
          <MdAdd className="h-4 w-4 sm:h-5 sm:w-5" />
          Nueva Factura
        </Button>
      </div>

      <DataTable
        title="Listado de Facturas"
        columns={columns}
        data={tableData}
        searchPlaceholder="Buscar por número, estado, pedido o empleado..."
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        isError={isError}
        searchValue={searchInput}
        onSearchChange={handleSearch}
        totalItems={totalItems}
        currentPage={Math.floor(offset / limit) + 1}
        itemsPerPage={limit}
        onPageChange={(page) => {
          const newParams = new URLSearchParams(searchParams);
          newParams.set('offset', String((page - 1) * limit));
          setSearchParams(newParams, { replace: true });
        }}
      />

      <FacturaForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        factura={selectedFactura}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

export default Facturas;
