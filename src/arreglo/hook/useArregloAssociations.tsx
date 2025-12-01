import { useState, useCallback, useEffect } from 'react';
import { getArregloFlores, getArregloAccesorios } from '../actions';
import type { Flor } from '@/catalogo/types/flor.interface';
import type { Accesorio } from '@/catalogo/types/accesorio.interface';
import {
  validateCantidadTotalFlores,
  validateCantidadTotalAccesorios,
} from '@/shared/utils/validation';

interface AssociationsState {
  flores: {
    selectedId?: string;
    cantidad: number;
    list: Array<{ idFlor: number; nombre: string; cantidad: number }>;
  };
  accesorios: {
    selectedId?: string;
    cantidad: number;
    list: Array<{ idAccesorio: number; nombre: string; cantidad: number }>;
  };
}

interface UseArregloAssociationsOptions {
  arregloId?: number;
  flores: Flor[];
  accesorios: Accesorio[];
}

export function useArregloAssociations({
  arregloId,
  flores,
  accesorios,
}: UseArregloAssociationsOptions) {
  const [associations, setAssociations] = useState<AssociationsState>({
    flores: {
      selectedId: undefined,
      cantidad: 1,
      list: [],
    },
    accesorios: {
      selectedId: undefined,
      cantidad: 1,
      list: [],
    },
  });

  // Cargar asociaciones desde el backend
  useEffect(() => {
    if (arregloId) {
      Promise.all([
        getArregloFlores(arregloId),
        getArregloAccesorios(arregloId),
      ])
        .then(([floresData, accesoriosData]) => {
          setAssociations((prev) => ({
            ...prev,
            flores: {
              ...prev.flores,
              list: floresData.map((f) => ({
                idFlor: f.idFlor,
                nombre: f.flor?.nombre || `Flor ${f.idFlor}`,
                cantidad: f.cantidad,
              })),
            },
            accesorios: {
              ...prev.accesorios,
              list: accesoriosData.map((a) => ({
                idAccesorio: a.idAccesorio,
                nombre:
                  a.accesorio?.descripcion || `Accesorio ${a.idAccesorio}`,
                cantidad: a.cantidad,
              })),
            },
          }));
        })
        .catch(() => {
          // Error silencioso, las asociaciones se pueden cargar después
        });
    } else {
      // Resetear cuando no hay arreglo
      setAssociations({
        flores: { selectedId: undefined, cantidad: 1, list: [] },
        accesorios: { selectedId: undefined, cantidad: 1, list: [] },
      });
    }
  }, [arregloId]);

  // Agregar flor
  const addFlor = useCallback((): string | null => {
    if (!associations.flores.selectedId) return null;
    const idFlor = parseInt(associations.flores.selectedId, 10);
    if (!idFlor || associations.flores.cantidad <= 0) return null;
    const flor = flores.find((f) => f.idFlor === idFlor);
    if (!flor) return null;

    // Calcular la nueva lista temporal para validar
    const existing = associations.flores.list.find((i) => i.idFlor === idFlor);
    const newList = existing
      ? associations.flores.list.map((i) =>
          i.idFlor === idFlor
            ? { ...i, cantidad: i.cantidad + associations.flores.cantidad }
            : i
        )
      : [
          ...associations.flores.list,
          { idFlor, nombre: flor.nombre, cantidad: associations.flores.cantidad },
        ];

    // Validar cantidad total de flores (3-50)
    const error = validateCantidadTotalFlores(newList);
    if (error) {
      return error;
    }

    setAssociations((prev) => ({
      ...prev,
      flores: { selectedId: undefined, cantidad: 1, list: newList },
    }));

    return null;
  }, [associations.flores.selectedId, associations.flores.cantidad, flores, associations.flores.list]);

  // Remover flor
  const removeFlor = useCallback((idFlor: number) => {
    setAssociations((prev) => ({
      ...prev,
      flores: {
        ...prev.flores,
        list: prev.flores.list.filter((i) => i.idFlor !== idFlor),
      },
    }));
  }, []);

  // Agregar accesorio (con validación mejorada)
  const addAccesorio = useCallback((): string | null => {
    if (!associations.accesorios.selectedId) return null;
    const idAccesorio = parseInt(associations.accesorios.selectedId, 10);
    // Validación: cantidad debe ser mayor que 0
    const cantidad = Math.max(1, associations.accesorios.cantidad);
    if (!idAccesorio || cantidad <= 0) return null;
    const acc = accesorios.find((a) => a.idAccesorio === idAccesorio);
    if (!acc) return null;

    // Calcular la nueva lista temporal para validar
    const existing = associations.accesorios.list.find(
      (i) => i.idAccesorio === idAccesorio
    );
    const newList = existing
      ? associations.accesorios.list.map((i) =>
          i.idAccesorio === idAccesorio
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        )
      : [
          ...associations.accesorios.list,
          { idAccesorio, nombre: acc.descripcion, cantidad },
        ];

    // Validar cantidad total de accesorios (1-15)
    const error = validateCantidadTotalAccesorios(newList);
    if (error) {
      return error;
    }

    setAssociations((prev) => ({
      ...prev,
      accesorios: { selectedId: undefined, cantidad: 1, list: newList },
    }));

    return null;
  }, [
    associations.accesorios.selectedId,
    associations.accesorios.cantidad,
    accesorios,
    associations.accesorios.list,
  ]);

  // Remover accesorio
  const removeAccesorio = useCallback((idAccesorio: number) => {
    setAssociations((prev) => ({
      ...prev,
      accesorios: {
        ...prev.accesorios,
        list: prev.accesorios.list.filter((i) => i.idAccesorio !== idAccesorio),
      },
    }));
  }, []);

  // Actualizar cantidad de flor
  const updateFlorCantidad = useCallback((value: number) => {
    setAssociations((prev) => ({
      ...prev,
      flores: {
        ...prev.flores,
        cantidad: Math.max(1, value),
      },
    }));
  }, []);

  // Actualizar cantidad de accesorio
  const updateAccesorioCantidad = useCallback((value: number) => {
    setAssociations((prev) => ({
      ...prev,
      accesorios: {
        ...prev.accesorios,
        cantidad: Math.max(1, value),
      },
    }));
  }, []);

  // Actualizar selectedId de flor
  const setFlorSelectedId = useCallback((value: string | undefined) => {
    setAssociations((prev) => ({
      ...prev,
      flores: { ...prev.flores, selectedId: value },
    }));
  }, []);

  // Actualizar selectedId de accesorio
  const setAccesorioSelectedId = useCallback((value: string | undefined) => {
    setAssociations((prev) => ({
      ...prev,
      accesorios: { ...prev.accesorios, selectedId: value },
    }));
  }, []);

  // Resetear asociaciones
  const reset = useCallback(() => {
    setAssociations({
      flores: { selectedId: undefined, cantidad: 1, list: [] },
      accesorios: { selectedId: undefined, cantidad: 1, list: [] },
    });
  }, []);

  // Calcular total de flores
  const totalFlores = associations.flores.list.reduce(
    (sum, f) => sum + f.cantidad,
    0
  );

  return {
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
    reset,
  };
}
