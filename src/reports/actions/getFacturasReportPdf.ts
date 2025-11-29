import { floristeriaApi } from '@/shared/api/FloristeriaApi';

export interface GetFacturasReportPdfParams {
  limit?: number;
  offset?: number;
  q?: string;
}

/**
 * Descarga el PDF del reporte de facturas.
 * Endpoint: GET /api/reports/facturas/pdf
 */
export const getFacturasReportPdf = async (
  params?: GetFacturasReportPdfParams
): Promise<Blob> => {
  try {
    const response = await floristeriaApi.get('/reports/facturas/pdf', {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
      params,
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-facturas-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error('Error al descargar PDF de reporte de facturas:', error);
    throw error;
  }
};

