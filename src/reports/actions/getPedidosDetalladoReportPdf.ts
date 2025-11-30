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
    const response = await floristeriaApi.get(
      '/reports/pedidos/detallado/pdf',
      {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
        params,
      }
    );

    // Verificar que la respuesta sea realmente un PDF
    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      throw new Error(
        'El servidor devolvió una respuesta HTML en lugar de un PDF. Esto puede indicar que el endpoint no existe o hay un error en el servidor.'
      );
    }
    if (
      !contentType.includes('application/pdf') &&
      !contentType.includes('application/octet-stream')
    ) {
      throw new Error(
        `El servidor devolvió un tipo de contenido inesperado: ${contentType}. Se esperaba un PDF.`
      );
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-pedidos-detallado-${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error: any) {
    console.error(
      'Error al descargar PDF de reporte detallado de pedidos:',
      error
    );
    if (error.response?.status === 404) {
      throw new Error(
        'El endpoint de reporte detallado de pedidos no fue encontrado. Verifica que el servidor esté funcionando correctamente.'
      );
    } else if (error.response?.status === 500) {
      throw new Error(
        'Error interno del servidor al generar el reporte. Por favor, intenta más tarde.'
      );
    } else if (error.message) {
      throw error;
    } else {
      throw new Error(
        'Error desconocido al descargar el reporte detallado de pedidos.'
      );
    }
  }
};
