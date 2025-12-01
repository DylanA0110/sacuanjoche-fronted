import { Button } from '@/shared/components/ui/button';
import { MdShoppingCart, MdAdd, MdRemove, MdDelete } from 'react-icons/md';

interface ArregloSeleccionado {
  idArreglo: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

interface CarritoArreglosProps {
  arreglos: ArregloSeleccionado[];
  onActualizarCantidad: (idArreglo: number, nuevaCantidad: number) => void;
  onEliminar: (idArreglo: number) => void;
}

export function CarritoArreglos({
  arreglos,
  onActualizarCantidad,
  onEliminar,
}: CarritoArreglosProps) {
  if (arreglos.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-300">
      <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MdShoppingCart className="h-5 w-5 text-[#50C878]" />
        Carrito de Compra ({arreglos.length})
      </h4>
      <div className="space-y-3">
        {arreglos.map((arr) => (
          <div
            key={arr.idArreglo}
            className="bg-white rounded-lg border-2 border-[#50C878]/30 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{arr.nombre}</p>
                <p className="text-sm text-gray-600">
                  ${arr.precioUnitario.toFixed(2)} c/u
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const nuevaCantidad = arr.cantidad - 1;
                      // Si la cantidad sería 0, no hacer nada (el botón de eliminar se encarga)
                      if (nuevaCantidad >= 1) {
                        onActualizarCantidad(arr.idArreglo, nuevaCantidad);
                      }
                    }}
                    disabled={arr.cantidad <= 1}
                    className="h-7 w-7 p-0 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdRemove className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-gray-900">
                    {arr.cantidad}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const nuevaCantidad = arr.cantidad + 1;
                      // Validar que no exceda el máximo (100)
                      if (nuevaCantidad <= 100) {
                        onActualizarCantidad(arr.idArreglo, nuevaCantidad);
                      }
                    }}
                    disabled={arr.cantidad >= 100}
                    className="h-7 w-7 p-0 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MdAdd className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-lg font-bold text-[#50C878]">
                    ${arr.subtotal.toFixed(2)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEliminar(arr.idArreglo)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <MdDelete className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
