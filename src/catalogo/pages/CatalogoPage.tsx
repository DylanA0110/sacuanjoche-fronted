import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
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
import { Badge } from '@/shared/components/ui/badge';
import { useFlor } from '../hooks/useFlor';
import { useAccesorio } from '../hooks/useAccesorio';
import { useFormaArreglo } from '../hooks/useFormaArreglo';
import { useMetodoPago } from '../hooks/useMetodoPago';
import type { Flor, CreateFlorDto, UpdateFlorDto } from '../types/flor.interface';
import type { Accesorio, CreateAccesorioDto, UpdateAccesorioDto } from '../types/accesorio.interface';
import type { FormaArreglo, CreateFormaArregloDto, UpdateFormaArregloDto } from '../types/forma-arreglo.interface';
import type { MetodoPago, CreateMetodoPagoDto, UpdateMetodoPagoDto } from '../types/metodo-pago.interface';
import { createFlor, updateFlor } from '../actions/flor/index';
import { createAccesorio, updateAccesorio } from '../actions/accesorio/index';
import { createFormaArreglo, updateFormaArreglo } from '../actions/formaArreglo/index';
import { createMetodoPago, updateMetodoPago } from '../actions/metodoPago/index';
import { FlorForm } from '../components/FlorForm';
import { AccesorioForm } from '../components/AccesorioForm';
import { FormaArregloForm } from '../components/FormaArregloForm';
import { MetodoPagoForm } from '../components/MetodoPagoForm';
import { MdAdd, MdEdit, MdVisibility, MdDelete } from 'react-icons/md';

type TabType = 'flores' | 'accesorios' | 'formas' | 'metodos';

const CatalogoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'flores');
  const [searchInput, setSearchInput] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
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
      newParams.delete('page');
      setSearchParams(newParams, { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', activeTab);
    setSearchParams(newParams, { replace: true });
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hooks para cada sección
  const { flores, totalItems: totalFlores, isLoading: isLoadingFlores, isError: isErrorFlores, refetch: refetchFlores } = useFlor({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    estado: 'activo',
  });

  const { accesorios, totalItems: totalAccesorios, isLoading: isLoadingAccesorios, isError: isErrorAccesorios, refetch: refetchAccesorios } = useAccesorio({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    estado: 'activo',
  });

  const { formasArreglo, totalItems: totalFormas, isLoading: isLoadingFormas, isError: isErrorFormas, refetch: refetchFormas } = useFormaArreglo({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    activo: true,
  });

  const { metodosPago, totalItems: totalMetodos, isLoading: isLoadingMetodos, isError: isErrorMetodos, refetch: refetchMetodos } = useMetodoPago({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    estado: 'activo',
  });

  // Mutations
  const createFlorMutation = useMutation({
    mutationFn: createFlor,
    onSuccess: () => {
      toast.success('Flor creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['flores'] });
      refetchFlores();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al crear la flor');
    },
  });

  const updateFlorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFlorDto }) => updateFlor(id, data),
    onSuccess: () => {
      toast.success('Flor actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['flores'] });
      refetchFlores();
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al actualizar la flor');
    },
  });

  const createAccesorioMutation = useMutation({
    mutationFn: createAccesorio,
    onSuccess: () => {
      toast.success('Accesorio creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['accesorios'] });
      refetchAccesorios();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al crear el accesorio');
    },
  });

  const updateAccesorioMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccesorioDto }) => updateAccesorio(id, data),
    onSuccess: () => {
      toast.success('Accesorio actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['accesorios'] });
      refetchAccesorios();
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al actualizar el accesorio');
    },
  });

  const createFormaArregloMutation = useMutation({
    mutationFn: createFormaArreglo,
    onSuccess: () => {
      toast.success('Forma de arreglo creada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['formasArreglo'] });
      refetchFormas();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al crear la forma de arreglo');
    },
  });

  const updateFormaArregloMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFormaArregloDto }) => updateFormaArreglo(id, data),
    onSuccess: () => {
      toast.success('Forma de arreglo actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['formasArreglo'] });
      refetchFormas();
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al actualizar la forma de arreglo');
    },
  });

  const createMetodoPagoMutation = useMutation({
    mutationFn: createMetodoPago,
    onSuccess: () => {
      toast.success('Método de pago creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['metodosPago'] });
      refetchMetodos();
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al crear el método de pago');
    },
  });

  const updateMetodoPagoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMetodoPagoDto }) => updateMetodoPago(id, data),
    onSuccess: () => {
      toast.success('Método de pago actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['metodosPago'] });
      refetchMetodos();
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Error al actualizar el método de pago');
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: any) => {
    const itemName = activeTab === 'flores' ? item.nombre :
                     activeTab === 'accesorios' ? item.descripcion :
                     activeTab === 'formas' ? item.descripcion :
                     item.descripcion;
    
    if (window.confirm(`¿Estás seguro de que deseas desactivar ${itemName}?`)) {
      if (activeTab === 'flores') {
        updateFlorMutation.mutate({ id: item.idFlor, data: { estado: 'inactivo' } });
      } else if (activeTab === 'accesorios') {
        updateAccesorioMutation.mutate({ id: item.idAccesorio, data: { estado: 'inactivo' } });
      } else if (activeTab === 'formas') {
        updateFormaArregloMutation.mutate({ id: item.idFormaArreglo, data: { activo: false } });
      } else {
        updateMetodoPagoMutation.mutate({ id: item.idMetodoPago, data: { estado: 'inactivo' } });
      }
    }
  };


  const handleSubmit = (data: any) => {
    if (activeTab === 'flores') {
      if (editingItem) {
        updateFlorMutation.mutate({ id: editingItem.idFlor, data: data as UpdateFlorDto });
      } else {
        createFlorMutation.mutate(data as CreateFlorDto);
      }
    } else if (activeTab === 'accesorios') {
      if (editingItem) {
        updateAccesorioMutation.mutate({ id: editingItem.idAccesorio, data: data as UpdateAccesorioDto });
      } else {
        createAccesorioMutation.mutate(data as CreateAccesorioDto);
      }
    } else if (activeTab === 'formas') {
      if (editingItem) {
        updateFormaArregloMutation.mutate({ id: editingItem.idFormaArreglo, data: data as UpdateFormaArregloDto });
      } else {
        createFormaArregloMutation.mutate(data as CreateFormaArregloDto);
      }
    } else {
      if (editingItem) {
        updateMetodoPagoMutation.mutate({ id: editingItem.idMetodoPago, data: data as UpdateMetodoPagoDto });
      } else {
        createMetodoPagoMutation.mutate(data as CreateMetodoPagoDto);
      }
    }
  };

  // Columnas para cada tabla
  const floresColumns: Column[] = [
    {
      key: 'nombre',
      label: 'Nombre',
    },
    {
      key: 'color',
      label: 'Color',
    },
    {
      key: 'tipo',
      label: 'Tipo',
    },
    {
      key: 'precioUnitario',
      label: 'Precio',
      render: (value: string | number) => {
        const precio = typeof value === 'string' ? parseFloat(value) : value;
        return `C$${precio.toFixed(2)}`;
      },
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
  ];

  const accesoriosColumns: Column[] = [
    {
      key: 'descripcion',
      label: 'Descripción',
    },
    {
      key: 'categoria',
      label: 'Categoría',
    },
    {
      key: 'precioUnitario',
      label: 'Precio',
      render: (value: string | number) => {
        const precio = typeof value === 'string' ? parseFloat(value) : value;
        return `C$${precio.toFixed(2)}`;
      },
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
  ];

  const formasColumns: Column[] = [
    {
      key: 'descripcion',
      label: 'Descripción',
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (value: boolean) => {
        return (
          <Badge
            className={
              value
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }
          >
            {value ? 'Activo' : 'Inactivo'}
          </Badge>
        );
      },
    },
  ];

  const metodosColumns: Column[] = [
    {
      key: 'descripcion',
      label: 'Descripción',
    },
    {
      key: 'tipo',
      label: 'Tipo',
    },
    {
      key: 'canalesDisponibles',
      label: 'Canales',
      render: (value: string[]) => {
        return value?.join(', ') || 'N/A';
      },
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
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'flores':
        return {
          data: flores.map((f) => ({ ...f, id: f.idFlor })),
          columns: floresColumns,
          totalItems: totalFlores,
          isLoading: isLoadingFlores,
          isError: isErrorFlores,
          buttonText: 'Nueva Flor',
        };
      case 'accesorios':
        return {
          data: accesorios.map((a) => ({ ...a, id: a.idAccesorio })),
          columns: accesoriosColumns,
          totalItems: totalAccesorios,
          isLoading: isLoadingAccesorios,
          isError: isErrorAccesorios,
          buttonText: 'Nuevo Accesorio',
        };
      case 'formas':
        return {
          data: formasArreglo.map((f) => ({ ...f, id: f.idFormaArreglo })),
          columns: formasColumns,
          totalItems: totalFormas,
          isLoading: isLoadingFormas,
          isError: isErrorFormas,
          buttonText: 'Nueva Forma',
        };
      case 'metodos':
        return {
          data: metodosPago.map((m) => ({ ...m, id: m.idMetodoPago })),
          columns: metodosColumns,
          totalItems: totalMetodos,
          isLoading: isLoadingMetodos,
          isError: isErrorMetodos,
          buttonText: 'Nuevo Método',
        };
      default:
        return {
          data: [],
          columns: [],
          totalItems: 0,
          isLoading: false,
          isError: false,
          buttonText: 'Nuevo',
        };
    }
  };

  const currentData = getCurrentData();

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'flores':
        return 'Buscar por nombre, color o tipo...';
      case 'accesorios':
        return 'Buscar por descripción o categoría...';
      case 'formas':
        return 'Buscar por descripción...';
      case 'metodos':
        return 'Buscar por descripción...';
      default:
        return 'Buscar...';
    }
  };

  return (
    <>
      <div className="space-y-6 sm:space-y-8 w-full max-w-full mx-auto px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 text-gray-900 font-hero tracking-tight">
              Catálogo
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Administra flores, accesorios, formas de arreglo y métodos de pago
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-2xl shadow-[#50C878]/50 gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-[#50C878]/60"
          >
            <MdAdd className="h-5 w-5" />
            <span className="hidden sm:inline">{currentData.buttonText}</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 rounded-xl p-1.5 flex flex-wrap gap-1.5 border border-gray-200">
          <button
            onClick={() => setActiveTab('flores')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'flores'
                ? 'bg-[#50C878] text-white shadow-md shadow-[#50C878]/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-white'
            }`}
          >
            Flores
          </button>
          <button
            onClick={() => setActiveTab('accesorios')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'accesorios'
                ? 'bg-[#50C878] text-white shadow-md shadow-[#50C878]/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-white'
            }`}
          >
            Accesorios
          </button>
          <button
            onClick={() => setActiveTab('formas')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'formas'
                ? 'bg-[#50C878] text-white shadow-md shadow-[#50C878]/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-white'
            }`}
          >
            Formas
          </button>
          <button
            onClick={() => setActiveTab('metodos')}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === 'metodos'
                ? 'bg-[#50C878] text-white shadow-md shadow-[#50C878]/30'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200 bg-white'
            }`}
          >
            Métodos de Pago
          </button>
        </div>

        {/* Card con la tabla */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl shadow-black/10 rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 sm:pb-5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 border-b border-gray-100">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              {activeTab === 'flores' && 'Listado de Flores'}
              {activeTab === 'accesorios' && 'Listado de Accesorios'}
              {activeTab === 'formas' && 'Listado de Formas de Arreglo'}
              {activeTab === 'metodos' && 'Listado de Métodos de Pago'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
            <DataTable
              columns={currentData.columns}
              data={currentData.data}
              searchPlaceholder={getSearchPlaceholder()}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={currentData.isLoading}
              isError={currentData.isError}
              searchValue={searchInput}
              onSearchChange={handleSearch}
              totalItems={currentData.totalItems}
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

      {/* Formularios */}
      {activeTab === 'flores' && (
        <FlorForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          flor={editingItem}
          onSubmit={handleSubmit}
          isLoading={createFlorMutation.isPending || updateFlorMutation.isPending}
        />
      )}
      {activeTab === 'accesorios' && (
        <AccesorioForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          accesorio={editingItem}
          onSubmit={handleSubmit}
          isLoading={createAccesorioMutation.isPending || updateAccesorioMutation.isPending}
        />
      )}
      {activeTab === 'formas' && (
        <FormaArregloForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          formaArreglo={editingItem}
          onSubmit={handleSubmit}
          isLoading={createFormaArregloMutation.isPending || updateFormaArregloMutation.isPending}
        />
      )}
      {activeTab === 'metodos' && (
        <MetodoPagoForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          metodoPago={editingItem}
          onSubmit={handleSubmit}
          isLoading={createMetodoPagoMutation.isPending || updateMetodoPagoMutation.isPending}
        />
      )}
    </>
  );
};

export default CatalogoPage;

