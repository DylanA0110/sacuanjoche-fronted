import { useState, useEffect } from 'react';
import { AppSidebar } from './Sidebar';
import { AppHeader } from './Header';
import { Suspense, lazy } from 'react';
import { useTokenExpirationCheck } from '@/shared/hooks/useTokenExpirationCheck';

// Lazy Breadcrumbs
const BreadcrumbsLazy = lazy(() =>
  import('./Breadcrumbs').then((m) => ({ default: m.Breadcrumbs }))
);

const BreadcrumbsFallback = () => (
  <div className="h-5 w-48 rounded bg-gray-200/50 animate-pulse" />
);

export function Layout({ children }: { children: React.ReactNode }) {
  // Estado del sidebar desktop (expandido/colapsado)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Cargar preferencia del usuario desde localStorage
    const saved = localStorage.getItem('sidebar:state');
    return saved !== 'collapsed';
  });

  // Estado del drawer móvil
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Detectar si estamos en mobile
  const [isMobile, setIsMobile] = useState(false);

  // Verificar expiración del token periódicamente usando hook optimizado
  // Nota: La verificación principal está en ProtectedRoute, esto es un backup
  useTokenExpirationCheck({
    checkInterval: 60000, // 1 minuto
    checkImmediately: false, // No verificar inmediatamente (ya se hace en ProtectedRoute)
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Guardar preferencia del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem(
      'sidebar:state',
      sidebarOpen ? 'expanded' : 'collapsed'
    );
  }, [sidebarOpen]);

  // Cerrar drawer móvil cuando cambia a desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileDrawerOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="flex h-screen w-full bg-[#F9F9F7] overflow-hidden">
      {/* SIDEBAR DESKTOP - Solo visible en md y arriba */}
      <div className="hidden md:block">
        <AppSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          mobile={false}
        />
      </div>

      {/* SIDEBAR MOBILE DRAWER - Solo visible en mobile cuando está abierto */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <AppSidebar
            isOpen={true}
            mobile={true}
            onClose={() => setMobileDrawerOpen(false)}
          />
          {/* Overlay oscuro para cerrar al hacer click fuera */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="flex-1 bg-black bg-opacity-40 transition-opacity"
          />
        </div>
      )}

      {/* ÁREA DERECHA (HEADER + CONTENIDO) */}
      <div
        className={`flex flex-col transition-all duration-300 min-w-0 flex-1 ${
          isMobile ? 'ml-0 w-full' : sidebarOpen ? 'md:ml-64 md:w-[calc(100%-16rem)]' : 'md:ml-16 md:w-[calc(100%-4rem)]'
        }`}
      >
        <AppHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenMobile={() => setMobileDrawerOpen(true)}
          isMobile={isMobile}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent min-w-0">
          <Suspense fallback={<BreadcrumbsFallback />}>
            <BreadcrumbsLazy />
          </Suspense>
          <div className="min-w-0 w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
