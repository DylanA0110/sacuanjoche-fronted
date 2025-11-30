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
    link.download = `reporte-arreglos-${
      new Date().toISOString().split('T')[0]
    }.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error: any) {
    console.error('Error al descargar PDF de reporte de arreglos:', error);
    if (error.response?.status === 404) {
      throw new Error(
        'El endpoint de reporte de arreglos no fue encontrado. Verifica que el servidor esté funcionando correctamente.'
      );
    } else if (error.response?.status === 500) {
      throw new Error(
        'Error interno del servidor al generar el reporte. Por favor, intenta más tarde.'
      );
    } else if (error.message) {
      throw error;
    } else {
      throw new Error('Error desconocido al descargar el reporte de arreglos.');
    }
  }
};
