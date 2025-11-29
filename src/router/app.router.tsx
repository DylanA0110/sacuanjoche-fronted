import { createBrowserRouter, Outlet } from 'react-router';
import { lazy, Suspense } from 'react';
import { Layout } from '@/shared/components/layout/Layout';

// Lazy loading de páginas para code splitting
const LandingPage = lazy(() => import('../landing/pages/LandingPage'));
const CatalogPage = lazy(() => import('../landing/pages/CatalogPage'));
const DashboardPage = lazy(() => import('../admin/pages/DashboardPage'));
const PedidosPage = lazy(() => import('../pedido/pages/PedidosPage'));
const PedidoFormPage = lazy(() => import('../pedido/pages/PedidoFormPage'));
const NuevaFacturaPage = lazy(() => import('../facturas/pages/NuevaFacturaPage'));
const FacturasPage = lazy(() => import('../facturas/pages/FacturasPage'));
const EditarFacturaPage = lazy(() => import('../facturas/pages/EditarFacturaPage'));
const ClientesPage = lazy(() => import('../cliente/pages/ClientesPage'));
const CatalogoPage = lazy(() => import('../catalogo/pages/CatalogoPage'));
const ArreglosPage = lazy(() => import('../arreglo/pages/ArreglosPage'));
const ReportesPage = lazy(() => import('../reports/pages/ReportesPage'));
const RutasPage = lazy(() => import('../rutas/pages/RutasPage'));

// Componente de carga para el router (Landing Page)
const RouterLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
  </div>
);

// Componente de carga para el panel administrativo
const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Layout wrapper para rutas de admin
const AdminLayout = () => {
  return (
    <Layout>
      <Suspense fallback={<AdminLoadingFallback />}>
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
    path: '/catalogo',
    element: (
      <Suspense fallback={<RouterLoadingFallback />}>
        <CatalogPage />
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
        path: 'pedidos',
        element: <PedidosPage />,
      },
      {
        path: 'pedidos/nuevo',
        element: <PedidoFormPage />,
      },
      {
        path: 'pedidos/:idPedido/editar',
        element: <PedidoFormPage />,
      },
      {
        path: 'pedidos/:idPedido/nueva-factura',
        element: <NuevaFacturaPage />,
      },
      {
        path: 'facturas',
        element: <FacturasPage />,
      },
      {
        path: 'facturas/:idFactura/editar',
        element: <EditarFacturaPage />,
      },
      {
        path: 'clientes',
        element: <ClientesPage />,
      },
      {
        path: 'catalogo',
        element: <CatalogoPage />,
      },
      {
        path: 'arreglos',
        element: <ArreglosPage />,
      },
      {
        path: 'reportes',
        element: <ReportesPage />,
      },
      {
        path: 'rutas',
        element: <RutasPage />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<RouterLoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
]);
