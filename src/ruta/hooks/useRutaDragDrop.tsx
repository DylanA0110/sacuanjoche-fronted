import { DragEvent, useState } from 'react';
import { useRutaStore } from '../store/ruta.store';

interface Options {
  idEmpleado: number;
}

export const useRutaDragDrop = ({ idEmpleado }: Options) => {
  const isDragging = useRutaStore((state) => !!state.draggingPedidoId);
  const addPedidoToConductor = useRutaStore((state) => state.addPedidoToConductor);
  const removePedidoFromConductor = useRutaStore((state) => state.removePedidoFromConductor);
  const movePedidoBetweenConductors = useRutaStore((state) => state.movePedidoBetweenConductors);
  const getPedidosByConductor = useRutaStore((state) => state.getPedidosByConductor);
  
  const [onDragOver, setOnDragOver] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOnDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOnDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setOnDragOver(false);
    
    const draggingPedidoId = useRutaStore.getState().draggingPedidoId;
    if (!draggingPedidoId) return;

    // Obtener el conductor origen (si existe)
    const asignaciones = useRutaStore.getState().asignaciones;
    let fromIdEmpleado: number | null = null;
    
    for (const [empId, pedidos] of Object.entries(asignaciones)) {
      if (pedidos.includes(draggingPedidoId)) {
        fromIdEmpleado = Number(empId);
        break;
      }
    }

    // Si viene de otro conductor, moverlo
    if (fromIdEmpleado && fromIdEmpleado !== idEmpleado) {
      movePedidoBetweenConductors(fromIdEmpleado, idEmpleado, draggingPedidoId);
    } else {
      // Si no tiene conductor asignado, agregarlo
      addPedidoToConductor(idEmpleado, draggingPedidoId);
    }

    // Limpiar el estado de dragging
    useRutaStore.getState().removeDraggingPedidoId();
  };

  return {
    isDragging,
    onDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    pedidosAsignados: getPedidosByConductor(idEmpleado),
  };
};

