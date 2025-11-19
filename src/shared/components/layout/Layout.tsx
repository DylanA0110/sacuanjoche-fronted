import { useState, useEffect } from 'react';
import { AppSidebar } from './Sidebar';
import { AppHeader } from './Header';
import { Suspense, lazy } from 'react';

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
        className={`flex flex-col w-full transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        <AppHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenMobile={() => setMobileDrawerOpen(true)}
          isMobile={isMobile}
        />

        <main className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <Suspense fallback={<BreadcrumbsFallback />}>
            <BreadcrumbsLazy />
          </Suspense>
          {children}
        </main>
      </div>
    </div>
  );
}
