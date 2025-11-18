import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DataTable } from '@/shared/components/Custom/DataTable';
import type { Column } from '@/shared/components/Custom/DataTable';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useCliente } from '../hook/useCliente';
import type {
  Cliente,
  CreateClienteDto,
  UpdateClienteDto,
} from '../types/cliente.interface';
import { createCliente, updateCliente } from '../actions/index';
import { ClienteForm } from '../components/ClienteForm';
import { MdAdd } from 'react-icons/md';

const columns: Column[] = [
  {
    key: 'primerNombre',
    label: 'Nombre',
    render: (_value, row: Cliente) =>
      `${row.primerNombre} ${row.primerApellido}`,
  },
  {
    key: 'telefono',
    label: 'Teléfono',
  },
  {
    key: 'estado',
    label: 'Estado',
    render: (value: 'activo' | 'inactivo') => {
      const isActivo = value === 'activo';
      return (
        <Badge
          className={
            isActivo
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-red-100 text-red-800 border-red-200'
          }
        >
          {isActivo ? 'Activo' : 'Inactivo'}
        </Badge>
      );
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
];

const ClientesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
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

  const { clientes, totalItems, isLoading, isError, error, refetch } =
    useCliente({
      usePagination: true,
      limit,
      offset,
      q: searchQuery || undefined,
      activo: 'activo', // Solo clientes activos
    });

  useEffect(() => {
    if (isError && error) {
      console.error('Error en ClientesPage:', error);
    }
  }, [isError, error]);

  const createClienteMutation = useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      toast.success('Cliente creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      refetch();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al crear el cliente';
      toast.error(errorMessage);
    },
  });

  const updateClienteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClienteDto }) =>
      updateCliente(id, data),
    onSuccess: () => {
      toast.success('Cliente actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      refetch();
      setIsFormOpen(false);
      setEditingCliente(null);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al actualizar el cliente';
      toast.error(errorMessage);
    },
  });

  const deleteClienteMutation = useMutation({
    mutationFn: (id: number) => updateCliente(id, { estado: 'inactivo' }),
    onSuccess: () => {
      toast.success('Cliente desactivado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      refetch();
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al desactivar el cliente';
      toast.error(errorMessage);
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleCreate = () => {
    setEditingCliente(null);
    setIsFormOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = (cliente: Cliente) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas desactivar al cliente ${cliente.primerNombre} ${cliente.primerApellido}?`
      )
    ) {
      deleteClienteMutation.mutate(cliente.idCliente);
    }
  };

  const handleSubmit = (data: CreateClienteDto | UpdateClienteDto) => {
    if (editingCliente) {
      updateClienteMutation.mutate({
        id: editingCliente.idCliente,
        data: data as UpdateClienteDto,
      });
    } else {
      createClienteMutation.mutate(data as CreateClienteDto);
    }
  };

  const tableData = clientes.map((cliente) => ({
    ...cliente,
    id: cliente.idCliente,
  }));

  return (
    <>
      <div className="space-y-6 sm:space-y-8 w-full">
        {/* Header Premium */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 text-gray-900 tracking-tight">
              Clientes
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Administra los clientes de tu floristería
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-2xl shadow-[#50C878]/50 gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-[#50C878]/60"
          >
            <MdAdd className="h-5 w-5" />
            <span className="hidden sm:inline">Agregar Cliente</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>

        {/* Card con la tabla - Premium Glassmorphism */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl shadow-black/10 rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 sm:pb-5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 border-b border-gray-100">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Listado de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
            <DataTable
              columns={columns}
              data={tableData}
              searchPlaceholder="Buscar por nombre o teléfono..."
              onEdit={handleEdit}
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
            />
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Cliente */}
      <ClienteForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        cliente={editingCliente}
        onSubmit={handleSubmit}
        isLoading={
          createClienteMutation.isPending || updateClienteMutation.isPending
        }
      />
    </>
  );
};

export default ClientesPage;
