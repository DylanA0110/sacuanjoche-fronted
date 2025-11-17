import { arregloApi } from '../../api/arregloApi';
import type { UploadUrlRequest, UploadUrlResponse } from '../../types/arreglo.interface';

export const getUploadUrl = async (
  data: UploadUrlRequest
): Promise<UploadUrlResponse> => {
  const response = await arregloApi.post<UploadUrlResponse>(
    '/media/upload-url',
    data
  );
  return response.data;
};

