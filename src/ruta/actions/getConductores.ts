import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type { 
  EmpleadoConductor, 
  EmpleadoResponse, 
  PaginatedEmpleadoResponse 
} from '../types/ruta.interface';

/**
 * Obtiene todos los empleados con rol "conductor"
 * Filtra los empleados que tengan "conductor" en user.roles
 */
export const getConductores = async (): Promise<EmpleadoConductor[]> => {
  try {
    // Obtener todos los empleados (el backend no acepta filtro por rol en query params)
    // Filtrar en el frontend por rol "conductor" en user.roles
    const response = await floristeriaApi.get<EmpleadoResponse[] | PaginatedEmpleadoResponse>('/empleado');

    // Función auxiliar para verificar si es conductor
    const esConductor = (empleado: EmpleadoResponse): boolean => {
      const roles = empleado.user?.roles || [];
      return roles.some((r: string) => r.toLowerCase() === 'conductor');
    };

    // Función auxiliar para mapear empleado a EmpleadoConductor
    const mapearEmpleado = (empleado: EmpleadoResponse): EmpleadoConductor => {
      const nombreCompleto = 
        `${empleado.primerNombre || ''} ${empleado.primerApellido || ''}`.trim();
      
      // Mapear estado a activo (boolean)
      const activo = empleado.estado === 'activo';

      return {
        idEmpleado: empleado.idEmpleado,
        primerNombre: empleado.primerNombre || '',
        segundoNombre: empleado.segundoNombre || undefined,
        primerApellido: empleado.primerApellido || '',
        segundoApellido: empleado.segundoApellido || undefined,
        nombreCompleto,
        telefono: empleado.telefono || '',
        activo,
        roles: empleado.user?.roles || [],
      };
    };

    // Si el backend devuelve un array directo
    if (Array.isArray(response.data)) {
      return response.data
        .filter(esConductor)
        .map(mapearEmpleado);
    }

    // Si viene en formato paginado
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const paginatedData = response.data as PaginatedEmpleadoResponse;
      return paginatedData.data
        .filter(esConductor)
        .map(mapearEmpleado);
    }

    return [];
  } catch (error: unknown) {
    console.error('Error al obtener conductores:', error);
    // Si el endpoint no existe, retornar array vacío
    // El componente manejará el error
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return [];
      }
    }
    throw error;
  }
};

