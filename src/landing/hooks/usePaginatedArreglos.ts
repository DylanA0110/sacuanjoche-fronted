import { useQuery } from '@tanstack/react-query';
import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type {
  ArregloResponse,
  ArreglosPaginatedResponse,
} from '@/arreglo/types/arreglo.interface';

interface UsePaginatedArreglosParams {
  page: number;
  limit: number;
  orden?: string;
  ordenarPor?: string;
  flores?: string;
  precioMin?: string;
  precioMax?: string;
  idFormaArreglo?: string;
}

export const usePaginatedArreglos = (params: UsePaginatedArreglosParams) => {
  const {
    page,
    limit,
    orden,
    ordenarPor,
    flores,
    precioMin,
    precioMax,
    idFormaArreglo,
  } = params;
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: [
      'arreglos-public',
      {
        page,
        limit,
        offset,
        orden,
        ordenarPor,
        flores,
        precioMin,
        precioMax,
        idFormaArreglo,
      },
    ],
    queryFn: async () => {
      // Construir params de forma segura
      const queryParams: Record<string, string | number> = {
        limit,
        offset,
      };

      // Validar y agregar parámetros solo si tienen valores válidos
      if (orden && (orden === 'asc' || orden === 'desc')) {
        queryParams.orden = orden;
      }

      if (ordenarPor && typeof ordenarPor === 'string' && ordenarPor.trim()) {
        queryParams.ordenarPor = ordenarPor.trim();
      }

      if (flores && flores.trim()) {
        // Validar que sean números separados por coma
        const floresArray = flores
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean);
        const validFlores = floresArray.filter((f) => /^\d+$/.test(f));
        if (validFlores.length > 0) {
          queryParams.flores = validFlores.join(',');
        }
      }

      if (precioMin && precioMin.trim()) {
        const precioMinNum = parseFloat(precioMin);
        if (!isNaN(precioMinNum) && precioMinNum >= 0) {
          queryParams.precioMin = precioMinNum;
        }
      }

      if (precioMax && precioMax.trim()) {
        const precioMaxNum = parseFloat(precioMax);
        if (!isNaN(precioMaxNum) && precioMaxNum >= 0) {
          queryParams.precioMax = precioMaxNum;
        }
      }

      if (idFormaArreglo && idFormaArreglo.trim()) {
        const idFormaNum = parseInt(idFormaArreglo, 10);
        if (!isNaN(idFormaNum) && idFormaNum > 0) {
          queryParams.idFormaArreglo = idFormaNum;
        }
      }

      const response = await floristeriaApi.get<
        ArregloResponse[] | ArreglosPaginatedResponse
      >('/arreglos/public', {
        params: queryParams,
      });

      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        !Array.isArray(response.data)
      ) {
        const paginatedData = response.data as ArreglosPaginatedResponse;
        return {
          arreglos: paginatedData.data || [],
          total: paginatedData.total || 0,
          pages: Math.ceil((paginatedData.total || 0) / limit),
        };
      } else if (Array.isArray(response.data)) {
        return {
          arreglos: response.data,
          total: response.data.length,
          pages: Math.ceil(response.data.length / limit),
        };
      }

      return {
        arreglos: [],
        total: 0,
        pages: 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
