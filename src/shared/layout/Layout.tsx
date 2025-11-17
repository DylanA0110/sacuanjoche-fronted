import {
  SidebarProvider,
  SidebarInset,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { AppSidebar } from './Sidebar';

function MainContent({ children }: { children: React.ReactNode }) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // En móviles, el sidebar está oculto por defecto, así que no necesitamos margen
  if (isMobile) {
    return (
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent transition-all duration-300 ease-in-out w-full">
        {/* Botón flotante para abrir sidebar en móviles */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <button
            onClick={() => setOpenMobile(true)}
            className="h-14 w-14 rounded-full bg-[#50C878] text-white shadow-2xl shadow-[#50C878]/50 flex items-center justify-center hover:bg-[#50C878]/90 active:scale-95 transition-all duration-200"
            aria-label="Abrir menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pt-20 sm:pt-24">
          {children}
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent transition-all duration-300 ease-in-out"
      style={{
        marginLeft: isCollapsed ? '3rem' : '16rem',
        width: isCollapsed ? 'calc(100vw - 3rem)' : 'calc(100vw - 16rem)',
        maxWidth: isCollapsed ? 'calc(100vw - 3rem)' : 'calc(100vw - 16rem)',
      }}
    >
      <div className="w-full max-w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 transition-all duration-300 ease-in-out">
        {children}
      </div>
    </main>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full relative bg-gray-50 overflow-x-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset
          className="flex flex-col bg-transparent admin-panel transition-all duration-300 ease-in-out"
          data-admin-panel
        >
          <MainContent>{children}</MainContent>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
