import { useQuery } from '@tanstack/react-query';
import { getEmpleados } from '../actions/getEmpleados';
import type { Empleado } from '../types/empleado.interface';

export interface UseEmpleadoOptions {
  usePagination?: boolean;
  limit?: number;
  offset?: number;
  q?: string;
}

export const useEmpleado = (options: UseEmpleadoOptions = {}) => {
  const { limit, offset, q } = options;

  const {
    data: empleados = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Empleado[]>({
    queryKey: ['empleados', { limit, offset, q }],
    queryFn: () => getEmpleados({ limit, offset, q }),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    empleados,
    isLoading,
    isError,
    error,
    refetch,
  };
};

