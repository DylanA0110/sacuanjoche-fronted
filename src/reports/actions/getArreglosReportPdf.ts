import { floristeriaApi } from '@/shared/api/FloristeriaApi';

export interface GetArreglosReportPdfParams {
  limit?: number;
  offset?: number;
  q?: string;
}

/**
 * Descarga el PDF del reporte de arreglos.
 * Endpoint: GET /api/reports/arreglos/pdf
 */
export const getArreglosReportPdf = async (
  params?: GetArreglosReportPdfParams
): Promise<Blob> => {
  try {
    const response = await floristeriaApi.get('/reports/arreglos/pdf', {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
      params,
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-arreglos-${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error('Error al descargar PDF de reporte de arreglos:', error);
    throw error;
  }
};
