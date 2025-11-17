import type { ArregloAssociationsPayload } from '../types/arreglo-insumos.interface';
import { createAccesorioArreglo } from './createAccesorioArreglo';
import { createArregloFlor } from './createArregloFlor';
import { getArregloAccesorios } from './getArregloAccesorios';
import { getArregloFlores } from './getArregloFlores';
import { updateAccesorioArreglo } from './updateAccesorioArreglo';
import { updateArregloFlor } from './updateArregloFlor';
import type { AccesorioArreglo } from '../types/arreglo-asociaciones.interface';
import type { ArregloFlor } from '../types/arreglo-asociaciones.interface';

/**
 * Guarda las asociaciones de flores y accesorios para un arreglo.
 * Para editar: compara existentes vs nuevas y usa PATCH para actualizar o POST para crear.
 * Para crear: solo crea las nuevas asociaciones con POST.
 */
export const saveArregloInsumos = async (
  idArreglo: number,
  associations: ArregloAssociationsPayload
): Promise<void> => {
  try {
    // Obtener asociaciones existentes
    const [existingAccesorios, existingFlores] = await Promise.all([
      getArregloAccesorios(idArreglo).catch(() => []),
      getArregloFlores(idArreglo).catch(() => []),
    ]);

    // Procesar accesorios: comparar existentes vs nuevos
    const accesorioPromises: Promise<any>[] = [];
    
    for (const newAcc of associations.accesorios) {
      const existing = existingAccesorios.find(
        (e: AccesorioArreglo) => e.idAccesorio === newAcc.idAccesorio
      );
      
      if (existing) {
        // Si existe y la cantidad cambió, actualizar con PATCH
        if (existing.cantidad !== newAcc.cantidad) {
          accesorioPromises.push(
            updateAccesorioArreglo(existing.idAccesorioArreglo, {
              cantidad: newAcc.cantidad,
            })
          );
        }
        // Si existe y no cambió, no hacer nada
      } else {
        // Si no existe, crear con POST
        accesorioPromises.push(
          createAccesorioArreglo({
            idArreglo,
            idAccesorio: newAcc.idAccesorio,
            cantidad: newAcc.cantidad,
          })
        );
      }
    }

    // Procesar flores: comparar existentes vs nuevos
    const florPromises: Promise<any>[] = [];
    
    for (const newFlor of associations.flores) {
      const existing = existingFlores.find(
        (e: ArregloFlor) => e.idFlor === newFlor.idFlor
      );
      
      if (existing) {
        // Si existe y la cantidad cambió, actualizar con PATCH
        if (existing.cantidad !== newFlor.cantidad) {
          florPromises.push(
            updateArregloFlor(existing.idArregloFlor, {
              cantidad: newFlor.cantidad,
            })
          );
        }
        // Si existe y no cambió, no hacer nada
      } else {
        // Si no existe, crear con POST
        florPromises.push(
          createArregloFlor({
            idArreglo,
            idFlor: newFlor.idFlor,
            cantidad: newFlor.cantidad,
          })
        );
      }
    }

    // Ejecutar todas las operaciones en paralelo
    await Promise.all([...accesorioPromises, ...florPromises]);
  } catch (error) {
    console.error('Error al guardar asociaciones:', error);
    throw error;
  }
};

