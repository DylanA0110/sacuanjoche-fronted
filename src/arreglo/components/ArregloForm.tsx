import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { SearchableSelect } from '@/shared/components/Custom/SearchableSelect';
import { useFlor } from '@/catalogo/hooks/useFlor';
import { useAccesorio } from '@/catalogo/hooks/useAccesorio';
import type { ArregloAssociationsPayload } from '../types/arreglo-insumos.interface';
import { useFormaArreglo } from '@/catalogo/hooks/useFormaArreglo';
import type {
  Arreglo,
  CreateArregloDto,
  UpdateArregloDto,
} from '../types/arreglo.interface';
import { MdSave, MdImage, MdClose, MdStar, MdStarBorder, MdInfo } from 'react-icons/md';
import { toast } from 'sonner';
import { useArregloImages } from '../hook/useArregloImages';
import { useArregloAssociations } from '../hook/useArregloAssociations';
import {
  validatePrecioArreglo,
  validateDescripcion,
  calcularPrecioSugeridoArreglo,
  validateCantidadTotalFlores,
  validateCantidadTotalAccesorios,
} from '@/shared/utils/validation';

interface ArregloFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arreglo?: Arreglo | null;
  onSubmit: (
    data: CreateArregloDto | UpdateArregloDto,
    associations: ArregloAssociationsPayload
  ) => void;
  isLoading?: boolean;
}

interface FormValues {
  idFormaArreglo: number;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
}

export function ArregloForm({
  open,
  onOpenChange,
  arreglo,
  onSubmit,
  isLoading = false,
}: ArregloFormProps) {
  // Hook del formulario principal
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      idFormaArreglo: 0,
      nombre: '',
      descripcion: '',
      precioUnitario: 0,
    },
    mode: 'onChange',
  });

  const formValues = watch();
  const [precioInput, setPrecioInput] = useState('');

  const { formasArreglo } = useFormaArreglo({ activo: true });
  const { flores } = useFlor({ estado: 'activo' });
  const { accesorios } = useAccesorio({ estado: 'activo' });

  // Custom hooks para gestión de imágenes y asociaciones
  const {
    imagesState,
    fileInputRef,
    saveImages,
    setPrimaryImage,
    removeImage,
    handleDrag,
    handleDrop,
    handleFileSelect,
    setImages,
    convertMediaToUploadedImage,
  } = useArregloImages({
    arregloId: arreglo?.idArreglo,
  });

  const {
    associations,
    totalFlores,
    addFlor,
    removeFlor,
    addAccesorio,
    removeAccesorio,
    updateFlorCantidad,
    updateAccesorioCantidad,
    setFlorSelectedId,
    setAccesorioSelectedId,
    reset: resetAssociations,
  } = useArregloAssociations({
    arregloId: arreglo?.idArreglo,
    flores,
    accesorios,
  });

  // Calcular precio sugerido cuando se edita (después de que associations esté inicializado)
  const precioSugerido = useMemo(() => {
    if (!arreglo || associations.flores.list.length === 0) return null;
    
    const floresConPrecio = associations.flores.list.map((f) => {
      const florInfo = flores.find((fl) => fl.idFlor === f.idFlor);
      return {
        precioUnitario: typeof florInfo?.precioUnitario === 'string' 
          ? parseFloat(florInfo.precioUnitario) 
          : (florInfo?.precioUnitario || 0),
        cantidad: f.cantidad,
      };
    });
    
    const accesoriosConPrecio = associations.accesorios.list.map((a) => {
      const accInfo = accesorios.find((acc) => acc.idAccesorio === a.idAccesorio);
      return {
        precioUnitario: typeof accInfo?.precioUnitario === 'string'
          ? parseFloat(accInfo.precioUnitario)
          : (accInfo?.precioUnitario || 0),
        cantidad: a.cantidad,
      };
    });
    
    return calcularPrecioSugeridoArreglo(floresConPrecio, accesoriosConPrecio);
  }, [arreglo, associations, flores, accesorios]);

  const formaArregloOptions = formasArreglo.map((forma) => ({
    value: String(forma.idFormaArreglo),
    label: forma.descripcion,
  }));

  const florOptions = flores.map((flor) => {
    const isSelected = associations.flores.list.some(
      (f) => f.idFlor === flor.idFlor
    );
    const selectedItem = associations.flores.list.find(
      (f) => f.idFlor === flor.idFlor
    );
    return {
      value: String(flor.idFlor),
      label: flor.nombre,
      subtitle: flor.color ? `Color: ${flor.color}` : undefined,
      isSelected,
      disabled: isSelected,
      metadata: {
        color: flor.color,
        cantidad: selectedItem?.cantidad,
      },
    };
  });

  const accesorioOptions = accesorios.map((acc) => {
    const isSelected = associations.accesorios.list.some(
      (a) => a.idAccesorio === acc.idAccesorio
    );
    const selectedItem = associations.accesorios.list.find(
      (a) => a.idAccesorio === acc.idAccesorio
    );
    return {
      value: String(acc.idAccesorio),
      label: acc.descripcion,
      subtitle: acc.categoria ? `Categoria: ${acc.categoria}` : undefined,
      isSelected,
      disabled: isSelected,
      metadata: {
        categoria: acc.categoria,
        cantidad: selectedItem?.cantidad,
      },
    };
  });

  // Optimizado: Eliminada duplicación de conversión de imágenes
  useEffect(() => {
    if (arreglo) {
      const precio =
        typeof arreglo.precioUnitario === 'string'
          ? parseFloat(arreglo.precioUnitario)
          : arreglo.precioUnitario;
      reset({
        idFormaArreglo: arreglo.idFormaArreglo,
        nombre: arreglo.nombre,
        descripcion: arreglo.descripcion,
        precioUnitario: precio,
      });
      setPrecioInput(precio.toString());

      // Convertir imágenes del arreglo (función única, sin duplicación)
      if (arreglo.media && arreglo.media.length > 0) {
        const convertedImages = arreglo.media.map(convertMediaToUploadedImage);
        setImages(convertedImages);
      } else {
        setImages([]);
      }
    } else {
      reset({
        idFormaArreglo: 0,
        nombre: '',
        descripcion: '',
        precioUnitario: 0,
      });
      setPrecioInput('');
      setImages([]);
      resetAssociations();
    }
  }, [
    arreglo,
    open,
    reset,
    convertMediaToUploadedImage,
    setImages,
    resetAssociations,
  ]);

  const onSubmitForm = async (data: FormValues) => {
    // Validaciones adicionales
    if (data.idFormaArreglo === 0) {
      toast.error('Debes seleccionar una forma de arreglo');
      return;
    }

    // Validar descripción
    const descripcionError = validateDescripcion(data.descripcion, 500);
    if (descripcionError) {
      toast.error(descripcionError);
      return;
    }

    // Validar precio
    const precioError = validatePrecioArreglo(data.precioUnitario);
    if (precioError) {
      toast.error(precioError);
      return;
    }

    if (associations.flores.list.length === 0) {
      toast.error('Agrega al menos una flor al arreglo');
      return;
    }

    // Validar cantidad total de flores (3-50)
    const errorFlores = validateCantidadTotalFlores(associations.flores.list);
    if (errorFlores) {
      toast.error(errorFlores);
      return;
    }

    // Validar cantidad total de accesorios (1-15)
    const errorAccesorios = validateCantidadTotalAccesorios(
      associations.accesorios.list
    );
    if (errorAccesorios) {
      toast.error(errorAccesorios);
      return;
    }

    const dataToSubmit: CreateArregloDto | UpdateArregloDto = arreglo
      ? data
      : { ...data, estado: 'activo' as 'activo' };

    // Preparar asociaciones
    const associationsPayload: ArregloAssociationsPayload = {
      accesorios: associations.accesorios.list.map(
        ({ idAccesorio, cantidad }) => ({
          idAccesorio,
          cantidad: cantidad > 0 ? cantidad : 1,
        })
      ),
      flores: associations.flores.list.map(({ idFlor, cantidad }) => ({
        idFlor,
        cantidad: cantidad > 0 ? cantidad : 1,
      })),
    };

    // Enviar datos (solo el arreglo, sin imágenes)
    onSubmit(dataToSubmit, associationsPayload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#50C878] to-[#3aa85c] flex items-center justify-center">
              <MdImage className="h-5 w-5 text-white" />
            </div>
            {arreglo ? 'Editar Arreglo' : 'Nuevo Arreglo'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {arreglo
              ? 'Modifica la información del arreglo'
              : 'Completa los datos para crear un nuevo arreglo'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 py-4">
          {/* Información Básica */}
          <div className="space-y-4 p-6 bg-linear-to-br from-white to-gray-50/50 rounded-xl border-2 border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 tracking-wide flex items-center gap-2">
              <div className="w-1 h-5 bg-linear-to-b from-[#50C878] to-[#00A87F] rounded-full" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="idFormaArreglo"
                  className="text-sm font-semibold text-gray-700"
                >
                  Forma de Arreglo *
                </Label>
                <SearchableSelect
                  options={formaArregloOptions}
                  value={
                    formValues.idFormaArreglo
                      ? String(formValues.idFormaArreglo)
                      : undefined
                  }
                  onChange={(value) =>
                    setValue('idFormaArreglo', parseInt(value, 10))
                  }
                  placeholder="Selecciona una forma de arreglo"
                  searchPlaceholder="Buscar forma de arreglo..."
                  emptyText="No se encontraron formas de arreglo"
                />
                {errors.idFormaArreglo && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.idFormaArreglo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="precioUnitario"
                  className="text-sm font-semibold text-gray-700"
                >
                  Precio Unitario * (C$150 - C$15,000)
                </Label>
                {arreglo && precioSugerido && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg mb-2">
                    <MdInfo className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-800">
                        Precio sugerido basado en flores y accesorios: <span className="font-semibold">C${precioSugerido.toFixed(2)}</span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const precioFinal = Math.max(150, Math.min(15000, precioSugerido));
                        setPrecioInput(precioFinal.toString());
                        setValue('precioUnitario', precioFinal);
                      }}
                      className="text-xs h-7 px-2"
                    >
                      Usar
                    </Button>
                  </div>
                )}
                <Input
                  id="precioUnitario"
                  type="text"
                  inputMode="decimal"
                  value={precioInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setPrecioInput(value);
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        setValue('precioUnitario', numValue);
                      } else if (value === '') {
                        setValue('precioUnitario', 0);
                      }
                    }
                  }}
                  placeholder="150.00"
                  className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/40"
                />
                <p className="text-xs text-gray-500">Precio en córdobas (C$150 - C$15,000)</p>
                {errors.precioUnitario && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.precioUnitario.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="nombre"
                className="text-sm font-semibold text-gray-700"
              >
                Nombre del Arreglo *
              </Label>
              <Input
                id="nombre"
                {...register('nombre', {
                  required: 'El nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres',
                  },
                  maxLength: {
                    value: 100,
                    message: 'El nombre debe tener máximo 100 caracteres',
                  },
                })}
                placeholder="Ramo de Rosas Rojas"
                className="bg-white border-gray-300 text-gray-900 focus:border-[#50C878] focus:ring-[#50C878]/20"
              />
              {errors.nombre && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="descripcion"
                className="text-sm font-semibold text-gray-700"
              >
                Descripción * (máximo 500 caracteres)
              </Label>
              <textarea
                id="descripcion"
                {...register('descripcion', {
                  required: 'La descripción es requerida',
                  maxLength: {
                    value: 500,
                    message: 'La descripción debe tener máximo 500 caracteres',
                  },
                  validate: (value) => {
                    const error = validateDescripcion(value, 500);
                    return error || true;
                  },
                })}
                placeholder="Hermoso ramo de rosas rojas para ocasiones especiales..."
                className="w-full min-h-[100px] px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#50C878]/40 focus:border-[#50C878] transition-all duration-200 resize-y"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {watch('descripcion')?.length || 0} / 500 caracteres
                </p>
                {errors.descripcion && (
                  <p className="text-sm text-red-500">
                    {errors.descripcion.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Indicador visual del total de flores (no se envía al backend) */}
          {associations.flores.list.length > 0 && (
            <div className="space-y-1">
              <Label className="text-sm font-semibold text-gray-700">
                Total de Flores seleccionadas
              </Label>
              <div className="px-3 py-2 rounded-lg border-2 border-[#50C878]/30 bg-[#50C878]/5 text-sm font-semibold text-[#16804a]">
                {totalFlores} flor{totalFlores === 1 ? '' : 'es'}
              </div>
            </div>
          )}

          {/* Flores del Arreglo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Flores del Arreglo
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <SearchableSelect
                  options={florOptions.map(
                    ({ isSelected, disabled, metadata, ...opt }) => ({
                      ...opt,
                      disabled,
                    })
                  )}
                  value={associations.flores.selectedId}
                  onChange={setFlorSelectedId}
                  placeholder="Selecciona una flor"
                  searchPlaceholder="Buscar flor..."
                  emptyText="No se encontraron flores"
                  className={
                    associations.flores.selectedId &&
                    associations.flores.list.some(
                      (f) => String(f.idFlor) === associations.flores.selectedId
                    )
                      ? 'border-[#50C878] bg-[#50C878]/10 ring-2 ring-[#50C878]/20'
                      : associations.flores.selectedId
                      ? 'border-[#50C878] bg-[#50C878]/5'
                      : ''
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  min={1}
                  value={associations.flores.cantidad}
                  onChange={(e) =>
                    updateFlorCantidad(
                      Math.max(1, parseInt(e.target.value || '1', 10))
                    )
                  }
                  placeholder="Cant."
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={() => {
                    const error = addFlor();
                    if (error) {
                      toast.error(error);
                    }
                  }}
                  className="w-full"
                >
                  Agregar
                </Button>
              </div>
            </div>
            {associations.flores.list.length > 0 && (
              <div className="mt-2 border-2 border-[#50C878]/30 rounded-lg divide-y divide-[#50C878]/10 bg-linear-to-br from-[#50C878]/10 to-[#50C878]/5 shadow-sm">
                {associations.flores.list.map((f) => {
                  const florInfo = flores.find((fl) => fl.idFlor === f.idFlor);
                  const isSelected =
                    associations.flores.selectedId === String(f.idFlor);
                  return (
                    <div
                      key={f.idFlor}
                      className={`flex items-center justify-between px-4 py-3 transition-all ${
                        isSelected
                          ? 'bg-[#50C878]/20 border-l-4 border-[#50C878]'
                          : 'hover:bg-[#50C878]/15'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {florInfo?.color ? (
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-md ring-2 ring-[#50C878]/30"
                            style={{ backgroundColor: florInfo.color }}
                            title={florInfo.color}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-200 shadow-sm" />
                        )}
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-gray-900">
                            {f.nombre}
                          </span>
                          <span className="text-xs text-gray-600">
                            Cantidad:{' '}
                            <span className="font-semibold text-[#50C878]">
                              {f.cantidad}
                            </span>
                            {florInfo?.color && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/60 text-gray-700 text-[10px]">
                                {florInfo.color}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeFlor(f.idFlor)}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all shrink-0"
                      >
                        Quitar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accesorios del Arreglo */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">
              Accesorios del Arreglo
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-8">
                <SearchableSelect
                  options={accesorioOptions.map(
                    ({ isSelected, disabled, metadata, ...opt }) => ({
                      ...opt,
                      disabled,
                    })
                  )}
                  value={associations.accesorios.selectedId}
                  onChange={setAccesorioSelectedId}
                  placeholder="Selecciona un accesorio"
                  searchPlaceholder="Buscar accesorio..."
                  emptyText="No se encontraron accesorios"
                  className={
                    associations.accesorios.selectedId &&
                    associations.accesorios.list.some(
                      (a) =>
                        String(a.idAccesorio) ===
                        associations.accesorios.selectedId
                    )
                      ? 'border-[#50C878] bg-[#50C878]/10 ring-2 ring-[#50C878]/20'
                      : associations.accesorios.selectedId
                      ? 'border-[#50C878] bg-[#50C878]/5'
                      : ''
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  type="number"
                  min={1}
                  value={associations.accesorios.cantidad}
                  onChange={(e) =>
                    updateAccesorioCantidad(
                      Math.max(1, parseInt(e.target.value || '1', 10))
                    )
                  }
                  placeholder="Cant."
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  onClick={() => {
                    const error = addAccesorio();
                    if (error) {
                      toast.error(error);
                    }
                  }}
                  className="w-full"
                >
                  Agregar
                </Button>
              </div>
            </div>
            {associations.accesorios.list.length > 0 && (
              <div className="mt-2 border-2 border-[#50C878]/30 rounded-lg divide-y divide-[#50C878]/10 bg-linear-to-br from-[#50C878]/10 to-[#50C878]/5 shadow-sm">
                {associations.accesorios.list.map((a) => {
                  const accInfo = accesorios.find(
                    (acc) => acc.idAccesorio === a.idAccesorio
                  );
                  const isSelected =
                    associations.accesorios.selectedId ===
                    String(a.idAccesorio);
                  return (
                    <div
                      key={a.idAccesorio}
                      className={`flex items-center justify-between px-4 py-3 transition-all ${
                        isSelected
                          ? 'bg-[#50C878]/20 border-l-4 border-[#50C878]'
                          : 'hover:bg-[#50C878]/15'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-6 h-6 rounded-full bg-[#50C878] border-2 border-white shadow-md ring-2 ring-[#50C878]/30" />
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-gray-900">
                            {a.nombre}
                          </span>
                          <span className="text-xs text-gray-600">
                            Cantidad:{' '}
                            <span className="font-semibold text-[#50C878]">
                              {a.cantidad}
                            </span>
                            {accInfo?.categoria && (
                              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/60 text-gray-700 text-[10px]">
                                {accInfo.categoria}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeAccesorio(a.idAccesorio)}
                        className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all shrink-0"
                      >
                        Quitar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Galería de Imágenes */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <MdImage className="h-5 w-5 text-[#50C878]" />
                Imágenes del Arreglo
              </h2>
              {imagesState.images.length > 0 && (
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {imagesState.images.length}{' '}
                  {imagesState.images.length === 1 ? 'imagen' : 'imágenes'}
                </span>
              )}
            </div>

            {/* Drag & Drop Zone */}
            {arreglo?.idArreglo ? (
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 mb-6 ${
                  imagesState.dragActive
                    ? 'border-[#50C878] bg-[#50C878]/10'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                } ${
                  imagesState.uploading || imagesState.processing
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => {
                  if (!imagesState.uploading && !imagesState.processing) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={imagesState.uploading || imagesState.processing}
                />
                <div className="space-y-4">
                  {imagesState.processing ? (
                    <>
                      <div className="w-12 h-12 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Procesando y comprimiendo imágenes...
                        </p>
                      </div>
                    </>
                  ) : imagesState.uploading ? (
                    <>
                      <div className="w-12 h-12 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Subiendo imágenes...
                        </p>
                        {Object.keys(imagesState.progress).length > 0 && (
                          <div className="w-full max-w-xs mx-auto mt-4">
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#50C878] transition-all duration-300"
                                style={{
                                  width: `${
                                    Object.values(imagesState.progress).reduce(
                                      (a, b) => a + b,
                                      0
                                    ) / Object.keys(imagesState.progress).length
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <MdImage className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Arrastra las imágenes aquí
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          o haz clic para buscar
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WebP hasta 5MB cada una • Se comprimirán
                        automáticamente
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <MdImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">
                    Guarda el arreglo primero
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Luego podrás subir imágenes
                  </p>
                </div>
              </div>
            )}

            {/* Current Images */}
            {imagesState.images.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Imágenes actuales ({imagesState.images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {imagesState.images.map((image, index) => (
                    <div
                      key={image.id || `image-${index}`}
                      className="relative group bg-white rounded-lg border-2 overflow-hidden transition-all duration-200 hover:border-[#50C878]/50 hover:shadow-md"
                      style={{
                        borderColor: image.isPrimary ? '#50C878' : '#e5e7eb',
                      }}
                    >
                      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden flex items-center justify-center">
                        <img
                          src={image.url}
                          alt={image.altText || `Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>

                      {/* Botones de acción */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        {/* Botón marcar como principal */}
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className={`p-1.5 rounded-full shadow-lg transition-all duration-200 ${
                            image.isPrimary
                              ? 'bg-[#50C878] text-white'
                              : 'bg-white text-gray-600 hover:bg-[#50C878] hover:text-white'
                          }`}
                          title={
                            image.isPrimary
                              ? 'Imagen principal'
                              : 'Marcar como principal'
                          }
                        >
                          {image.isPrimary ? (
                            <MdStar className="h-4 w-4" />
                          ) : (
                            <MdStarBorder className="h-4 w-4" />
                          )}
                        </button>

                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={() => {
                            removeImage(index);
                          }}
                          className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors duration-200"
                          title="Eliminar imagen"
                        >
                          <MdClose className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Badge de imagen principal */}
                      {image.isPrimary && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="inline-flex items-center gap-1 bg-[#50C878] text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-md">
                            <MdStar className="h-3 w-3" />
                            Principal
                          </span>
                        </div>
                      )}

                      {/* Indicador de orden (opcional, solo en desktop) */}
                      <div className="absolute top-2 left-2 hidden sm:block">
                        <span className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Haz hover sobre una imagen para marcarla como principal o
                  eliminarla
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 pt-4 flex-col sm:flex-row">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 flex-1 sm:flex-initial"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={saveImages}
                disabled={
                  !arreglo?.idArreglo || imagesState.uploading || isLoading
                }
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-2 flex-1 sm:flex-initial"
                title={
                  !arreglo?.idArreglo
                    ? 'Primero debes guardar el arreglo'
                    : 'Guardar imágenes'
                }
              >
                <MdImage className="h-4 w-4" />
                {imagesState.uploading
                  ? 'Guardando imágenes...'
                  : 'Guardar Imágenes'}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isLoading || imagesState.uploading}
              className="bg-[#50C878] hover:bg-[#50C878]/90 text-white shadow-md shadow-[#50C878]/20 gap-2 w-full sm:w-auto"
            >
              <MdSave className="h-4 w-4" />
              {isLoading
                ? arreglo
                  ? 'Guardando...'
                  : 'Creando...'
                : arreglo
                ? 'Guardar Arreglo'
                : 'Crear Arreglo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
