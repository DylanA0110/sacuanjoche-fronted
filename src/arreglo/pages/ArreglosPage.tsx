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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useArreglo } from '../hook/useArreglo';
import type {
  Arreglo,
  CreateArregloDto,
  UpdateArregloDto,
} from '../types/arreglo.interface';
import { createArreglo, updateArreglo, getArregloMedia } from '../actions';
import { ArregloForm } from '../components/ArregloForm';
import type { ArregloAssociationsPayload } from '../types/arreglo-insumos.interface';
import { saveArregloInsumos } from '../actions';
import { ArregloDetailsModal } from '../components/ArregloDetailsModal';
import { MdAdd, MdImage, MdVisibility } from 'react-icons/md';

const columns: Column[] = [
  {
    key: 'nombre',
    label: 'Nombre',
  },
  {
    key: 'formaArreglo',
    label: 'Forma',
    render: (_value, row: Arreglo) => row.formaArreglo?.descripcion || 'N/A',
  },
  // cantidadFlores removido del modelo; si se desea mostrar, podría calcularse desde asociaciones
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

const ArreglosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedArreglo, setSelectedArreglo] = useState<Arreglo | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [editingArreglo, setEditingArreglo] = useState<Arreglo | null>(null);
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

  const { arreglos, totalItems, isLoading, isError, error, refetch } =
    useArreglo({
      usePagination: true,
      limit,
      offset,
      q: searchQuery || undefined,
      estado: 'activo',
    });

  useEffect(() => {
    if (isError && error) {
      console.error('Error en ArreglosPage:', error);
    }
  }, [isError, error]);

  const createArregloMutation = useMutation({
    mutationFn: createArreglo,
    onSuccess: (newArreglo) => {
      toast.success(
        'Arreglo creado exitosamente. Ahora puedes subir imágenes.'
      );
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      refetch();
      // Mantener el formulario abierto y actualizar el arreglo para que puedan subir imágenes
      setEditingArreglo(newArreglo);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Error al crear el arreglo'
      );
    },
  });

  const updateArregloMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateArregloDto }) =>
      updateArreglo(id, data),
    onSuccess: () => {
      toast.success('Arreglo actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      refetch();
      setIsFormOpen(false);
      setEditingArreglo(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Error al actualizar el arreglo'
      );
    },
  });

  const deleteArregloMutation = useMutation({
    mutationFn: (id: number) => updateArreglo(id, { estado: 'inactivo' }),
    onSuccess: () => {
      toast.success('Arreglo desactivado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Error al desactivar el arreglo'
      );
    },
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  const handleCreate = () => {
    setEditingArreglo(null);
    setIsFormOpen(true);
  };

  const handleEdit = (arreglo: Arreglo) => {
    setEditingArreglo(arreglo);
    setIsFormOpen(true);
  };

  const handleDelete = (arreglo: Arreglo) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas desactivar el arreglo "${arreglo.nombre}"?`
      )
    ) {
      deleteArregloMutation.mutate(arreglo.idArreglo);
    }
  };

  const handleViewDetails = (arreglo: Arreglo) => {
    setSelectedArreglo(arreglo);
    setIsDetailsOpen(true);
  };

  const handleViewGallery = async (arreglo: Arreglo) => {
    setSelectedArreglo(arreglo);
    try {
      const media = await getArregloMedia(arreglo.idArreglo);
      setGalleryImages(media);
      setIsGalleryOpen(true);
    } catch (error: any) {
      console.error('Error al cargar imágenes:', error);
      toast.error('Error al cargar las imágenes del arreglo');
      setGalleryImages(arreglo.media || []);
      setIsGalleryOpen(true);
    }
  };

  const handleSubmit = async (
    data: CreateArregloDto | UpdateArregloDto,
    associations: ArregloAssociationsPayload
  ) => {
    try {
      if (editingArreglo) {
        // Update básico del arreglo
        const updated = await updateArregloMutation.mutateAsync({
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
      const msg = e?.response?.data?.message || e?.message || 'Error al guardar';
      toast.error(msg);
    }
  };

  const tableData = arreglos.map((arreglo) => ({
    ...arreglo,
    id: arreglo.idArreglo,
  }));

  const newLocal = "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity";
  return (
    <>
      <div className="space-y-6 sm:space-y-8 w-full max-w-full mx-auto px-2 sm:px-0">
        {/* Header Premium */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 text-gray-900 font-hero tracking-tight">
              Arreglos
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">
              Administra los arreglos florales de tu catálogo
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-2xl shadow-[#50C878]/50 gap-2 h-11 sm:h-12 px-5 sm:px-6 text-sm sm:text-base font-semibold whitespace-nowrap shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-[#50C878]/60"
          >
            <MdAdd className="h-5 w-5" />
            <span className="hidden sm:inline">Agregar Arreglo</span>
            <span className="sm:hidden">Agregar</span>
          </Button>
        </div>

        {/* Card con la tabla - Premium Glassmorphism */}
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl shadow-black/10 rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 sm:pb-5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 border-b border-gray-100">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Listado de Arreglos
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-6">
            <DataTable
              columns={columns}
              data={tableData}
              searchPlaceholder="Buscar por nombre, descripción o forma..."
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
              customActions={(item: Arreglo) => (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewDetails(item)}
                    className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 bg-transparent hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-110 border-0"
                    title="Ver detalles"
                  >
                    <MdVisibility className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewGallery(item)}
                    className="h-9 w-9 p-0 text-[#50C878] hover:text-[#50C878] bg-transparent hover:bg-[#50C878]/10 rounded-full transition-all duration-200 hover:scale-110 border-0"
                    title="Ver galería"
                  >
                    <MdImage className="h-4 w-4" />
                  </Button>
                </div>
              )}
            />
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

      {/* Galería de Imágenes */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Galería de Imágenes
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              {selectedArreglo?.nombre} • {galleryImages.length}{' '}
              {galleryImages.length === 1 ? 'imagen' : 'imágenes'}
            </p>
          </DialogHeader>
          <div className="mt-6">
            {galleryImages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <MdImage className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  No hay imágenes para este arreglo
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Sube imágenes desde el formulario de edición
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={image.idMedia || index} className="relative group">
                    <div className="aspect-square w-full overflow-hidden rounded-xl border-2 border-gray-200 hover:border-[#50C878] transition-all duration-200 bg-gray-50">
                      <img
                        src={image.url}
                        alt={image.altText || `Imagen ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    {image.isPrimary && (
                      <span className="absolute top-2 left-2 bg-[#50C878] text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-md">
                        Principal
                      </span>
                    )}
                    {image.altText && (
                      <div className={newLocal}>
                        <p className="text-white text-xs truncate">
                          {image.altText}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ArreglosPage;
