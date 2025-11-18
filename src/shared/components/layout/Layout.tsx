import { SidebarProvider } from '@/shared/components/ui/sidebar';
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
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />

        {/* Contenido principal que se ajusta automáticamente según el ancho del sidebar spacer */}
        <div className="flex-1 flex flex-col min-w-0 shrink-0">
          <AppHeader />

          <main className="flex-1 p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
            <Suspense fallback={<BreadcrumbsFallback />}>
              <BreadcrumbsLazy />
            </Suspense>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
