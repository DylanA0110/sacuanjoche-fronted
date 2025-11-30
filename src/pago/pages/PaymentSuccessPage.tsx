import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { confirmPagoPayPal } from '../actions/confirmPagoPayPal';
import { asociarPagoAlCarrito } from '@/carrito/actions/asociarPago';
import { useCarrito } from '@/carrito/hooks/useCarrito';
import type { Carrito } from '@/carrito/types/carrito.interface';
import { MdCheckCircle, MdError } from 'react-icons/md';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { carrito, refetch, isLoading } = useCarrito();
  const [estado, setEstado] = useState<'procesando' | 'exitoso' | 'error'>('procesando');
  const [mensaje, setMensaje] = useState('Procesando tu pago...');
  
  // Ref para evitar que se procese múltiples veces
  const procesadoRef = useRef(false);

  useEffect(() => {
    const procesarPago = async () => {
      // Evitar procesamiento múltiple
      if (procesadoRef.current) {
        return;
      }

      // Si el carrito ya tiene un pago confirmado, redirigir directamente
      const carritoTyped = carrito as Carrito | null;
      const pagoEstado = (carritoTyped?.pago as { estado?: string } | undefined)?.estado;
      if (carritoTyped?.idPago && pagoEstado === 'pagado') {
        procesadoRef.current = true;
        setEstado('exitoso');
        setMensaje('¡Pago confirmado exitosamente!');
        setTimeout(() => {
          navigate('/carrito/checkout/completar', { replace: true });
        }, 1000);
        return;
      }

      // Esperar a que el carrito se cargue
      if (isLoading) {
        return;
      }

      try {
        // Obtener parámetros de PayPal
        const token = searchParams.get('token');

        // Obtener idPago del localStorage
        const idPagoStr = localStorage.getItem('paypal_pago_id');
        
        // Si no hay idPago pero el carrito ya tiene pago, significa que ya se procesó
        if (!idPagoStr && carritoTyped?.idPago) {
          procesadoRef.current = true;
          setEstado('exitoso');
          setMensaje('¡Pago confirmado exitosamente!');
          setTimeout(() => {
            navigate('/carrito/checkout/completar', { replace: true });
          }, 1000);
          return;
        }
        
        // Validar datos con mensajes específicos
        if (!idPagoStr) {
          throw new Error('No se encontró el ID del pago. Por favor, intenta el pago nuevamente.');
        }

        if (!token) {
          throw new Error('No se recibió el token de PayPal. Por favor, intenta el pago nuevamente.');
        }

        const idPago = parseInt(idPagoStr, 10);
        if (isNaN(idPago) || idPago <= 0) {
          throw new Error('ID de pago inválido');
        }

        // Marcar como procesando para evitar ejecuciones duplicadas
        procesadoRef.current = true;

        // Obtener el carrito (intentar refetch si no está disponible)
        let carritoActual: Carrito | null = carritoTyped;
        if (!carritoActual) {
          const carritoRefetch = await refetch();
          carritoActual = (carritoRefetch.data as Carrito | null) || null;
          
          if (!carritoActual) {
            procesadoRef.current = false; // Permitir reintentar
            throw new Error('No se pudo cargar el carrito. Por favor, intenta nuevamente.');
          }
        }

        // 1. Confirmar el pago en PayPal
        setMensaje('Confirmando tu pago con PayPal...');

        const pagoConfirmado = await confirmPagoPayPal(idPago, {
          orderId: token,
        });

        if (!pagoConfirmado) {
          throw new Error('No se recibió respuesta al confirmar el pago');
        }

        if (pagoConfirmado.estado !== 'pagado') {
          throw new Error(`El pago no pudo ser confirmado. Estado: ${pagoConfirmado.estado}`);
        }

        if (!pagoConfirmado.idPago || pagoConfirmado.idPago !== idPago) {
          throw new Error('El ID del pago confirmado no coincide');
        }

        // 2. Asociar el pago al carrito
        setMensaje('Asociando el pago a tu carrito...');
        
        const carritoConPago = await asociarPagoAlCarrito(carritoActual.idCarrito, pagoConfirmado.idPago);
        
        // Verificar que el carrito tenga el pago asociado
        if (!carritoConPago.idPago) {
          throw new Error('No se pudo asociar el pago al carrito');
        }

        // 3. Actualizar el caché de React Query con la respuesta del endpoint
        setMensaje('Actualizando información del carrito...');
        
        // Actualizar el caché inmediatamente con la respuesta del endpoint
        queryClient.setQueryData(['carrito', 'activo'], carritoConPago);
        
        // Invalidar el caché para forzar un refetch fresco en el siguiente render
        await queryClient.invalidateQueries({ queryKey: ['carrito', 'activo'] });
        
        // Esperar un momento para que el backend procese
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Hacer refetch para obtener el carrito actualizado
        let carritoActualizado = await refetch();
        
        // Si el refetch no trae la información del pago, usar la respuesta del endpoint
        const carritoData = carritoActualizado.data as Carrito | null | undefined;
        const pagoData = (carritoConPago.pago as { estado?: string } | undefined);
        if (!carritoData?.pago && pagoData) {
          // Actualizar el caché manualmente con la respuesta del endpoint
          queryClient.setQueryData(['carrito', 'activo'], carritoConPago);
          carritoActualizado = { data: carritoConPago } as typeof carritoActualizado;
        }
        
        // Verificar que el carrito tenga la información completa del pago
        if (!carritoData?.pago) {
          // Esperar un poco más y reintentar
          await new Promise(resolve => setTimeout(resolve, 1000));
          carritoActualizado = await refetch();
          
          // Si aún no tiene, usar la respuesta del endpoint
          const carritoDataRetry = carritoActualizado.data as Carrito | null | undefined;
          if (!carritoDataRetry?.pago && pagoData) {
            queryClient.setQueryData(['carrito', 'activo'], carritoConPago);
            carritoActualizado = { data: carritoConPago } as typeof carritoActualizado;
          }
        }

        // 4. Limpiar localStorage del idPago
        localStorage.removeItem('paypal_pago_id');

        // 5. Mostrar éxito y redirigir al checkout
        setEstado('exitoso');
        setMensaje('¡Pago confirmado exitosamente!');
        toast.success('Pago confirmado. Completa la información de entrega para crear tu pedido.');

        // Redirigir a completar información de entrega para crear el pedido
        setTimeout(() => {
          navigate('/carrito/checkout/completar', { replace: true });
        }, 2000);

      } catch (error: unknown) {
        procesadoRef.current = false; // Permitir reintentar en caso de error
        setEstado('error');
        const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
        const errorMessage = errorObj.response?.data?.message || errorObj.message || 'Error al procesar el pago';
        setMensaje(errorMessage);
        toast.error(errorMessage);
        
        // Limpiar localStorage en caso de error
        localStorage.removeItem('paypal_pago_id');

        // Redirigir al carrito después de 3 segundos
        setTimeout(() => {
          navigate('/carrito', { replace: true });
        }, 3000);
      }
    };

    procesarPago();
  }, [searchParams, carrito, refetch, navigate, isLoading]);

  // Mostrar loading mientras se carga el carrito
  if (isLoading && estado === 'procesando') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cargando información</h1>
          <p className="text-gray-600">Esperando datos del carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {estado === 'procesando' && (
          <>
            <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Procesando tu pago</h1>
            <p className="text-gray-600">{mensaje}</p>
          </>
        )}

        {estado === 'exitoso' && (
          <>
            <MdCheckCircle className="w-20 h-20 text-[#50C878] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Confirmado!</h1>
            <p className="text-gray-600 mb-4">{mensaje}</p>
            <p className="text-sm text-gray-500">Redirigiendo al checkout...</p>
          </>
        )}

        {estado === 'error' && (
          <>
            <MdError className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al Procesar el Pago</h1>
            <p className="text-gray-600 mb-4">{mensaje}</p>
            <p className="text-sm text-gray-500">Redirigiendo al carrito...</p>
          </>
        )}
      </div>
    </div>
  );
}

