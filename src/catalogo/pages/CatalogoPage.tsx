import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
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
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useFlor } from '../hooks/useFlor';
import { useAccesorio } from '../hooks/useAccesorio';
import { useFormaArreglo } from '../hooks/useFormaArreglo';
import { useMetodoPago } from '../hooks/useMetodoPago';
import type { Flor, CreateFlorDto, UpdateFlorDto } from '../types/flor.interface';
import type {
  Accesorio,
  CreateAccesorioDto,
  UpdateAccesorioDto,
} from '../types/accesorio.interface';
import type {
  FormaArreglo,
  CreateFormaArregloDto,
  UpdateFormaArregloDto,
} from '../types/forma-arreglo.interface';
import type {
  MetodoPago,
  CreateMetodoPagoDto,
  UpdateMetodoPagoDto,
} from '../types/metodo-pago.interface';
import { createFlor, updateFlor } from '../actions/flor/index';
import { createAccesorio, updateAccesorio } from '../actions/accesorio/index';
import {
  createFormaArreglo,
  updateFormaArreglo,
} from '../actions/formaArreglo/index';
import {
  createMetodoPago,
  updateMetodoPago,
} from '../actions/metodoPago/index';
import { FlorForm } from '../components/FlorForm';
import { AccesorioForm } from '../components/AccesorioForm';
import { FormaArregloForm } from '../components/FormaArregloForm';
import { MetodoPagoForm } from '../components/MetodoPagoForm';
import { MdAdd } from 'react-icons/md';

type TabType = 'flores' | 'accesorios' | 'formas' | 'metodos';

type EditingItem = Flor | Accesorio | FormaArreglo | MetodoPago | null;

const CatalogoPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem>(null);
  const queryClient = useQueryClient();

  // Derivar valores de searchParams (eliminamos useState para activeTab y searchInput)
  const activeTab = useMemo(
    () => (searchParams.get('tab') as TabType) || 'flores',
    [searchParams]
  );
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

  // Usar directamente searchQuery - solo necesitamos un input local para el debounce
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 500);
  const isUserTypingRef = useRef(false);

  // Actualizar URL cuando cambia el debounced search (único useEffect para búsqueda)
  useEffect(() => {
    if (debouncedSearch === searchQuery) {
      isUserTypingRef.current = false;
      return;
    }

    isUserTypingRef.current = true;
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }
    newParams.delete('page');
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearch, searchQuery, searchParams, setSearchParams]);

  // Sincronizar searchInput cuando cambia la URL desde fuera (navegación, etc.)
  // No sincronizar mientras el usuario está escribiendo
  useEffect(() => {
    if (!isUserTypingRef.current && searchQuery !== searchInput) {
      setSearchInput(searchQuery);
    }
  }, [searchQuery]);

  // Handler para cambiar tab (actualiza URL directamente)
  const handleTabChange = useCallback((tab: TabType) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  // Hooks para cada sección
  const {
    flores,
    totalItems: totalFlores,
    isLoading: isLoadingFlores,
    isError: isErrorFlores,
    refetch: refetchFlores,
  } = useFlor({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    estado: 'activo',
  });

  const {
    accesorios,
    totalItems: totalAccesorios,
    isLoading: isLoadingAccesorios,
    isError: isErrorAccesorios,
    refetch: refetchAccesorios,
  } = useAccesorio({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    estado: 'activo',
  });

  const {
    formasArreglo,
    totalItems: totalFormas,
    isLoading: isLoadingFormas,
    isError: isErrorFormas,
    refetch: refetchFormas,
  } = useFormaArreglo({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    activo: true,
  });

  const {
    metodosPago,
    totalItems: totalMetodos,
    isLoading: isLoadingMetodos,
    isError: isErrorMetodos,
    refetch: refetchMetodos,
  } = useMetodoPago({
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
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error('Error al crear la flor', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['flores'],
        refetchType: 'active'
      });
    },
  });

  const updateFlorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFlorDto }) =>
      updateFlor(id, data),
    onSuccess: () => {
      toast.success('Flor actualizada exitosamente');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la flor', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['flores'],
        refetchType: 'active'
      });
    },
  });

  const createAccesorioMutation = useMutation({
    mutationFn: createAccesorio,
    onSuccess: () => {
      toast.success('Accesorio creado exitosamente');
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error('Error al crear el accesorio', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['accesorios'],
        refetchType: 'active'
      });
    },
  });

  const updateAccesorioMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAccesorioDto }) =>
      updateAccesorio(id, data),
    onSuccess: () => {
      toast.success('Accesorio actualizado exitosamente');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el accesorio', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['accesorios'],
        refetchType: 'active'
      });
    },
  });

  const createFormaArregloMutation = useMutation({
    mutationFn: createFormaArreglo,
    onSuccess: () => {
      toast.success('Forma de arreglo creada exitosamente');
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error('Error al crear la forma de arreglo', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['formasArreglo'],
        refetchType: 'active'
      });
      // También invalidar arreglos ya que dependen de formas
      queryClient.invalidateQueries({ 
        queryKey: ['arreglos'],
        refetchType: 'active'
      });
    },
  });

  const updateFormaArregloMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFormaArregloDto }) =>
      updateFormaArreglo(id, data),
    onSuccess: () => {
      toast.success('Forma de arreglo actualizada exitosamente');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la forma de arreglo', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['formasArreglo'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['arreglos'],
        refetchType: 'active'
      });
    },
  });

  const createMetodoPagoMutation = useMutation({
    mutationFn: createMetodoPago,
    onSuccess: () => {
      toast.success('Método de pago creado exitosamente');
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error('Error al crear el método de pago', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['metodosPago'],
        refetchType: 'active'
      });
    },
  });

  const updateMetodoPagoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMetodoPagoDto }) =>
      updateMetodoPago(id, data),
    onSuccess: () => {
      toast.success('Método de pago actualizado exitosamente');
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el método de pago', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['metodosPago'],
        refetchType: 'active'
      });
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: EditingItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: any) => {
    const itemName =
      activeTab === 'flores'
        ? item.nombre
        : activeTab === 'accesorios'
        ? item.descripcion
        : activeTab === 'formas'
        ? item.descripcion
        : item.descripcion;

    if (window.confirm(`¿Estás seguro de que deseas desactivar ${itemName}?`)) {
      if (activeTab === 'flores') {
        updateFlorMutation.mutate({
          id: item.idFlor,
          data: { estado: 'inactivo' },
        });
      } else if (activeTab === 'accesorios') {
        updateAccesorioMutation.mutate({
          id: item.idAccesorio,
          data: { estado: 'inactivo' },
        });
      } else if (activeTab === 'formas') {
        updateFormaArregloMutation.mutate({
          id: item.idFormaArreglo,
          data: { activo: false },
        });
      } else {
        updateMetodoPagoMutation.mutate({
          id: item.idMetodoPago,
          data: { estado: 'inactivo' },
        });
      }
    }
  };

  const handleSubmit = (data: any) => {
    if (activeTab === 'flores') {
      if (editingItem) {
        updateFlorMutation.mutate({
          id: editingItem.idFlor,
          data: data as UpdateFlorDto,
        });
      } else {
        createFlorMutation.mutate(data as CreateFlorDto);
      }
    } else if (activeTab === 'accesorios') {
      if (editingItem) {
        updateAccesorioMutation.mutate({
          id: editingItem.idAccesorio,
          data: data as UpdateAccesorioDto,
        });
      } else {
        createAccesorioMutation.mutate(data as CreateAccesorioDto);
      }
    } else if (activeTab === 'formas') {
      if (editingItem) {
        updateFormaArregloMutation.mutate({
          id: editingItem.idFormaArreglo,
          data: data as UpdateFormaArregloDto,
        });
      } else {
        createFormaArregloMutation.mutate(data as CreateFormaArregloDto);
      }
    } else {
      if (editingItem) {
        updateMetodoPagoMutation.mutate({
          id: editingItem.idMetodoPago,
          data: data as UpdateMetodoPagoDto,
        });
      } else {
        createMetodoPagoMutation.mutate(data as CreateMetodoPagoDto);
      }
    }
  };

  // Columnas para cada tabla - Responsive
  const floresColumns: Column[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      priority: 'high', // Siempre visible en móvil
    },
    {
      key: 'precioUnitario',
      label: 'Precio',
      priority: 'high', // Siempre visible en móvil
      render: (value: string | number) => {
        const precio = typeof value === 'string' ? parseFloat(value) : value;
        return `C$${precio.toFixed(2)}`;
      },
    },
    {
      key: 'color',
      label: 'Color',
      priority: 'medium', // Visible en tablet y desktop
    },
    {
      key: 'tipo',
      label: 'Tipo',
      priority: 'medium', // Visible en tablet y desktop
    },
    {
      key: 'estado',
      label: 'Estado',
      priority: 'low', // Solo visible en pantallas grandes
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
      priority: 'high', // Siempre visible en móvil
    },
    {
      key: 'precioUnitario',
      label: 'Precio',
      priority: 'high', // Siempre visible en móvil
      render: (value: string | number) => {
        const precio = typeof value === 'string' ? parseFloat(value) : value;
        return `C$${precio.toFixed(2)}`;
      },
    },
    {
      key: 'categoria',
      label: 'Categoría',
      priority: 'medium', // Visible en tablet y desktop
    },
    {
      key: 'estado',
      label: 'Estado',
      priority: 'low', // Solo visible en pantallas grandes
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
      priority: 'high', // Siempre visible en móvil
    },
    {
      key: 'activo',
      label: 'Estado',
      priority: 'medium', // Visible en tablet y desktop
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
      priority: 'high', // Siempre visible en móvil
    },
    {
      key: 'tipo',
      label: 'Tipo',
      priority: 'medium', // Visible en tablet y desktop
    },
    {
      key: 'canalesDisponibles',
      label: 'Canales',
      priority: 'low', // Solo visible en pantallas grandes
      render: (value: string[]) => {
        return value?.join(', ') || 'N/A';
      },
    },
    {
      key: 'estado',
      label: 'Estado',
      priority: 'low', // Solo visible en pantallas grandes
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
      <div className="space-y-6 sm:space-y-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-title-large mb-2 sm:mb-3 text-gray-900 tracking-tight">
              Catálogo
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-light">
              Administra flores, accesorios, formas de arreglo y métodos de pago
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0"
          >
            <MdAdd className="h-5 w-5" />
            <span className="hidden sm:inline">{currentData.buttonText}</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg p-1.5 flex flex-wrap gap-2 border border-gray-200 shadow-sm">
          <button
            onClick={() => handleTabChange('flores')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'flores'
                ? 'bg-[#1E5128] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-transparent'
            }`}
          >
            Flores
          </button>
          <button
            onClick={() => handleTabChange('accesorios')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'accesorios'
                ? 'bg-[#4CAF50] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-transparent'
            }`}
          >
            Accesorios
          </button>
          <button
            onClick={() => handleTabChange('formas')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'formas'
                ? 'bg-[#4CAF50] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-transparent'
            }`}
          >
            Formas
          </button>
          <button
            onClick={() => handleTabChange('metodos')}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'metodos'
                ? 'bg-[#4CAF50] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-transparent'
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
          isLoading={
            createFlorMutation.isPending || updateFlorMutation.isPending
          }
        />
      )}
      {activeTab === 'accesorios' && (
        <AccesorioForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          accesorio={editingItem}
          onSubmit={handleSubmit}
          isLoading={
            createAccesorioMutation.isPending ||
            updateAccesorioMutation.isPending
          }
        />
      )}
      {activeTab === 'formas' && (
        <FormaArregloForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          formaArreglo={editingItem}
          onSubmit={handleSubmit}
          isLoading={
            createFormaArregloMutation.isPending ||
            updateFormaArregloMutation.isPending
          }
        />
      )}
      {activeTab === 'metodos' && (
        <MetodoPagoForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          metodoPago={editingItem}
          onSubmit={handleSubmit}
          isLoading={
            createMetodoPagoMutation.isPending ||
            updateMetodoPagoMutation.isPending
          }
        />
      )}
    </>
  );
};

export default CatalogoPage;
