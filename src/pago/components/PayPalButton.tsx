import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import { asociarPagoAlCarrito } from '@/carrito/actions/asociarPago';
import { useCarrito } from '@/carrito/hooks/useCarrito';
import { toast } from 'sonner';
import { useState } from 'react';

interface PayPalButtonProps {
  monto: number;
  idMetodoPago: number;
  onSuccess?: (idPago: number) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

// Obtener el Client ID de PayPal desde variables de entorno
const getPayPalClientId = () => {
  return import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb';
};

/**
 * Componente interno que usa el hook de PayPal
 */
function PayPalButtonsWrapper({ monto, idMetodoPago, onSuccess, onError, disabled }: PayPalButtonProps) {
  const { carrito, refetch } = useCarrito();
  const [isProcessing, setIsProcessing] = useState(false);
  const [{ isPending }] = usePayPalScriptReducer();

  /**
   * Crear orden en PayPal usando el backend
   * Similar al ejemplo: llama al backend para crear la orden
   */
  const handleCreateOrder = async (): Promise<string> => {
    try {
      setIsProcessing(true);
      
      console.log('🔄 [PayPal] Creando orden en backend...', { monto, idMetodoPago });

      // Crear el pago en nuestro backend (esto crea la orden en PayPal)
      const response = await floristeriaApi.post('/pago/paypal/create', {
        idMetodoPago,
        monto,
      });

      const pagoData = response.data;

      if (!pagoData?.idGateway) {
        throw new Error('No se recibió el ID de la orden de PayPal');
      }

      // Guardar el idPago para usarlo después
      localStorage.setItem('paypal_pago_id', pagoData.idPago.toString());

      console.log('✅ [PayPal] Orden creada:', pagoData.idGateway);

      // Devolver el orderId (idGateway) que PayPal necesita
      return pagoData.idGateway;
    } catch (error: any) {
      console.error('❌ Error al crear orden de PayPal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el pago';
      toast.error(errorMessage);
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Capturar orden cuando el usuario aprueba el pago
   * Similar al ejemplo: llama al backend para capturar la orden
   */
  const handleApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      setIsProcessing(true);

      console.log('🔄 [PayPal] Capturando orden:', data.orderID);

      // Obtener idPago del localStorage
      const idPagoStr = localStorage.getItem('paypal_pago_id');
      if (!idPagoStr) {
        throw new Error('No se encontró el ID del pago');
      }

      const idPago = parseInt(idPagoStr, 10);
      if (isNaN(idPago)) {
        throw new Error('ID de pago inválido');
      }

      // Confirmar/capturar el pago en nuestro backend
      const response = await floristeriaApi.post(`/pago/paypal/confirm/${idPago}`, {
        orderId: data.orderID,
      });

      const pagoConfirmado = response.data;

      if (pagoConfirmado.estado !== 'pagado') {
        throw new Error('El pago no pudo ser confirmado');
      }

      console.log('✅ [PayPal] Pago capturado y confirmado:', pagoConfirmado);

      // Asociar el pago al carrito si existe
      if (carrito) {
        await asociarPagoAlCarrito(carrito.idCarrito, pagoConfirmado.idPago);
        await refetch();
      }

      // Limpiar localStorage
      localStorage.removeItem('paypal_pago_id');

      toast.success('✅ Pago confirmado exitosamente');
      
      if (onSuccess) {
        onSuccess(pagoConfirmado.idPago);
      }
    } catch (error: any) {
      console.error('❌ Error al capturar el pago:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar el pago';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (err: any) => {
    console.error('❌ Error en PayPal:', err);
    toast.error('Error al procesar el pago con PayPal');
    if (onError) {
      onError(err);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('paypal_pago_id');
    toast.info('Pago cancelado');
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-600">Cargando PayPal...</span>
      </div>
    );
  }

  return (
    <div className={disabled || isProcessing ? 'opacity-50 pointer-events-none' : ''}>
      <PayPalButtons
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onError={handleError}
        onCancel={handleCancel}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        }}
        disabled={disabled || isProcessing}
      />
      {isProcessing && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">Procesando pago...</p>
        </div>
      )}
    </div>
  );
}

/**
 * Componente principal que envuelve con PayPalScriptProvider
 */
export function PayPalButton({ monto, idMetodoPago, onSuccess, onError, disabled }: PayPalButtonProps) {
  const clientId = getPayPalClientId();

  if (!clientId || clientId === 'sb') {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ PayPal Client ID no configurado. Configura VITE_PAYPAL_CLIENT_ID en tu archivo .env
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': clientId,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalButtonsWrapper
        monto={monto}
        idMetodoPago={idMetodoPago}
        onSuccess={onSuccess}
        onError={onError}
        disabled={disabled}
      />
    </PayPalScriptProvider>
  );
}
