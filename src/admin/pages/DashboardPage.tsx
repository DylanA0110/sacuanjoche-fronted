import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  MdShoppingCart,
  MdLocalFlorist,
  MdPeople,
} from 'react-icons/md';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirigir conductores a Mis Rutas
  useEffect(() => {
    if (user?.roles?.includes('conductor')) {
      navigate('/admin/mis-rutas', { replace: true });
    }
  }, [user, navigate]);

  // Si es conductor, no renderizar nada (se está redirigiendo)
  if (user?.roles?.includes('conductor')) {
    return null;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Home</h1>
      </div>

      {/* Sección de acciones rápidas */}
      <div className="w-full flex justify-center">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#50C878]/10 hover:border-[#50C878] transition-colors"
              onClick={() => navigate('/admin/pedidos/nuevo')}
            >
              <MdShoppingCart className="h-4 w-4 mr-2" />
              Nuevo Pedido
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#50C878]/10 hover:border-[#50C878] transition-colors"
              onClick={() => navigate('/admin/arreglos', { state: { openForm: true } })}
            >
              <MdLocalFlorist className="h-4 w-4 mr-2" />
              Nuevo Arreglo
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-[#50C878]/10 hover:border-[#50C878] transition-colors"
              onClick={() => navigate('/admin/clientes', { state: { openForm: true } })}
            >
              <MdPeople className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

