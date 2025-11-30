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
      {/* Header mejorado */}
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-2 sm:mb-3 text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-base sm:text-lg text-gray-600 font-medium">
          Bienvenido al panel de administración de Floristería Sacuanjoche
        </p>
      </div>

      {/* Cards de estadísticas */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 tracking-wider">
              Total Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#50C878]">0</div>
            <p className="text-xs text-gray-500 mt-1">Clientes activos</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 tracking-wider">
              Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">0</div>
            <p className="text-xs text-gray-500 mt-1">Pedidos pendientes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 tracking-wider">
              Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">0</div>
            <p className="text-xs text-gray-500 mt-1">En catálogo</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 tracking-wider">
              Arreglos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">0</div>
            <p className="text-xs text-gray-500 mt-1">Arreglos disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección de acciones rápidas */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 w-full">
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Próximamente: Accesos directos a funciones principales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Últimas acciones realizadas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">
              Próximamente: Historial de actividades
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

