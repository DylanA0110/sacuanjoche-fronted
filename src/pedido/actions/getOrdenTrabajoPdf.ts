import { floristeriaApi } from '@/shared/api/FloristeriaApi';

/**
 * Descarga el PDF de la Orden de Trabajo para un pedido específico.
 * Endpoint: GET /api/reports/pedido/{idPedido}/orden-trabajo/pdf
 *
 * @param idPedido ID del pedido
 * @returns Blob del PDF (por si se necesita manipular); además dispara descarga automática
 */
export const getOrdenTrabajoPdf = async (idPedido: number): Promise<Blob> => {
  try {
    const response = await floristeriaApi.get(
      `/reports/pedido/${idPedido}/orden-trabajo/pdf`,
      {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
      }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Crear link temporal para descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = `orden-trabajo-pedido-${idPedido}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    return blob;
  } catch (error) {
    console.error('Error al descargar Orden de Trabajo PDF:', error);
    throw error;
  }
};
