import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import type { Arreglo } from '@/arreglo/types/arreglo.interface';

export interface ArregloSeleccionado {
  idArreglo: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

interface UsePedidoCartReturn {
  items: ArregloSeleccionado[];
  subtotal: number;
  addItem: (arreglo: Arreglo, silent?: boolean) => void;
  removeItem: (idArreglo: number, silent?: boolean) => void;
  updateQuantity: (idArreglo: number, cantidad: number, silent?: boolean) => void;
  clear: () => void;
  getItemCount: () => number;
}

export function usePedidoCart(): UsePedidoCartReturn {
  const [items, setItems] = useState<ArregloSeleccionado[]>([]);

  // Calcular subtotal
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  // Agregar arreglo al carrito
  const addItem = useCallback((arreglo: Arreglo, silent: boolean = false) => {
    const precioUnitario =
      typeof arreglo.precioUnitario === 'string'
        ? parseFloat(arreglo.precioUnitario)
        : arreglo.precioUnitario;

    if (isNaN(precioUnitario) || precioUnitario <= 0) {
      if (!silent) {
        toast.error('Precio inválido', {
          description: 'El precio del arreglo no es válido',
        });
      }
      return;
    }

    const nuevoArreglo: ArregloSeleccionado = {
      idArreglo: arreglo.idArreglo,
      nombre: arreglo.nombre,
      precioUnitario,
      cantidad: 1,
      subtotal: precioUnitario,
    };

    setItems((prev) => {
      const existe = prev.find((a) => a.idArreglo === nuevoArreglo.idArreglo);
      if (existe) {
        // Actualizar cantidad
        const updated = prev.map((a) =>
          a.idArreglo === nuevoArreglo.idArreglo
            ? {
                ...a,
                cantidad: a.cantidad + 1,
                subtotal: a.precioUnitario * (a.cantidad + 1),
              }
            : a
        );
        if (!silent) {
          toast.success('Cantidad actualizada', {
            description: `${arreglo.nombre} ahora tiene ${
              existe.cantidad + 1
            } unidades`,
          });
        }
        return updated;
      } else {
        if (!silent) {
          toast.success('Arreglo agregado', {
            description: `${arreglo.nombre} agregado al carrito`,
          });
        }
        return [...prev, nuevoArreglo];
      }
    });
  }, []);

  // Remover arreglo del carrito
  const removeItem = useCallback((idArreglo: number, silent: boolean = false) => {
    setItems((prev) => {
      const item = prev.find((a) => a.idArreglo === idArreglo);
      const filtered = prev.filter((a) => a.idArreglo !== idArreglo);
      if (item && !silent) {
        toast.info('Arreglo eliminado', {
          description: `${item.nombre} eliminado del carrito`,
        });
      }
      return filtered;
    });
  }, []);

  // Actualizar cantidad de un arreglo
  const updateQuantity = useCallback(
    (idArreglo: number, cantidad: number, silent: boolean = false) => {
      if (cantidad <= 0) {
        removeItem(idArreglo, silent);
        return;
      }

      setItems((prev) =>
        prev.map((a) =>
          a.idArreglo === idArreglo
            ? {
                ...a,
                cantidad,
                subtotal: a.precioUnitario * cantidad,
              }
            : a
        )
      );
    },
    [removeItem]
  );

  // Limpiar carrito
  const clear = useCallback(() => {
    setItems([]);
  }, []);

  // Obtener cantidad total de items
  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.cantidad, 0);
  }, [items]);

  return {
    items,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    getItemCount,
  };
}

