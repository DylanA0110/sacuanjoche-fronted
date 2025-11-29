import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTablePagination } from '@/shared/hooks/useTablePagination';
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
import { PaginationControls } from '@/shared/components/Custom/PaginationControls';

const ArreglosPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedArreglo, setSelectedArreglo] = useState<Arreglo | null>(null);
  const [editingArreglo, setEditingArreglo] = useState<Arreglo | null>(null);
  const queryClient = useQueryClient();

  // Hook de paginación general
  const pagination = useTablePagination(0);

  // Obtener arreglos con paginación usando valores del hook
  const { arreglos, totalItems, isLoading, isError, refetch } = useArreglo({
    usePagination: true,
    limit: pagination.limit,
    offset: pagination.offset,
    q: pagination.searchQuery || undefined,
    estado: 'activo',
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
      <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full overflow-x-hidden">
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
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-500 focus:border-[#50C878] focus:ring-2 focus:ring-[#50C878]/40 text-base transition-all duration-200"
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
              <PaginationControls
                currentPage={finalPagination.page}
                totalPages={finalPagination.totalPages}
                itemsPerPage={finalPagination.limit}
                totalItems={totalItems}
                onPageChange={finalPagination.setPage}
                onLimitChange={finalPagination.setLimit}
              />
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
