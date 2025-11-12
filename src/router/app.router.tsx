import { createBrowserRouter } from 'react-router';
import { lazy, Suspense } from 'react';

// Lazy loading de la página principal para code splitting
const LandingPage = lazy(() => import('../landing/pages/LandingPage'));

// Componente de carga para el router
const RouterLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<RouterLoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
]);
