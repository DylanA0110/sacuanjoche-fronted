import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import { CardsView } from '@/shared/components/Custom/CardsView';
import type { CardItem } from '@/shared/components/Custom/CardsView';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useArreglo } from '../hook/useArreglo';
import type {
  Arreglo,
  CreateArregloDto,
  UpdateArregloDto,
} from '../types/arreglo.interface';
import { createArreglo, updateArreglo, getArregloMedia } from '../actions';
import { deleteArregloMedia } from '../actions/arregloMedia';
import supabase from '@/shared/utils/supabase';
import { ArregloForm } from '../components/ArregloForm';
import type { ArregloAssociationsPayload } from '../types/arreglo-insumos.interface';
import { saveArregloInsumos } from '../actions';
import { ArregloDetailsModal } from '../components/ArregloDetailsModal';
import { MdAdd, MdSearch } from 'react-icons/md';
import { useDebounce } from '@/shared/hooks/useDebounce';

const ArreglosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedArreglo, setSelectedArreglo] = useState<Arreglo | null>(null);
  const [editingArreglo, setEditingArreglo] = useState<Arreglo | null>(null);
  const queryClient = useQueryClient();

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

  // Usar directamente searchQuery - no necesitamos searchInput local
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 500);

  // Actualizar URL cuando cambia el debounced search (único useEffect necesario)
  useEffect(() => {
    if (debouncedSearch === searchQuery) return;

    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }
    newParams.delete('page');
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearch, searchQuery, searchParams, setSearchParams]);

  // Sincronizar searchInput cuando cambia la URL (solo si es diferente)
  useEffect(() => {
    if (searchQuery !== searchInput) {
      setSearchInput(searchQuery);
    }
  }, [searchQuery, searchInput]);

  const { arreglos, totalItems, isLoading, isError, refetch } = useArreglo({
    usePagination: true,
    limit,
    offset,
    q: searchQuery || undefined,
    estado: 'activo',
  });

  const createArregloMutation = useMutation({
    mutationFn: createArreglo,
    onSuccess: (newArreglo) => {
      toast.success(
        'Arreglo creado exitosamente. Ahora puedes agregar imágenes.'
      );
      // Mantener el formulario abierto y actualizar el arreglo para que puedan subir imágenes
      setEditingArreglo(newArreglo);
    },
    onError: (error: any) => {
      toast.error('Error al crear el arreglo', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['arreglos'],
        refetchType: 'active',
      });
    },
  });

  const updateArregloMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateArregloDto }) =>
      updateArreglo(id, data),
    onSuccess: () => {
      toast.success('Arreglo actualizado exitosamente');
      setIsFormOpen(false);
      setEditingArreglo(null);
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el arreglo', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['arreglos'],
        refetchType: 'active',
      });
      // También invalidar media relacionada
      queryClient.invalidateQueries({
        queryKey: ['arregloMedia'],
        refetchType: 'active',
      });
    },
  });

  const deleteArregloMutation = useMutation({
    mutationFn: async (id: number) => {
      // 1. Obtener todas las imágenes del arreglo
      let mediaList: any[] = [];
      try {
        mediaList = await getArregloMedia(id);
      } catch (error) {
        // Silently fail if media cannot be retrieved
      }

      // 2. Eliminar todas las imágenes del backend y de Supabase
      const deletePromises: Promise<any>[] = [];

      for (const media of mediaList) {
        if (media.idArregloMedia) {
          // Eliminar del backend
          deletePromises.push(
            deleteArregloMedia(id, media.idArregloMedia).catch(() => {
              // Silently fail if deletion fails
            })
          );

          // Eliminar de Supabase Storage
          if (media.objectKey) {
            deletePromises.push(
              supabase.storage
                .from('CatalogoFloristeria')
                .remove([media.objectKey])
                .then(() => {
                  // Silently succeed
                })
            );
          } else if (media.url) {
            // Intentar extraer el path de la URL
            const urlMatch = media.url.match(
              /\/storage\/v1\/object\/public\/CatalogoFloristeria\/(.+)$/
            );
            if (urlMatch) {
              const filePath = urlMatch[1];
              deletePromises.push(
                supabase.storage
                  .from('CatalogoFloristeria')
                  .remove([filePath])
                  .then(() => {
                    // Silently succeed
                  })
              );
            }
          }
        }
      }

      // Esperar a que se eliminen todas las imágenes
      await Promise.all(deletePromises);

      // 3. Desactivar el arreglo
      return updateArreglo(id, { estado: 'inactivo' });
    },
    onSuccess: () => {
      toast.success(
        'Arreglo desactivado y todas sus imágenes eliminadas exitosamente'
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['arreglos'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['arregloMedia'],
        refetchType: 'active',
      });
    },
    onError: (error: any) => {
      toast.error('Error al desactivar el arreglo', {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    },
  });

  const handleCreate = useCallback(() => {
    setEditingArreglo(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((item: CardItem) => {
    const arreglo = item as unknown as Arreglo;
    setEditingArreglo(arreglo);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    (item: CardItem) => {
      const arreglo = item as unknown as Arreglo;
      if (
        window.confirm(
          `¿Estás seguro de que deseas desactivar el arreglo "${arreglo.nombre}"?`
        )
      ) {
        deleteArregloMutation.mutate(arreglo.idArreglo);
      }
    },
    [deleteArregloMutation]
  );

  const handleViewDetails = useCallback((item: CardItem) => {
    const arreglo = item as unknown as Arreglo;
    setSelectedArreglo(arreglo);
    setIsDetailsOpen(true);
  }, []);

  const handleSubmit = async (
    data: CreateArregloDto | UpdateArregloDto,
    associations: ArregloAssociationsPayload
  ) => {
    try {
      if (editingArreglo) {
        // Update básico del arreglo
        await updateArregloMutation.mutateAsync({
          id: editingArreglo.idArreglo,
          data: data as UpdateArregloDto,
        });

        // Guardar asociaciones en un solo payload
        await saveArregloInsumos(editingArreglo.idArreglo, associations);

        // Refrescar
        queryClient.invalidateQueries({ queryKey: ['arreglos'] });
        refetch();
        setIsFormOpen(false);
        setEditingArreglo(null);
        toast.success('Asociaciones guardadas');
      } else {
        // Crear arreglo y luego asociaciones
        const created = await createArregloMutation.mutateAsync(
          data as CreateArregloDto
        );
        await saveArregloInsumos(created.idArreglo, associations);

        // Mantener formulario abierto con el creado para subir imágenes
        setEditingArreglo(created);
        toast.success('Flores y accesorios asociados');
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.message || 'Error al guardar';
      toast.error(msg);
    }
  };

  // Memoizar cardData para evitar recálculos innecesarios
  const cardData: CardItem[] = useMemo(
    () =>
      arreglos.map((arreglo) => {
        // Obtener imagen principal o primera imagen
        const primaryImage =
          arreglo.media?.find((m) => m.isPrimary) || arreglo.media?.[0];

        return {
          id: arreglo.idArreglo,
          imageUrl: primaryImage?.url,
          title: arreglo.nombre,
          subtitle: arreglo.formaArreglo?.descripcion,
          price: arreglo.precioUnitario,
          status: arreglo.estado,
          ...arreglo,
        };
      }),
    [arreglos]
  );

  return (
    <>
      <div className="space-y-4 sm:space-y-6 w-full">
        {/* Header limpio y profesional */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-title-large mb-2 sm:mb-3 text-gray-900 tracking-tight">
              Arreglos
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-light">
              Gestiona el catálogo y existencias de tus arreglos
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="gap-2 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 bg-[#50C878] hover:bg-[#63d68b] text-white shadow-md shadow-[#50C878]/30 transition-colors duration-150 font-sans rounded-lg"
          >
            <MdAdd className="h-5 w-5" />
            <span className="hidden sm:inline">Nuevo Arreglo</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>

        {/* Card con la tabla */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl shadow-black/10 rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 sm:pb-5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 border-b border-gray-100">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Listado de Arreglos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
            {/* Barra de búsqueda */}
            <div className="mb-6">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, descripción o forma..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/20 text-sm transition-all duration-200"
                />
              </div>
            </div>

            <CardsView
              items={cardData}
              onView={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
              isError={isError}
            />

            {/* Paginación */}
            {totalItems && totalItems > 0 && (
              <div className="mt-6 px-4 sm:px-6 md:px-8 py-4 border-t border-gray-200 bg-white rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 text-center sm:text-left font-medium">
                  Mostrando{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min(currentPage * limit - limit + 1, totalItems)}
                  </span>{' '}
                  -{' '}
                  <span className="font-semibold text-gray-900">
                    {Math.min(currentPage * limit, totalItems)}
                  </span>{' '}
                  de{' '}
                  <span className="font-semibold text-gray-900">
                    {totalItems}
                  </span>
                </p>
                <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (currentPage > 1) {
                        newParams.set('page', String(currentPage - 1));
                      } else {
                        newParams.delete('page');
                      }
                      setSearchParams(newParams, { replace: true });
                    }}
                    disabled={currentPage === 1}
                    className="border-gray-200 text-gray-700 hover:bg-[#50C878]/10 hover:border-[#50C878]/40 hover:text-[#50C878] text-sm font-medium h-9 px-4 flex-1 sm:flex-initial transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('page', String(currentPage + 1));
                      setSearchParams(newParams, { replace: true });
                    }}
                    disabled={currentPage * limit >= totalItems}
                    className="border-gray-200 text-gray-700 hover:bg-[#50C878]/10 hover:border-[#50C878]/40 hover:text-[#50C878] text-sm font-medium h-9 px-4 flex-1 sm:flex-initial transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Arreglo */}
      <ArregloForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        arreglo={editingArreglo}
        onSubmit={handleSubmit}
        isLoading={
          createArregloMutation.isPending || updateArregloMutation.isPending
        }
      />

      {/* Modal de Detalles */}
      <ArregloDetailsModal
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        arreglo={selectedArreglo}
      />
    </>
  );
};

export default ArreglosPage;
