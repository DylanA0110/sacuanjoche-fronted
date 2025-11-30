import { useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';
import { PedidoCard } from './PedidoCard';
import type { PedidoRuta } from '../types/ruta.interface';
import { useRutaStore } from '../store/ruta.store';

interface Props {
  pedidos: PedidoRuta[];
  isLoading?: boolean;
  onViewDetails?: (idPedido: number) => void;
}

export const PedidosDisponibles = ({ pedidos, isLoading, onViewDetails }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const asignaciones = useRutaStore((state) => state.asignaciones);

  // Obtener todos los IDs de pedidos asignados
  const pedidosAsignadosIds = new Set<number>();
  Object.values(asignaciones).forEach((ids) => {
    ids.forEach((id) => pedidosAsignadosIds.add(id));
  });

  // Filtrar pedidos disponibles (no asignados) y por búsqueda
  const pedidosDisponibles = pedidos.filter((pedido) => {
    const isAsignado = pedidosAsignadosIds.has(pedido.idPedido);
    if (isAsignado) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const numeroPedido = String(pedido.numeroPedido || pedido.idPedido).toLowerCase();
    const clienteNombre = pedido.cliente?.nombreCompleto?.toLowerCase() ||
      `${pedido.cliente?.primerNombre || ''} ${pedido.cliente?.primerApellido || ''}`.toLowerCase();
    const direccion = pedido.direccion?.direccionTxt?.toLowerCase() || '';

    return (
      numeroPedido.includes(query) ||
      clienteNombre.includes(query) ||
      direccion.includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-900">Pedidos Disponibles</h3>
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {pedidosDisponibles.length}
          </span>
        </div>
        
        {/* Buscador */}
        <div className="relative">
          <IoSearchOutline className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#50C878] focus:border-transparent text-sm bg-white text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Lista de pedidos mejorada */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">Cargando pedidos...</p>
          </div>
        ) : pedidosDisponibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <IoSearchOutline className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {searchQuery ? 'No se encontraron pedidos' : 'No hay pedidos disponibles'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-indigo-600 hover:text-indigo-700 mt-2 font-medium underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          pedidosDisponibles.map((pedido) => (
            <PedidoCard 
              key={pedido.idPedido} 
              pedido={pedido} 
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  );
};

