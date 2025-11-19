import { QueryClient } from '@tanstack/react-query';

/**
 * Helper para invalidar queries de manera eficiente
 * Invalida y refetch automáticamente las queries activas
 */
export const invalidateAndRefetch = (
  queryClient: QueryClient,
  queryKey: string[],
  options?: {
    exact?: boolean;
    refetchType?: 'active' | 'inactive' | 'all' | 'none';
  }
) => {
  queryClient.invalidateQueries({
    queryKey,
    exact: options?.exact ?? false,
    refetchType: options?.refetchType ?? 'active', // Solo refetch queries activas
  });
};

/**
 * Helper para invalidar múltiples queries relacionadas
 */
export const invalidateRelatedQueries = (
  queryClient: QueryClient,
  queryKeys: string[][]
) => {
  queryKeys.forEach((key) => {
    invalidateAndRefetch(queryClient, key);
  });
};

/**
 * Invalidación inteligente según el tipo de entidad editada/creada/eliminada
 * Solo invalida lo necesario según el contexto y la operación específica
 */
export const smartInvalidate = (
  queryClient: QueryClient,
  entityType:
    | 'pedido'
    | 'cliente'
    | 'arreglo'
    | 'flor'
    | 'accesorio'
    | 'formaArreglo'
    | 'metodoPago'
    | 'factura',
  operation: 'create' | 'update' | 'delete',
  entityId?: number // ID específico para invalidación más precisa
) => {
  // Invalidar la entidad principal - solo la lista, no todo
  const entityKeys: Record<string, string[]> = {
    pedido: ['pedidos'],
    cliente: ['clientes'],
    arreglo: ['arreglos'],
    flor: ['flores'],
    accesorio: ['accesorios'],
    formaArreglo: ['formasArreglo'],
    metodoPago: ['metodosPago'],
    factura: ['facturas'],
  };

  const mainKey = entityKeys[entityType];

  // Invalidación específica según operación
  if (operation === 'create') {
    // Al crear: solo invalidar la lista principal
    if (mainKey) {
      invalidateAndRefetch(queryClient, mainKey);
    }
  } else if (operation === 'update' && entityId) {
    // Al editar: invalidar el item específico primero, luego la lista
    if (mainKey) {
      queryClient.invalidateQueries({
        queryKey: [...mainKey, entityId],
        refetchType: 'active',
      });
      invalidateAndRefetch(queryClient, mainKey);
    }
  } else if (operation === 'delete') {
    // Al eliminar: solo invalidar la lista
    if (mainKey) {
      invalidateAndRefetch(queryClient, mainKey);
    }
  } else {
    // Fallback: invalidar lista principal
    if (mainKey) {
      invalidateAndRefetch(queryClient, mainKey);
    }
  }

  // Invalidar relaciones SOLO si realmente se modificaron
  switch (entityType) {
    case 'pedido':
      // Solo invalidar detalles si se creó/editaron detalles
      if (operation === 'create') {
        invalidateAndRefetch(queryClient, ['detalle-pedido']);
      }
      // Facturas solo si se creó una factura desde el pedido
      break;

    case 'cliente':
      // Solo invalidar direcciones si se creó/editaron direcciones
      if (operation === 'create') {
        invalidateAndRefetch(queryClient, ['cliente-direcciones']);
      }
      break;

    case 'arreglo':
      // Solo invalidar media si se modificó media (no en cada update del arreglo)
      if (operation === 'delete') {
        invalidateAndRefetch(queryClient, ['arregloMedia']);
      }
      break;

    case 'formaArreglo':
      // Solo invalidar arreglos si se cambió algo que afecta a los arreglos
      if (operation === 'update' || operation === 'delete') {
        invalidateAndRefetch(queryClient, ['arreglos']);
      }
      break;

    default:
      // Para otros tipos, solo invalidar la entidad principal
      break;
  }
};
