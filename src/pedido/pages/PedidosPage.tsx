import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
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
import { createFacturaDesdePedido } from '@/facturas/actions/createFacturaDesdePedido';
import {
  createPedido,
  updatePedido,
  createDetallePedido,
  createContactoEntrega,
  updateContactoEntrega,
  getPedidoById,
} from '../actions';
import { getDetallePedidoByPedidoId } from '../actions/getDetallePedidoByPedidoId';
import { createDireccion, updateDireccion } from '@/cliente/actions';
import { PedidoForm } from '../components/PedidoForm';
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
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    },
  },
  {
    key: 'fechaEntregaEstimada',
    label: 'Fecha Entrega',
    priority: 'medium', // Visible en tablet y desktop
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    },
  },
];

const Pedidos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Derivar valores directamente de searchParams (mejor rendimiento)
  const searchQuery = useMemo(() => searchParams.get('q') || '', [searchParams]);
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

  const generateFacturaMutation = useMutation({
    mutationFn: (idPedido: number) => createFacturaDesdePedido(idPedido),
    onSuccess: (factura) => {
      toast.success('Factura creada exitosamente desde el pedido');
      // Navegar a la página de nueva factura con el idFactura para poder descargar PDF
      if (factura && factura.idFactura && factura.idPedido) {
        navigate(
          `/admin/pedidos/${factura.idPedido}/nueva-factura?idFactura=${factura.idFactura}`
        );
      }
    },
    onError: (error: any) => {
      toast.error('Error al generar la factura', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: (data) => {
      // Invalidar solo facturas y el pedido específico relacionado
      queryClient.invalidateQueries({
        queryKey: ['facturas'],
        refetchType: 'active',
      });
      if (data?.idPedido) {
        queryClient.invalidateQueries({
          queryKey: ['pedidos', data.idPedido],
          refetchType: 'active',
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['pedidos'],
        refetchType: 'active',
      });
    },
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

    generateFacturaMutation.mutate(idPedido);
  };

  const handleView = useCallback((item: Pedido) => {
    setSelectedPedidoId(item.idPedido);
    setIsDetailsOpen(true);
  }, []);

  const handleEdit = useCallback(async (item: Pedido) => {
    try {
      // Cargar el pedido completo con todas sus relaciones
      const pedidoCompleto = await getPedidoById(item.idPedido);
      
      // Si no vienen los detalles, cargarlos por separado
      if (!pedidoCompleto.detalles || pedidoCompleto.detalles.length === 0) {
        try {
          const detalles = await getDetallePedidoByPedidoId(item.idPedido);
          pedidoCompleto.detalles = detalles;
        } catch {
          // Si no se pueden cargar los detalles, continuar sin ellos
        }
      }
      
      setEditingPedido(pedidoCompleto);
      setIsFormOpen(true);
    } catch (error) {
      toast.error('Error al cargar el pedido', {
        description: cleanErrorMessage(error),
      });
    }
  }, []);

  const handleDelete = useCallback((_item: Pedido) => {
    // TODO: Implementar eliminación del pedido
  }, []);

  const handleAddPedido = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const savePedidoMutation = useMutation({
    mutationFn: async (data: {
      pedido: any;
      direccion?: any;
      contactoEntrega: { nombre: string; apellido: string; telefono: string };
      detalles: Array<{
        idArreglo: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }>;
      isEdit?: boolean;
      pedidoId?: number;
    }) => {
      const isEdit = data.isEdit && data.pedidoId;
      let idDireccion = data.pedido.idDireccion || 0;
      let idContactoEntrega = data.pedido.idContactoEntrega || 0;

      // 1. Actualizar o crear dirección si es necesario
      if (data.direccion) {
        if (isEdit && data.pedido.idDireccion) {
          await updateDireccion(data.pedido.idDireccion, data.direccion);
          idDireccion = data.pedido.idDireccion;
        } else {
          const direccionCreada = await createDireccion(data.direccion);
          if (!direccionCreada.idDireccion) {
            throw new Error('La dirección creada no tiene idDireccion');
          }
          idDireccion = direccionCreada.idDireccion;
        }
      }

      // 2. Actualizar o crear contacto de entrega
      if (isEdit && data.pedido.idContactoEntrega) {
        await updateContactoEntrega(
          data.pedido.idContactoEntrega,
          data.contactoEntrega
        );
        idContactoEntrega = data.pedido.idContactoEntrega;
      } else {
        const contactoCreado = await createContactoEntrega(
          data.contactoEntrega
        );
        if (!contactoCreado.idContactoEntrega) {
          throw new Error(
            'El contacto de entrega creado no tiene idContactoEntrega'
          );
        }
        idContactoEntrega = contactoCreado.idContactoEntrega;
      }

      // 3. Crear o actualizar pedido
      const pedidoDto = {
        ...data.pedido,
        idDireccion,
        idContactoEntrega,
      };

      let pedidoResultado;
      if (isEdit && data.pedidoId) {
        pedidoResultado = await updatePedido(data.pedidoId, pedidoDto);
      } else {
        pedidoResultado = await createPedido(pedidoDto);
        if (!pedidoResultado.idPedido) {
          throw new Error('El pedido creado no tiene idPedido');
        }
      }

      // 4. Actualizar o crear detalles del pedido (solo si hay detalles)
      if (data.detalles && data.detalles.length > 0) {
        if (isEdit && data.pedidoId) {
          // En edición, por simplicidad, eliminamos y recreamos los detalles
          // (En producción, sería mejor actualizar solo los que cambiaron)
          const detallesPromises = data.detalles.map((detalle) =>
            createDetallePedido({
              idPedido: data.pedidoId!,
              idArreglo: detalle.idArreglo,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              subtotal: detalle.subtotal,
            })
          );
          await Promise.all(detallesPromises);
        } else {
          const detallesPromises = data.detalles.map((detalle) =>
            createDetallePedido({
              idPedido: pedidoResultado.idPedido,
              idArreglo: detalle.idArreglo,
              cantidad: detalle.cantidad,
              precioUnitario: detalle.precioUnitario,
              subtotal: detalle.subtotal,
            })
          );
          await Promise.all(detallesPromises);
        }
      }
      // Si no hay detalles, el pedido se guarda sin detalles (válido para edición de pedidos sin arreglos)

      return pedidoResultado;
    },
    onSuccess: (pedido, variables) => {
      const isEdit = variables.isEdit;
      toast.success(
        isEdit
          ? 'Pedido actualizado exitosamente'
          : 'Pedido creado exitosamente',
        {
          description: isEdit
            ? `El pedido #${pedido.idPedido} ha sido actualizado correctamente`
            : `El pedido #${pedido.idPedido} ha sido registrado correctamente`,
          duration: 4000,
        }
      );
      setIsFormOpen(false);
      setEditingPedido(null);
    },
    onError: (error: any, variables) => {
      const isEdit = variables.isEdit;
      toast.error(
        isEdit ? 'Error al actualizar el pedido' : 'Error al crear el pedido',
        {
          description: cleanErrorMessage(error),
          duration: 5000,
        }
      );
    },
    onSettled: (_data, _error, variables) => {
      // Invalidación inteligente: solo invalidar lo necesario según la operación
      const isEdit = variables.isEdit;
      if (isEdit) {
        // En edición, invalidar solo el pedido específico si es posible
        if (variables.pedidoId) {
          queryClient.invalidateQueries({
            queryKey: ['pedidos', variables.pedidoId],
            refetchType: 'active',
          });
        }
        // También invalidar la lista para reflejar cambios
        queryClient.invalidateQueries({
          queryKey: ['pedidos'],
          refetchType: 'active',
        });
      } else {
        // En creación, invalidar la lista completa
        queryClient.invalidateQueries({
          queryKey: ['pedidos'],
          refetchType: 'active',
        });
      }
      // Invalidar detalles solo si se modificaron
      queryClient.invalidateQueries({
        queryKey: ['detalle-pedido'],
        refetchType: 'active',
      });
    },
  });

  const handleSubmitPedido = useCallback(
    (data: {
      pedido: any;
      direccion?: any;
      contactoEntrega: { nombre: string; apellido: string; telefono: string };
      detalles: Array<{
        idArreglo: number;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
      }>;
    }) => {
      const isEdit = !!editingPedido;
      savePedidoMutation.mutate({
        ...data,
        isEdit,
        pedidoId: editingPedido?.idPedido,
        pedido: {
          ...data.pedido,
          idDireccion: editingPedido?.idDireccion,
          idContactoEntrega: editingPedido?.idContactoEntrega,
        },
      });
    },
    [savePedidoMutation, editingPedido]
  );

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

      {/* Formulario de Pedido */}
      <PedidoForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingPedido(null);
          }
        }}
        onSubmit={handleSubmitPedido}
        isLoading={savePedidoMutation.isPending}
        pedido={editingPedido}
      />

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
                  disabled={generateFacturaMutation.isPending}
                  className="h-9 w-9 p-0 text-[#50C878] hover:text-[#3aa85c] rounded-lg hover:bg-[#50C878]/10 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    generateFacturaMutation.isPending
                      ? 'Generando factura...'
                      : 'Generar factura'
                  }
                  aria-label={
                    generateFacturaMutation.isPending
                      ? 'Generando factura'
                      : 'Generar factura'
                  }
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
