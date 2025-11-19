import { arregloMediaApi } from '../../api/arregloMediaApi';

export const deleteArregloMedia = async (
  idArreglo: number,
  mediaId: number
): Promise<void> => {
  await arregloMediaApi.delete(`/${idArreglo}/media/${mediaId}`);
};

