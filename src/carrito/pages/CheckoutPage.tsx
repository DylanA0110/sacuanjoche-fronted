import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCarrito } from '../hooks/useCarrito';
import { useAuthStore } from '@/auth/store/auth.store';
import { createPagoPayPal } from '@/pago/actions/createPagoPayPal';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { MdArrowBack } from 'react-icons/md';
import { Link } from 'react-router';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { carrito, subtotal, itemCount } = useCarrito();
  const [isProcessing, setIsProcessing] = useState(false);

  // Limpiar estado de pago anterior si el carrito no tiene pago
  useEffect(() => {
    // Si el carrito no tiene idPago, limpiar cualquier estado de pago anterior del localStorage
    if (carrito && !carrito.idPago) {
      const paypalPagoId = localStorage.getItem('paypal_pago_id');
      if (paypalPagoId) {
        console.log('🧹 Limpiando estado de pago anterior del localStorage...');
        localStorage.removeItem('paypal_pago_id');
      }
    }
  }, [carrito?.idPago]);

  // ID del método de pago PayPal (siempre 2)
  const ID_METODO_PAGO_PAYPAL = 2;

  // Tasa de cambio: 1 USD = 36.7 NIO (córdobas nicaragüenses)
  // Esta tasa puede variar, idealmente debería obtenerse de una API de cambio en tiempo real
  const TASA_CAMBIO_NIO_USD = 36.7;

  // Función para convertir córdobas (NIO) a dólares (USD)
  // PayPal requiere montos con máximo 2 decimales
  const convertirNIOaUSD = (montoNIO: number): number => {
    const montoUSD = montoNIO / TASA_CAMBIO_NIO_USD;
    // Redondear a 2 decimales para PayPal
    return Math.round(montoUSD * 100) / 100;
  };

  // Calcular el monto en USD para PayPal
  const montoUSD = convertirNIOaUSD(subtotal);

  // Verificar autenticación
  if (!isAuthenticated || !user) {
    navigate('/login', { state: { from: '/carrito/checkout' } });
    return null;
  }

  if (!carrito || carrito.carritosArreglo?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Tu carrito está vacío</p>
          <Link to="/catalogo">
            <button className="px-4 py-2 bg-[#50C878] text-white rounded-lg">
              Ver Catálogo
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Solo redirigir a completar pedido si el pago está REALMENTE confirmado (estado "pagado")
  // Si el carrito tiene idPago pero el pago no está confirmado, permitir crear un nuevo pago
  useEffect(() => {
    if (carrito?.idPago && carrito.carritosArreglo && carrito.carritosArreglo.length > 0) {
      // Verificar que el pago esté realmente confirmado
      if (carrito.pago?.estado === 'pagado') {
        console.log('✅ Pago confirmado, redirigiendo a completar pedido...');
        navigate('/carrito/checkout/completar', { replace: true });
      } else {
        // Si tiene idPago pero no está pagado, es un pago anterior o pendiente
        // Limpiar el idPago del carrito para permitir crear un nuevo pago
        console.log('⚠️ Carrito tiene idPago pero el pago no está confirmado. Permitir crear nuevo pago.');
        console.log('📋 Estado del pago:', carrito.pago?.estado || 'sin información');
        // No redirigir - permitir que el usuario cree un nuevo pago
      }
    } else if (carrito?.idPago && (!carrito.carritosArreglo || carrito.carritosArreglo.length === 0)) {
      // Carrito sin productos pero con idPago - no hacer nada, el usuario necesita agregar productos
      console.log('🔄 Carrito sin productos pero con idPago. Esperando productos...');
    }
  }, [carrito?.idPago, carrito?.pago?.estado, carrito?.carritosArreglo, navigate]);

  // Función para crear pago y redirigir a PayPal
  const handlePayWithPayPal = async () => {
    setIsProcessing(true);

    try {
      console.log('🔄 Creando pago PayPal...', { 
        montoNIO: subtotal, 
        montoUSD: montoUSD,
        idMetodoPago: ID_METODO_PAGO_PAYPAL,
        carritoIdPago: carrito?.idPago,
        pagoEstado: carrito?.pago?.estado,
      });

      // Validar que el carrito exista
      if (!carrito?.idCarrito) {
        throw new Error('No se pudo obtener el carrito. Por favor, intenta nuevamente.');
      }

      // Si el carrito tiene un idPago pero el pago no está confirmado, limpiar el estado
      // Esto permite crear un nuevo pago para este carrito
      if (carrito.idPago && carrito.pago?.estado !== 'pagado') {
        console.log('⚠️ Carrito tiene idPago pero el pago no está confirmado. Creando nuevo pago...');
        console.log('📋 Estado del pago anterior:', carrito.pago?.estado || 'sin información');
        // Continuar con la creación del nuevo pago - el backend manejará la asociación
      }

      // Crear pago con PayPal - convertir a USD antes de enviar
      // El backend debe recibir el monto en USD para PayPal
      const pagoPayPal = await createPagoPayPal({
        idMetodoPago: ID_METODO_PAGO_PAYPAL,
        monto: montoUSD, // Enviar monto en USD a PayPal
      });

      console.log('✅ Pago PayPal creado:', pagoPayPal);

      // Validar respuesta del backend
      if (!pagoPayPal) {
        throw new Error('No se recibió respuesta del servidor al crear el pago');
      }

      // Validar que idPago exista y sea válido
      if (!pagoPayPal.idPago || pagoPayPal.idPago <= 0) {
        console.error('❌ idPago inválido en respuesta:', pagoPayPal);
        throw new Error('El servidor no devolvió un ID de pago válido');
      }

      // Validar que paypalApprovalUrl exista
      if (!pagoPayPal?.paypalApprovalUrl) {
        console.error('❌ paypalApprovalUrl no recibida:', pagoPayPal);
        throw new Error('No se recibió la URL de aprobación de PayPal');
      }

      // Guardar idPago para usarlo después de confirmar
      localStorage.setItem('paypal_pago_id', pagoPayPal.idPago.toString());
      
      // Verificar que se guardó correctamente
      const savedId = localStorage.getItem('paypal_pago_id');
      if (savedId !== pagoPayPal.idPago.toString()) {
        console.error('❌ Error al guardar idPago en localStorage');
        throw new Error('Error al guardar el ID del pago');
      }

      console.log('💾 idPago guardado correctamente:', savedId);
      console.log('🔗 Redirigiendo a PayPal:', pagoPayPal.paypalApprovalUrl);

      // Redirigir a PayPal para que el usuario inicie sesión y pague
      window.location.href = pagoPayPal.paypalApprovalUrl;

    } catch (error: any) {
      console.error('❌ Error al crear pago PayPal:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar el pago';
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header simple */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/carrito"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MdArrowBack className="h-5 w-5" />
              <span className="text-sm font-medium">Volver al carrito</span>
            </Link>
            <div className="flex-1" />
            <h1 className="text-2xl font-bold text-gray-900">Pagar con PayPal</h1>
            <div className="flex-1" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenedor principal */}
          <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                <CardTitle>Completa tu pago</CardTitle>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      💳 Paga de forma segura con PayPal
                    </p>
                    <p className="text-xs text-blue-700">
                      Total a pagar: <strong>C${subtotal.toFixed(2)}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Equivalente en USD: <strong>${montoUSD.toFixed(2)}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Serás redirigido a PayPal para iniciar sesión y completar el pago
                    </p>
                    <p className="text-xs text-blue-500 mt-1 italic">
                      Tasa de cambio: 1 USD = C${TASA_CAMBIO_NIO_USD.toFixed(2)}
                    </p>
                  </div>

                  {/* Botón oficial de PayPal */}
                          <button
                    onClick={handlePayWithPayPal}
                    disabled={isProcessing}
                    className="w-full relative overflow-hidden rounded-md transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    style={{
                      backgroundColor: '#0070ba',
                      height: '48px',
                      border: 'none',
                    }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center h-full text-white font-semibold">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Procesando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full gap-2">
                        {/* Logo oficial de PayPal */}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.076 13.382c-.11.653-.485.996-1.125.996H4.1l.8-5.15h1.85c.64 0 1.01.343 1.126.996l.2 3.158zM16.5 8.228c-.15.95-.64 1.41-1.47 1.41h-.75l.5-3.23h.75c.83 0 1.32.46 1.47 1.41l.03.41z"
                            fill="#fff"
                          />
                          <path
                            d="M17.5 6.408h-3.5c-.3 0-.5.2-.6.5l-1.5 9.5c-.1.3 0 .6.2.7.1.1.3.1.4.1h1.9l.3-1.9h2.8c.3 0 .5-.2.6-.5l.8-5c.1-.3 0-.6-.2-.7-.1-.1-.2-.1-.4-.1zm-10.5 7.5c-.1.6-.5.9-1.1.9H3.5l.8-5.2h2.4c.6 0 1 .3 1.1.9l.2 3.4z"
                            fill="#fff"
                          />
                        </svg>
                        <span className="text-white font-semibold text-base tracking-wide">PayPal</span>
                        </div>
                      )}
                  </button>

                  {/* Texto informativo */}
                  <p className="text-xs text-gray-500 text-center">
                    Al hacer clic en el botón, serás redirigido a PayPal para completar tu pago de forma segura
                  </p>
                    </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                    </span>
                      <span className="text-gray-900 font-medium">C${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-base font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-gray-900">
                        C${subtotal.toFixed(2)}
                        </span>
                    </div>
                    </div>
                  </div>

                {/* Lista de productos */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Productos:</p>
                  {carrito.carritosArreglo?.map((item) => {
                    const precio = Number(item.precioUnitario) || 0;
                    return (
                      <div key={item.idCarritoArreglo} className="text-sm text-gray-600">
                        <p className="font-medium">{item.arreglo?.nombre || 'Arreglo'}</p>
                        <p className="text-xs">
                          Cantidad: {item.cantidad} × C${precio.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 text-center pt-4">
                    Tu información está protegida con encriptación SSL
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </div>
  );
}
