import { floristeriaApi } from '@/shared/api/FloristeriaApi';

export interface GetPedidosReportPdfParams {
  limit?: number;
  offset?: number;
  q?: string;
}

/**
 * Descarga el PDF del reporte de pedidos.
 * Endpoint: GET /api/reports/pedidos/pdf
 */
export const getPedidosReportPdf = async (
  params?: GetPedidosReportPdfParams
): Promise<Blob> => {
  try {
    const response = await floristeriaApi.get('/reports/pedidos/pdf', {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
      params,
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-pedidos-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error('Error al descargar PDF de reporte de pedidos:', error);
    throw error;
  }
};

