import { clsx } from 'clsx';
import { IoAddOutline, IoInformationCircleOutline, IoCloseOutline } from 'react-icons/io5';
import { useRutaDragDrop } from '../hooks/useRutaDragDrop';
import { PedidoCard } from './PedidoCard';
import type { EmpleadoConductor, PedidoRuta } from '../types/ruta.interface';
import { Badge } from '@/shared/components/ui/badge';
import { useRutaStore } from '../store/ruta.store';

interface Props {
  conductor: EmpleadoConductor;
  pedidos: PedidoRuta[];
  allPedidos: PedidoRuta[]; // Todos los pedidos disponibles
  onCrearRuta: (idEmpleado: number) => void;
  onEditarRuta?: (idEmpleado: number) => void;
  onVerDetalles?: (conductor: EmpleadoConductor) => void;
  onViewPedidoDetails?: (idPedido: number) => void;
}

export const ConductorColumn = ({
  conductor,
  allPedidos,
  onCrearRuta,
  onVerDetalles,
  onViewPedidoDetails,
}: Props) => {
  const {
    isDragging,
    onDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    pedidosAsignados,
  } = useRutaDragDrop({ idEmpleado: conductor.idEmpleado });

  const removePedidoFromConductor = useRutaStore((state) => state.removePedidoFromConductor);

  // Obtener los pedidos asignados a este conductor
  const pedidosEnColumna = pedidosAsignados
    .map((idPedido) => allPedidos.find((p) => p.idPedido === idPedido))
    .filter((p): p is PedidoRuta => p !== undefined);

  const nombreCompleto =
    conductor.nombreCompleto ||
    `${conductor.primerNombre} ${conductor.primerApellido}`.trim();

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        'relative flex flex-col rounded-lg bg-white border-2 shadow-sm hover:shadow-md transition-all duration-200 w-72 h-full min-h-[500px] p-3 flex-shrink-0',
        {
          'border-[#50C878] border-dotted bg-green-50/50': isDragging,
          'border-[#50C878] border-dotted bg-green-50': isDragging && onDragOver,
          'border-gray-200 hover:border-gray-300': !isDragging,
        }
      )}
    >
      {/* Header del Conductor - Más compacto */}
      <div className="relative flex flex-row justify-between items-start mb-3 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#50C878] text-white shrink-0 shadow-sm">
            <span className="text-sm font-bold">
              {conductor.primerNombre[0]}{conductor.primerApellido[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-gray-900 truncate">{nombreCompleto}</h4>
              {onVerDetalles && (
                <button
                  onClick={() => onVerDetalles(conductor)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 hover:bg-gray-100 rounded shrink-0"
                  title="Ver detalles"
                >
                  <IoInformationCircleOutline className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs font-medium ${
                  conductor.activo
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {conductor.activo ? 'Activo' : 'Inactivo'}
              </Badge>
              <Badge variant="outline" className="text-xs font-medium bg-gray-100 text-gray-700 border-gray-200">
                {pedidosAsignados.length} pedido{pedidosAsignados.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Pedidos asignados */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 -mx-1 px-1">
        {pedidosEnColumna.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs text-gray-400 mb-1">
              {isDragging ? 'Suelta aquí para asignar' : 'Arrastra pedidos aquí'}
            </p>
            <p className="text-xs text-gray-300">
              {isDragging && onDragOver ? '✓ Listo para asignar' : ''}
            </p>
          </div>
        ) : (
          pedidosEnColumna.map((pedido) => (
            <div key={pedido.idPedido} className="relative group">
              <PedidoCard
                pedido={pedido}
                conductorId={conductor.idEmpleado}
                onViewDetails={onViewPedidoDetails}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removePedidoFromConductor(conductor.idEmpleado, pedido.idPedido);
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg z-10"
                title="Eliminar pedido de esta asignación"
              >
                <IoCloseOutline className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Botón para crear ruta */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        {pedidosAsignados.length > 0 ? (
          <button
            onClick={() => onCrearRuta(conductor.idEmpleado)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#50C878] text-white rounded-lg hover:bg-[#45B869] transition-colors shadow-sm text-xs font-semibold"
          >
            <IoAddOutline className="w-3.5 h-3.5" />
            Crear Ruta
          </button>
        ) : (
          <p className="text-xs text-gray-400 text-center py-1">
            Arrastra pedidos aquí
          </p>
        )}
      </div>
    </div>
  );
};

