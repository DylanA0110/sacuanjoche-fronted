import { arregloApi } from '../api/arregloApi';
import type {
  Arreglo,
  UpdateArregloDto,
  Media,
  ArregloResponse,
  ArregloMediaResponse,
} from '../types/arreglo.interface';

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

const mapArregloResponse = (response: ArregloResponse): Arreglo => ({
  ...response,
  estado: response.estado || 'activo',
  media: (response.media || []).map(mapMediaResponse),
});

export const updateArreglo = async (
  id: number,
  arregloData: UpdateArregloDto
): Promise<Arreglo> => {
  const response = await arregloApi.patch<ArregloResponse>(`/${id}`, arregloData);
  return mapArregloResponse(response.data);
};

