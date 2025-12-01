import { useAuthStore } from '@/auth/store/auth.store';
import { logger } from './logger';

/**
 * Obtiene el ID del empleado del usuario autenticado
 * @returns El idEmpleado del usuario o null si no está autenticado o no es empleado
 */
export const getUserIdEmpleado = (): number | null => {
  try {
    const { user } = useAuthStore.getState();

    if (!user) {
      logger.warn('getUserIdEmpleado: Usuario no autenticado');
      return null;
    }

    if (!user.empleado) {
      logger.warn('getUserIdEmpleado: Usuario no tiene empleado asociado', {
        userId: user.id,
        email: user.email,
        roles: user.roles,
        tieneCliente: !!user.cliente,
      });
      return null;
    }

    // El backend envía empleado.id (número), NO empleado.idEmpleado
    // IMPORTANTE: Usar empleado.id, NUNCA user.id (UUID)
    const idEmpleado = (user.empleado as any).id ?? user.empleado.idEmpleado;

    if (!idEmpleado) {
      logger.error('getUserIdEmpleado: Empleado no tiene id', {
        empleado: user.empleado,
        empleadoKeys: Object.keys(user.empleado),
        userId: user.id, // Este es el UUID del usuario, NO el idEmpleado
      });
      return null;
    }

    // CRÍTICO: Verificar que NO estemos usando user.id (UUID) por error
    // user.id es un UUID string, idEmpleado debe ser un número
    if (typeof idEmpleado === 'string' && idEmpleado === user.id) {
      logger.error(
        'getUserIdEmpleado: ERROR - Se está usando user.id (UUID) en lugar de empleado.id',
        {
          idEmpleado,
          userId: user.id,
          empleado: user.empleado,
        }
      );
      return null;
    }

    // Asegurar que sea un número
    const idEmpleadoNum =
      typeof idEmpleado === 'number' ? idEmpleado : Number(idEmpleado);
    if (isNaN(idEmpleadoNum)) {
      logger.warn('getUserIdEmpleado: idEmpleado no es un número válido', {
        idEmpleado,
        empleado: user.empleado,
      });
      return null;
    }

    return idEmpleadoNum;
  } catch (error) {
    logger.error('getUserIdEmpleado: Error al obtener idEmpleado', error);
    return null;
  }
};

/**
 * Hook para obtener el ID del empleado del usuario autenticado
 * @returns El idEmpleado del usuario o null si no está autenticado o no es empleado
 */
export const useUserIdEmpleado = (): number | null => {
  try {
    const { user } = useAuthStore();

    if (!user) {
      return null;
    }

    if (!user.empleado) {
      return null;
    }

    // El backend envía empleado.id (número), NO empleado.idEmpleado
    // IMPORTANTE: Usar empleado.id, NUNCA user.id (UUID)
    const idEmpleado = (user.empleado as any).id ?? user.empleado.idEmpleado;

    if (!idEmpleado) {
      return null;
    }

    // CRÍTICO: Verificar que NO estemos usando user.id (UUID) por error
    if (typeof idEmpleado === 'string' && idEmpleado === user.id) {
      return null;
    }

    // Asegurar que sea un número
    const idEmpleadoNum =
      typeof idEmpleado === 'number' ? idEmpleado : Number(idEmpleado);
    if (isNaN(idEmpleadoNum) || idEmpleadoNum <= 0) {
      return null;
    }

    return idEmpleadoNum;
  } catch (error) {
    logger.error('useUserIdEmpleado: Error al obtener idEmpleado', error);
    return null;
  }
};
