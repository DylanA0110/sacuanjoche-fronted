import { useQuery } from '@tanstack/react-query';
import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import type {
  ArregloResponse,
  ArreglosPaginatedResponse,
} from '@/arreglo/types/arreglo.interface';

interface UsePaginatedArreglosParams {
  page: number;
  limit: number;
  q?: string;
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
    q,
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
        q,
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

      // Agregar búsqueda por texto (q)
      if (q && typeof q === 'string' && q.trim()) {
        queryParams.q = q.trim();
      }

      // Validar y agregar parámetros solo si tienen valores válidos
      // El backend espera ASC o DESC en mayúsculas
      if (orden && (orden.toUpperCase() === 'ASC' || orden.toUpperCase() === 'DESC')) {
        queryParams.orden = orden.toUpperCase();
      }

      // El backend espera: nombre, precio, fechaCreacion
      // Mapear 'precioUnitario' a 'precio' si viene del frontend
      if (ordenarPor && typeof ordenarPor === 'string' && ordenarPor.trim()) {
        const ordenarPorValue = ordenarPor.trim();
        // Mapear precioUnitario a precio para compatibilidad
        if (ordenarPorValue === 'precioUnitario') {
          queryParams.ordenarPor = 'precio';
        } else if (['nombre', 'precio', 'fechaCreacion'].includes(ordenarPorValue)) {
          queryParams.ordenarPor = ordenarPorValue;
        }
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

      console.log('🔍 [usePaginatedArreglos] Fetching arreglos con params:', queryParams);
      const response = await floristeriaApi.get<
        ArregloResponse[] | ArreglosPaginatedResponse
      >('/arreglos/public', {
        params: queryParams,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      
      // Verificar si la respuesta es HTML (error de ngrok)
      if (typeof response.data === 'string' && (response.data as string).trim().startsWith('<!DOCTYPE')) {
        console.error('❌ [usePaginatedArreglos] Ngrok bloqueó la petición, recibió HTML en lugar de JSON');
        throw new Error('El servidor retornó HTML en lugar de JSON. Verifica la configuración de ngrok.');
      }

      console.log('📦 [usePaginatedArreglos] Response recibida:', {
        isArray: Array.isArray(response.data),
        hasData: 'data' in (response.data || {}),
        dataType: typeof response.data,
        dataKeys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : null,
        rawData: response.data,
      });

      // Mapear los arreglos y asegurar que tengan estado 'activo' (el endpoint público solo retorna activos)
      const mapArreglo = (arreglo: ArregloResponse): ArregloResponse => ({
        ...arreglo,
        estado: arreglo.estado || 'activo', // Si no viene estado, asumir que está activo
      });

      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        !Array.isArray(response.data)
      ) {
        const paginatedData = response.data as ArreglosPaginatedResponse;
        const mappedArreglos = (paginatedData.data || []).map(mapArreglo);
        console.log('✅ [usePaginatedArreglos] Arreglos paginados:', {
          total: paginatedData.total,
          count: mappedArreglos.length,
          arreglos: mappedArreglos,
        });
        return {
          arreglos: mappedArreglos,
          total: paginatedData.total || 0,
          pages: Math.ceil((paginatedData.total || 0) / limit),
        };
      } else if (Array.isArray(response.data)) {
        const mappedArreglos = response.data.map(mapArreglo);
        console.log('✅ [usePaginatedArreglos] Arreglos como array:', {
          count: mappedArreglos.length,
          arreglos: mappedArreglos,
        });
        return {
          arreglos: mappedArreglos,
          total: response.data.length,
          pages: Math.ceil(response.data.length / limit),
        };
      }

      console.warn('⚠️ [usePaginatedArreglos] Formato de respuesta no reconocido, retornando array vacío');
      return {
        arreglos: [],
        total: 0,
        pages: 0,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
