import { arregloApi } from '../api/arregloApi';
import type {
  GetArreglosParams,
  Arreglo,
  Media,
  ArregloResponse,
  ArregloMediaResponse,
  ArreglosPaginatedResponse,
} from '../types/arreglo.interface';
import type { PaginatedResponse } from '@/shared/types/pagination';

const mapMediaResponse = (m: ArregloMediaResponse): Media => ({
  idArregloMedia: m.idArregloMedia,
  idMedia: m.idArregloMedia, // Compatibilidad
  idArreglo: m.idArreglo,
  url: m.url,
  objectKey: m.objectKey,
  orden: m.orden || 0,
  isPrimary: m.isPrimary || false,
  tipo: m.tipo || 'imagen',
  altText: m.altText,
  activo: m.activo !== undefined ? m.activo : true,
  fechaCreacion: m.fechaCreacion,
  fechaUltAct: m.fechaUltAct,
});

const mapArregloResponse = (arreglo: ArregloResponse): Arreglo => ({
  ...arreglo,
  estado: arreglo.estado || 'activo',
  media: (arreglo.media || []).map(mapMediaResponse),
});

export const getArreglos = async (
  params?: GetArreglosParams
): Promise<Arreglo[] | PaginatedResponse<Arreglo>> => {
  try {
    // Construir parámetros de consulta
    // NO enviar estado al backend, se filtra en el frontend
    const queryParams = params
      ? {
          ...(params.limit !== undefined && { limit: params.limit }),
          ...(params.offset !== undefined && { offset: params.offset }),
          ...(params.q && params.q.trim() && { q: params.q.trim() }),
          // estado se filtra en el frontend, no se envía al backend
        }
      : undefined;

    const response = await arregloApi.get<ArreglosPaginatedResponse | ArregloResponse[]>('/', {
      params: queryParams,
    });

    // El backend siempre devuelve formato paginado: { data: [...], total: number }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      !Array.isArray(response.data)
    ) {
      const paginatedData = response.data as ArreglosPaginatedResponse;
      const paginatedResponse: PaginatedResponse<Arreglo> = {
        data: (paginatedData.data || []).map(mapArregloResponse),
        total: paginatedData.total ?? 0,
      };
      return paginatedResponse;
    }

    // Fallback: si viene como array directo (caso legacy)
    if (Array.isArray(response.data)) {
      const mapped = response.data.map(mapArregloResponse);
      
      // Si hay parámetros de paginación, necesitamos obtener el total real
      if (params?.limit !== undefined || params?.offset !== undefined) {
        const limit = params.limit || 10;
        const offset = params.offset || 0;
        
        // Si tenemos menos elementos que el limit, sabemos que es la última página
        if (mapped.length < limit) {
          return {
            data: mapped,
            total: offset + mapped.length,
          };
        }
        
        // Si tenemos exactamente 'limit' elementos, obtener el total real
        try {
          const totalResponse = await arregloApi.get<ArreglosPaginatedResponse | ArregloResponse[]>('/', {
            params: {
              ...(params.q && params.q.trim() && { q: params.q.trim() }),
              limit: 10000, // Límite muy alto para obtener todos
              offset: 0,
            },
          });
          
          let total = 0;
          if (Array.isArray(totalResponse.data)) {
            total = totalResponse.data.length;
          } else if (totalResponse.data && typeof totalResponse.data === 'object' && 'total' in totalResponse.data) {
            total = (totalResponse.data as any).total || 0;
          }
          
          // Si el total sigue siendo 10 (igual al limit actual), usar estimación
          if (total === 10 && mapped.length === 10 && limit === 10) {
            total = offset + mapped.length + 1;
          }
          
          return {
            data: mapped,
            total: total,
          };
        } catch (totalError) {
          // Si falla obtener el total, usar lógica de fallback
          if (mapped.length < limit) {
            return {
              data: mapped,
              total: offset + mapped.length,
            };
          }
          return {
            data: mapped,
            total: offset + mapped.length + 1,
          };
        }
      }
      
      // Sin paginación, devolver con total = length
      return {
        data: mapped,
        total: mapped.length,
      };
    }

    // Si no hay datos, devolver respuesta paginada vacía
    return {
      data: [],
      total: 0,
    };
  } catch (error) {
    throw error;
  }
};

