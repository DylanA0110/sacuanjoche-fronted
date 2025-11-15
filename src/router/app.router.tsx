import { createBrowserRouter, Outlet } from 'react-router';
import { lazy, Suspense } from 'react';
import { Layout } from '@/shared/layout/Layout';

// Lazy loading de páginas para code splitting
const LandingPage = lazy(() => import('../landing/pages/LandingPage'));
const DashboardPage = lazy(() => import('../admin/pages/DashboardPage'));
const FacturasPage = lazy(() => import('../facturas/pages/FacturasPage'));

// Componente de carga para el router
const RouterLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
  </div>
);

// Layout wrapper para rutas de admin
const AdminLayout = () => {
  return (
    <Layout>
      <Suspense fallback={<RouterLoadingFallback />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<RouterLoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'factura',
        element: <FacturasPage />,
      },
    ],
  },
]);
