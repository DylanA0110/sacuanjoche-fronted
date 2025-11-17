import { arregloApi } from '../../api/arregloApi';

export const deleteMedia = async (
  arregloId: number,
  mediaId: number,
  deleteObject: boolean = false
): Promise<void> => {
  const response = await arregloApi.delete(`/${arregloId}/media/${mediaId}`, {
    params: { deleteObject },
  });
  // El endpoint devuelve 204 (No Content), así que no hay data que retornar
};

