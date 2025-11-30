import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';
import { hasAdminPanelAccess } from '@/shared/api/interceptors';
import { useEffect, useState } from 'react';
import { checkAuthAction } from '@/auth/actions/check-status';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { AlertCircle, ShieldX } from 'lucide-react';
import { isTokenExpired } from '@/shared/utils/tokenUtils';
import { useTokenExpirationCheck } from '@/shared/hooks/useTokenExpirationCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Verificar expiración del token periódicamente usando hook optimizado
  useTokenExpirationCheck({
    checkInterval: 60000, // 1 minuto
    checkImmediately: true,
    onExpired: () => {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      // Verificar si el token está vencido
      if (token && isTokenExpired(token)) {
        // Token vencido, limpiar y redirigir
        localStorage.removeItem('token');
        logout();
        setIsChecking(false);
        return;
      }
      
      if (token && !isAuthenticated) {
        try {
          const userData = await checkAuthAction();
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
          logout();
        }
      }
      
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, setUser, logout]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si es cliente intentando acceder al panel
  const isCliente = user.cliente !== undefined && user.cliente !== null;
  const canAccessPanel = hasAdminPanelAccess(user.roles);

  // Si está autenticado pero es cliente (no tiene acceso al panel), redirigir a landing
  if (isCliente && !canAccessPanel && location.pathname.startsWith('/admin')) {
    return <Navigate to="/" replace />;
  }

  // Verificar si es empleado sin rol de acceso
  const roles = Array.isArray(user.roles) ? user.roles.map((r) => String(r).toLowerCase()) : [];
  const isEmpleado = roles.includes('empleado') || user.empleado !== undefined;
  const hasAccessRole = roles.some(role => 
    ['admin', 'vendedor', 'conductor', 'gerente', 'superuser'].includes(role)
  );
  const isEmpleadoSinAcceso = isEmpleado && !hasAccessRole && location.pathname.startsWith('/admin');

  // Si es empleado sin rol de acceso, mostrar mensaje personalizado
  if (isEmpleadoSinAcceso) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="w-full max-w-2xl border-destructive/50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <ShieldX className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-destructive">
              Acceso No Disponible
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p className="text-lg font-medium">
                  Tu cuenta aún no tiene permisos para acceder al sistema
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                <p className="text-base text-foreground">
                  Tu cuenta de empleado aún no se le ha asignado un rol (como vendedor, admin o conductor) 
                  para poder acceder al sistema administrativo.
                </p>
                <p className="text-base text-foreground font-semibold">
                  Por favor, contacta con el administrador para que te asignen los permisos necesarios.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  logout();
                  window.location.href = '/';
                }}
                variant="default"
                className="min-w-[200px]"
              >
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si se requieren roles específicos, verificar
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));
    if (!hasRequiredRole) {
      // Si no tiene el rol requerido, redirigir según el tipo de usuario
      const esConductor = user.roles?.includes('conductor');
      if (esConductor) {
        // Si es conductor, llevarlo a Mis Rutas
        return <Navigate to="/admin/mis-rutas" replace />;
      } else if (canAccessPanel) {
        // Si tiene acceso al panel pero no al rol específico, redirigir al dashboard
        return <Navigate to="/admin" replace />;
      } else {
        // Si es cliente, redirigir a la landing
        return <Navigate to="/" replace />;
      }
    }
  }

  // Verificar acceso al panel administrativo
  // Si estamos en /admin o subrutas, verificar que tenga acceso al panel
  if (location.pathname.startsWith('/admin')) {
    if (!canAccessPanel) {
      // Si es cliente intentando acceder al panel, redirigir a la landing
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

