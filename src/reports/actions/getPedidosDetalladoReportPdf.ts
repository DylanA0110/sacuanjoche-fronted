import { floristeriaApi } from '@/shared/api/FloristeriaApi';

export interface GetPedidosDetalladoReportPdfParams {
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD
}

/**
 * Descarga el PDF del reporte detallado de pedidos.
 * Endpoint: GET /api/reports/pedidos/detallado/pdf
 */
export const getPedidosDetalladoReportPdf = async (
  params?: GetPedidosDetalladoReportPdfParams
): Promise<Blob> => {
  try {
    const response = await floristeriaApi.get('/reports/pedidos/detallado/pdf', {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
      params,
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-pedidos-detallado-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error('Error al descargar PDF de reporte detallado de pedidos:', error);
    throw error;
  }
};

