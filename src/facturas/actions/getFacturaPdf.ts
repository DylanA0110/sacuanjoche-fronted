import { floristeriaApi } from '@/shared/api/FloristeriaApi';

/**
 * Descarga el PDF de una factura específica.
 * Endpoint: GET /api/reports/factura/{idFactura}/pdf
 *
 * @param idFactura ID de la factura
 * @returns Blob del PDF
 */
export const getFacturaPdf = async (idFactura: number): Promise<Blob> => {
  try {
    const response = await floristeriaApi.get(`/reports/factura/${idFactura}/pdf`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `factura-${idFactura}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error('Error al descargar PDF de factura:', error);
    throw error;
  }
};
