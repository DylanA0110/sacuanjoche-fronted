import { useAuthStore } from '@/auth/store/auth.store';

/**
 * Obtiene el ID del empleado del usuario autenticado
 * @returns El idEmpleado del usuario o null si no está autenticado o no es empleado
 */
export const getUserIdEmpleado = (): number | null => {
  const { user } = useAuthStore.getState();
  
  if (!user || !user.empleado) {
    return null;
  }
  
  return user.empleado.idEmpleado;
};

/**
 * Hook para obtener el ID del empleado del usuario autenticado
 * @returns El idEmpleado del usuario o null si no está autenticado o no es empleado
 */
export const useUserIdEmpleado = (): number | null => {
  const { user } = useAuthStore();
  
  if (!user || !user.empleado) {
    return null;
  }
  
  return user.empleado.idEmpleado;
};

