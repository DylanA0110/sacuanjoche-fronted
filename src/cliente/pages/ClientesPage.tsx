import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useTablePagination } from '@/shared/hooks/useTablePagination';
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
import { Badge } from '@/shared/components/ui/badge';
import { useCliente } from '../hook/useCliente';
import type {
  Cliente,
  CreateClienteDto,
  UpdateClienteDto,
} from '../types/cliente.interface';
import { createCliente, updateCliente, createDireccion, createClienteDireccion } from '../actions/index';
import type { CreateDireccionDto, CreateClienteDireccionDto } from '../types/direccion.interface';
import { ClienteForm } from '../components/ClienteForm';
import { MdAdd } from 'react-icons/md';
import { useDebounce } from '@/shared/hooks/useDebounce';

const columns: Column[] = [
  {
    key: 'primerNombre',
    label: 'Nombre',
    priority: 'high', // Siempre visible en móvil
    render: (_value, row: Cliente) =>
      `${row.primerNombre} ${row.primerApellido}`,
  },
  {
    key: 'telefono',
    label: 'Teléfono',
    priority: 'high', // Siempre visible en móvil
  },
  {
    key: 'estado',
    label: 'Estado',
    priority: 'medium', // Visible en tablet y desktop
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
    priority: 'low', // Solo visible en pantallas grandes
    render: (value) => {
      const date = new Date(value);
      return date.toLocaleDateString('es-ES');
    },
  },
];

const ClientesPage = () => {
  const location = useLocation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const queryClient = useQueryClient();

  // Abrir formulario automáticamente si viene desde acciones rápidas
  useEffect(() => {
    if (location.state && (location.state as { openForm?: boolean }).openForm) {
      setIsFormOpen(true);
      // Limpiar el estado para evitar que se abra cada vez que se renderice
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // Hook de paginación general
  const pagination = useTablePagination(0);

  // Obtener clientes con paginación usando valores del hook
  const { clientes, totalItems, isLoading, isError } =
    useCliente({
      usePagination: true,
      limit: pagination.limit,
      offset: pagination.offset,
      q: pagination.searchQuery || undefined,
      activo: 'activo', // Solo clientes activos
    });

  // Recalcular paginación con totalItems real
  const finalPagination = useTablePagination(totalItems);

  // Usar directamente searchQuery - solo necesitamos un input local para el debounce
  const [searchInput, setSearchInput] = useState(finalPagination.searchQuery);
  const debouncedSearch = useDebounce(searchInput, 500);
  const isUserTypingRef = useRef(false);

  // Actualizar URL cuando cambia el debounced search
  useEffect(() => {
    if (debouncedSearch === finalPagination.searchQuery) {
      isUserTypingRef.current = false;
      return;
    }

    isUserTypingRef.current = true;
    finalPagination.setSearch(debouncedSearch);
  }, [debouncedSearch, finalPagination]);

  // Sincronizar searchInput cuando cambia la URL desde fuera
  useEffect(() => {
    if (!isUserTypingRef.current && finalPagination.searchQuery !== searchInput) {
      setSearchInput(finalPagination.searchQuery);
    }
  }, [finalPagination.searchQuery]);

  // Error handling se hace vía toast notifications - no necesitamos useEffect

  const createClienteMutation = useMutation({
    mutationFn: async (data: { cliente: CreateClienteDto; direccion?: any }) => {
      // 1. Primero crear el cliente
      const nuevoCliente = await createCliente(data.cliente);
      
      // 2. Si hay datos de dirección, crear la dirección y la relación
      if (data.direccion && nuevoCliente.idCliente) {
        try {
          // Crear la dirección - validar y convertir datos según la API
          const lat = parseFloat(data.direccion.lat);
          const lng = parseFloat(data.direccion.lng);
          
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Las coordenadas (lat, lng) deben ser números válidos');
          }
          
          const direccionDto: CreateDireccionDto = {
            formattedAddress: data.direccion.formattedAddress || '',
            country: data.direccion.country || 'NIC',
            stateProv: data.direccion.adminArea || null, // adminArea se mapea a stateProv
            city: data.direccion.city || '',
            neighborhood: data.direccion.neighborhood || '',
            street: data.direccion.street || '',
            houseNumber: data.direccion.houseNumber || '',
            postalCode: data.direccion.postalCode || '',
            referencia: data.direccion.referencia || '',
            lat: lat, // Número, no string
            lng: lng, // Número, no string
            provider: data.direccion.provider || 'MAP BOX',
            placeId: data.direccion.placeId || '',
            accuracy: data.direccion.accuracy || 'ROOFTOP',
            geolocation: data.direccion.geolocation || JSON.stringify({
              accuracy: 10,
              timestamp: Date.now(),
              coordinates: [lng, lat]
            }),
            activo: true,
          };
          
          // Validar campos requeridos antes de enviar
          if (!direccionDto.formattedAddress) {
            throw new Error('El campo formattedAddress es requerido');
          }
          
          const direccionCreada = await createDireccion(direccionDto);
          
          // Verificar que la dirección tenga idDireccion
          if (!direccionCreada.idDireccion) {
            throw new Error('La dirección creada no tiene idDireccion');
          }
          
          // 3. Crear la relación cliente-dirección usando la response body
          const clienteDireccionDto: CreateClienteDireccionDto = {
            idCliente: nuevoCliente.idCliente,
            idDireccion: direccionCreada.idDireccion, // Usar el idDireccion de la response
            etiqueta: data.direccion.etiqueta || 'Casa',
            esPredeterminada: data.direccion.esPredeterminada ?? true,
            activo: true,
          };
          
          await createClienteDireccion(clienteDireccionDto);
          
          // Éxito: dirección y relación creadas correctamente
          toast.success('Dirección guardada correctamente', {
            description: `La dirección ha sido asociada al cliente ${nuevoCliente.primerNombre} ${nuevoCliente.primerApellido}`,
            duration: 3000,
          });
        } catch (direccionError: any) {
          // Mostrar mensaje de error más detallado
          const errorMessage = direccionError?.response?.data?.message 
            || direccionError?.response?.data?.error
            || direccionError?.message
            || 'Error desconocido';
          
          // No fallar la creación del cliente si falla la dirección
          toast.warning('Cliente creado exitosamente', {
            description: `Pero hubo un problema al guardar la dirección: ${errorMessage}`,
            duration: 5000,
          });
        }
      }
      
      return nuevoCliente;
    },
    onSuccess: (nuevoCliente) => {
      // Verificar si se creó también la dirección
      const tieneDireccion = nuevoCliente && 'direccion' in nuevoCliente;
      
      if (tieneDireccion) {
        toast.success('Cliente y dirección creados exitosamente', {
          description: `${nuevoCliente.primerNombre} ${nuevoCliente.primerApellido} ha sido registrado con su dirección`,
          duration: 4000,
        });
      } else {
        toast.success('Cliente creado exitosamente', {
          description: `${nuevoCliente.primerNombre} ${nuevoCliente.primerApellido} ha sido registrado correctamente`,
          duration: 3000,
        });
      }
      
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error('Error al crear el cliente', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['clientes'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['cliente-direcciones'],
        refetchType: 'active'
      });
    },
  });

  const updateClienteMutation = useMutation({
    mutationFn: async ({ id, data, direccion }: { id: number; data: UpdateClienteDto; direccion?: any }) => {
      // 1. Actualizar el cliente
      const clienteActualizado = await updateCliente(id, data);
      
      // 2. Si hay datos de dirección, crear/actualizar la dirección
      if (direccion && clienteActualizado.idCliente) {
        try {
          // Convertir coordenadas a números
          const lat = parseFloat(direccion.lat);
          const lng = parseFloat(direccion.lng);
          
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error('Las coordenadas (lat, lng) deben ser números válidos');
          }
          
          const direccionDto: CreateDireccionDto = {
            formattedAddress: direccion.formattedAddress || '',
            country: direccion.country || 'NIC',
            stateProv: direccion.adminArea || null,
            city: direccion.city || '',
            neighborhood: direccion.neighborhood || '',
            street: direccion.street || '',
            houseNumber: direccion.houseNumber || '',
            postalCode: direccion.postalCode || '',
            referencia: direccion.referencia || '',
            lat: lat,
            lng: lng,
            provider: direccion.provider || 'MAP BOX',
            placeId: direccion.placeId || '',
            accuracy: direccion.accuracy || 'ROOFTOP',
            geolocation: direccion.geolocation || JSON.stringify({
              accuracy: 10,
              timestamp: Date.now(),
              coordinates: [lng, lat]
            }),
            activo: true,
          };
          
          if (!direccionDto.formattedAddress) {
            throw new Error('El campo formattedAddress es requerido');
          }
          
          const direccionCreada = await createDireccion(direccionDto);
          
          if (!direccionCreada.idDireccion) {
            throw new Error('La dirección creada no tiene idDireccion');
          }
          
          // 3. Crear o actualizar la relación cliente-dirección
          const clienteDireccionDto: CreateClienteDireccionDto = {
            idCliente: clienteActualizado.idCliente,
            idDireccion: direccionCreada.idDireccion,
            etiqueta: direccion.etiqueta || 'Casa',
            esPredeterminada: direccion.esPredeterminada ?? true,
            activo: true,
          };
          
          await createClienteDireccion(clienteDireccionDto);
          
          toast.success('Dirección actualizada correctamente', {
            description: `La dirección ha sido asociada al cliente ${clienteActualizado.primerNombre} ${clienteActualizado.primerApellido}`,
            duration: 3000,
          });
        } catch (direccionError: any) {
          const errorMessage = direccionError?.response?.data?.message 
            || direccionError?.response?.data?.error
            || direccionError?.message
            || 'Error desconocido';
          
          toast.warning('Cliente actualizado exitosamente', {
            description: `Pero hubo un problema al guardar la dirección: ${errorMessage}`,
            duration: 5000,
          });
        }
      }
      
      return clienteActualizado;
    },
    onSuccess: (clienteActualizado) => {
      toast.success('Cliente actualizado exitosamente', {
        description: `Los datos de ${clienteActualizado.primerNombre} ${clienteActualizado.primerApellido} han sido actualizados`,
        duration: 3000,
      });
      setIsFormOpen(false);
      setEditingCliente(null);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el cliente', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['clientes'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['cliente-direcciones'],
        refetchType: 'active'
      });
    },
  });

  const deleteClienteMutation = useMutation({
    mutationFn: (id: number) => updateCliente(id, { estado: 'inactivo' }),
    onSuccess: () => {
      toast.success('Cliente desactivado', {
        description: 'El cliente ha sido marcado como inactivo correctamente',
        duration: 3000,
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Error al desactivar el cliente';
      toast.error('Error al desactivar el cliente', {
        description: errorMessage,
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['clientes'],
        refetchType: 'active'
      });
    },
  });


  const handleCreate = useCallback(() => {
    setEditingCliente(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((cliente: Cliente) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas desactivar al cliente ${cliente.primerNombre} ${cliente.primerApellido}?`
      )
    ) {
      deleteClienteMutation.mutate(cliente.idCliente);
    }
  }, [deleteClienteMutation]);

  const handleSubmit = useCallback((
    data: CreateClienteDto | UpdateClienteDto,
    direccionData?: any
  ) => {
    if (editingCliente) {
      updateClienteMutation.mutate({
        id: editingCliente.idCliente,
        data: data as UpdateClienteDto,
        direccion: direccionData,
      });
    } else {
      createClienteMutation.mutate({
        cliente: data as CreateClienteDto,
        direccion: direccionData,
      });
    }
  }, [editingCliente, updateClienteMutation, createClienteMutation]);

  const tableData = useMemo(() => clientes.map((cliente) => ({
    ...cliente,
    id: cliente.idCliente,
  })), [clientes]);

  return (
    <>
      <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full overflow-x-hidden">
        {/* Header Premium - Sticky para mantener visible */}
        <div className="sticky top-0 z-30 bg-[#F9F9F7] pb-4 -mt-6 pt-6 border-b border-gray-200/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-title-large mb-2 sm:mb-3 text-gray-900 tracking-tight">
              Clientes
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-light">
              Administra los clientes de tu floristería
            </p>
          </div>
          <Button
            onClick={handleCreate}
              className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-md shadow-[#50C878]/30 gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 font-sans rounded-lg w-full sm:w-auto"
          >
            <MdAdd className="h-5 w-5" />
            <span className="hidden sm:inline">Agregar Cliente</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
          </div>
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
              onSearchChange={(value) => {
                setSearchInput(value);
                finalPagination.setSearch(value);
              }}
              totalItems={totalItems}
              currentPage={finalPagination.page}
              itemsPerPage={finalPagination.limit}
              onPageChange={finalPagination.setPage}
              onLimitChange={finalPagination.setLimit}
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
