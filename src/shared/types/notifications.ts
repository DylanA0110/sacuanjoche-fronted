export type AdminNotificationType = 'nuevo_pedido_web';

export interface AdminNotificationPayload {
  tipo: AdminNotificationType;
  id_registro: number | string;
  nombre_cliente?: string;
  timestamp: string;
  data?: {
    numeroPedido?: string;
    totalPedido?: number;
    estado?: string;
    canal?: string;
    fechaEntregaEstimada?: string;
    cantidadProductos?: number;
  };
}










