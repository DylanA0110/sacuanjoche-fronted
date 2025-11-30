import { useEffect } from 'react';
import { Link } from 'react-router';
import { MdCancel } from 'react-icons/md';
import { toast } from 'sonner';

export default function PaymentCancelPage() {

  useEffect(() => {
    // Limpiar localStorage
    localStorage.removeItem('paypal_pago_id');
    toast.info('Pago cancelado');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <MdCancel className="w-20 h-20 text-orange-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago Cancelado</h1>
        <p className="text-gray-600 mb-6">
          Has cancelado el proceso de pago. Tu carrito sigue disponible para que puedas intentar nuevamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/carrito"
            className="px-6 py-3 bg-[#50C878] text-white rounded-lg hover:bg-[#00A87F] transition-colors font-semibold"
          >
            Volver al Carrito
          </Link>
          <Link
            to="/catalogo"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}

