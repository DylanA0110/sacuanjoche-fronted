import { type StateCreator, create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface RutaState {
  // Estado de drag and drop
  draggingPedidoId?: number;
  
  // Asignaciones temporales (antes de crear la ruta)
  asignaciones: Record<number, number[]>; // { idEmpleado: [idPedido1, idPedido2, ...] }
  
  // Métodos para drag and drop
  setDraggingPedidoId: (pedidoId: number) => void;
  removeDraggingPedidoId: () => void;
  
  // Métodos para asignaciones
  addPedidoToConductor: (idEmpleado: number, idPedido: number) => void;
  removePedidoFromConductor: (idEmpleado: number, idPedido: number) => void;
  getPedidosByConductor: (idEmpleado: number) => number[];
  clearAsignaciones: () => void;
  clearAsignacionesByConductor: (idEmpleado: number) => void;
  
  // Método para mover pedido entre conductores
  movePedidoBetweenConductors: (
    fromIdEmpleado: number,
    toIdEmpleado: number,
    idPedido: number
  ) => void;
}

const storeApi: StateCreator<RutaState, [['zustand/immer', never]]> = (set, get) => ({
  draggingPedidoId: undefined,
  asignaciones: {},

  setDraggingPedidoId: (pedidoId: number) => {
    set({ draggingPedidoId: pedidoId });
  },

  removeDraggingPedidoId: () => {
    set({ draggingPedidoId: undefined });
  },

  addPedidoToConductor: (idEmpleado: number, idPedido: number) => {
    set((state) => {
      if (!state.asignaciones[idEmpleado]) {
        state.asignaciones[idEmpleado] = [];
      }
      
      // Evitar duplicados
      if (!state.asignaciones[idEmpleado].includes(idPedido)) {
        state.asignaciones[idEmpleado].push(idPedido);
      }
    });
  },

  removePedidoFromConductor: (idEmpleado: number, idPedido: number) => {
    set((state) => {
      if (state.asignaciones[idEmpleado]) {
        state.asignaciones[idEmpleado] = state.asignaciones[idEmpleado].filter(
          (id) => id !== idPedido
        );
        
        // Si no quedan pedidos, eliminar la entrada
        if (state.asignaciones[idEmpleado].length === 0) {
          delete state.asignaciones[idEmpleado];
        }
      }
    });
  },

  getPedidosByConductor: (idEmpleado: number) => {
    return get().asignaciones[idEmpleado] || [];
  },

  clearAsignaciones: () => {
    set({ asignaciones: {} });
  },

  clearAsignacionesByConductor: (idEmpleado: number) => {
    set((state) => {
      if (state.asignaciones[idEmpleado]) {
        delete state.asignaciones[idEmpleado];
      }
    });
  },

  movePedidoBetweenConductors: (
    fromIdEmpleado: number,
    toIdEmpleado: number,
    idPedido: number
  ) => {
    set((state) => {
      // Remover del conductor origen
      if (state.asignaciones[fromIdEmpleado]) {
        state.asignaciones[fromIdEmpleado] = state.asignaciones[fromIdEmpleado].filter(
          (id) => id !== idPedido
        );
        
        if (state.asignaciones[fromIdEmpleado].length === 0) {
          delete state.asignaciones[fromIdEmpleado];
        }
      }
      
      // Agregar al conductor destino
      if (!state.asignaciones[toIdEmpleado]) {
        state.asignaciones[toIdEmpleado] = [];
      }
      
      if (!state.asignaciones[toIdEmpleado].includes(idPedido)) {
        state.asignaciones[toIdEmpleado].push(idPedido);
      }
    });
  },
});

export const useRutaStore = create<RutaState>()(
  devtools(
    persist(immer(storeApi), { name: 'ruta-store' })
  )
);

