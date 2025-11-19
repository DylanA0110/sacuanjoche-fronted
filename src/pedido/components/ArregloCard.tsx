import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MdAdd, MdDelete, MdLocalFlorist, MdCategory } from 'react-icons/md';
import type { Arreglo } from '@/arreglo/types/arreglo.interface';
import { getArregloFlores, getArregloAccesorios } from '@/arreglo/actions';

interface ArregloCardProps {
  arreglo: Arreglo;
  cantidadEnCarrito: number;
  onAgregar: (arreglo: Arreglo) => void;
  onEliminar: (idArreglo: number) => void;
}

export function ArregloCard({
  arreglo,
  cantidadEnCarrito,
  onAgregar,
  onEliminar,
}: ArregloCardProps) {
  const precio =
    typeof arreglo.precioUnitario === 'string'
      ? parseFloat(arreglo.precioUnitario)
      : arreglo.precioUnitario;

  const enCarrito = cantidadEnCarrito > 0;

  // Obtener flores y accesorios del arreglo
  const { data: flores = [] } = useQuery({
    queryKey: ['arreglo-flores', arreglo.idArreglo],
    queryFn: () => getArregloFlores(arreglo.idArreglo),
    enabled: !!arreglo.idArreglo,
  });

  const { data: accesorios = [] } = useQuery({
    queryKey: ['arreglo-accesorios', arreglo.idArreglo],
    queryFn: () => getArregloAccesorios(arreglo.idArreglo),
    enabled: !!arreglo.idArreglo,
  });

  // Calcular totales
  const totalFlores = flores.reduce(
    (sum, flor) => sum + (flor.cantidad || 0),
    0
  );
  const totalAccesorios = accesorios.reduce(
    (sum, acc) => sum + (acc.cantidad || 0),
    0
  );

  // Obtener imagen principal
  const imagenPrincipal =
    arreglo.media?.find((m) => m.isPrimary) || arreglo.media?.[0];

  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg ${
        enCarrito
          ? 'border-[#50C878] shadow-md shadow-[#50C878]/20'
          : 'border-gray-200 hover:border-[#50C878]/50'
      }`}
    >
      {/* Imagen principal */}
      {imagenPrincipal?.url && (
        <div className="w-full h-48 bg-gray-100 overflow-hidden">
          <img
            src={imagenPrincipal.url}
            alt={arreglo.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4 flex flex-col min-h-[280px]">
        <div className="flex-1 mb-4">
          <h4 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
            {arreglo.nombre}
          </h4>
          {arreglo.descripcion && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {arreglo.descripcion}
            </p>
          )}

          {/* Información de flores y accesorios */}
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
            {totalFlores > 0 && (
              <div className="flex items-center gap-1">
                <MdLocalFlorist className="h-4 w-4 text-[#50C878]" />
                <span className="font-medium">
                  {totalFlores} {totalFlores === 1 ? 'flor' : 'flores'}
                </span>
              </div>
            )}
            {totalAccesorios > 0 && (
              <div className="flex items-center gap-1">
                <MdCategory className="h-4 w-4 text-[#50C878]" />
                <span className="font-medium">
                  {totalAccesorios}{' '}
                  {totalAccesorios === 1 ? 'accesorio' : 'accesorios'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-[#50C878]">
              ${precio.toFixed(2)}
            </span>
            {cantidadEnCarrito > 0 && (
              <Badge className="bg-[#50C878] text-white">
                {cantidadEnCarrito} en carrito
              </Badge>
            )}
          </div>
        </div>

        {/* Botones de acción - SIEMPRE VISIBLES */}
        <div className="flex gap-2 pt-3 border-t-2 border-gray-200 mt-auto">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAgregar(arreglo);
            }}
            className="flex-1 border-2 border-[#50C878] bg-white text-[#50C878] hover:bg-[#50C878] hover:text-white font-semibold transition-all duration-200 h-10 text-base shadow-sm hover:shadow-md"
          >
            <MdAdd className="h-5 w-5 mr-2" />
            {enCarrito ? 'Agregar más' : 'Agregar'}
          </Button>
          {enCarrito && (
            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEliminar(arreglo.idArreglo);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 h-10 w-10 p-0"
            >
              <MdDelete className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
