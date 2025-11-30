import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';
import { hasAdminPanelAccess } from '@/shared/api/interceptors';
import { useEffect, useState } from 'react';
import { checkAuthAction } from '@/auth/actions/check-status';
import { isTokenExpired } from '@/shared/utils/tokenUtils';
import { useTokenExpirationCheck } from '@/shared/hooks/useTokenExpirationCheck';

interface ClienteRouteProps {
  children: React.ReactNode;
}

/**
 * Componente que protege las rutas de la landing page
 * Solo permite acceso a usuarios con rol "cliente"
 * Los demás usuarios (admin, empleados) son redirigidos al panel administrativo
 * Los usuarios no autenticados pueden acceder (la landing es pública)
 */
export function ClienteRoute({ children }: ClienteRouteProps) {
  const location = useLocation();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Verificar expiración del token periódicamente
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
        localStorage.removeItem('token');
        logout();
        setIsChecking(false);
        return;
      }
      
      // Si hay token pero no está autenticado en el store, intentar sincronizar
      if (token && !isAuthenticated) {
        try {
          const userData = await checkAuthAction();
          setUser(userData);
        } catch (error) {
          // Si falla, el token es inválido - limpiar pero NO redirigir
          // Permitir que el usuario continúe navegando (la landing es pública)
          console.warn('Token inválido o expirado, limpiando estado de autenticación');
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

  // Si no está autenticado, permitir acceso (la landing es pública)
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  // Verificar si tiene acceso al panel administrativo
  const canAccessPanel = hasAdminPanelAccess(user.roles);
  const isCliente = user.cliente !== undefined && user.cliente !== null;
  const hasClienteRole = user.roles.includes('cliente');

  // Si tiene acceso al panel (admin, vendedor, conductor, etc.), redirigir al panel
  if (canAccessPanel) {
    return <Navigate to="/admin" replace />;
  }

  // Si NO es cliente, redirigir al panel
  if (!isCliente && !hasClienteRole) {
    return <Navigate to="/admin" replace />;
  }

  // Si es cliente, permitir acceso
  return <>{children}</>;
}

