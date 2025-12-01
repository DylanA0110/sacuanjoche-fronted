import { createBrowserRouter, Outlet } from 'react-router';
import { lazy, Suspense } from 'react';
import { Layout } from '@/shared/components/layout/Layout';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { ClienteRoute } from '@/shared/components/ClienteRoute';
import { RouteErrorBoundary } from '@/shared/components/RouteErrorBoundary';

// Lazy loading de páginas para code splitting
const LandingPage = lazy(() => import('../landing/pages/LandingPage'));
const CatalogPage = lazy(() => import('../landing/pages/CatalogPage'));
const LoginPage = lazy(() => import('../auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../auth/pages/RegisterPage'));
const CartPage = lazy(() => import('../carrito/pages/CartPage'));
const DashboardPage = lazy(() => import('../admin/pages/DashboardPage'));
const PedidosPage = lazy(() => import('../pedido/pages/PedidosPage'));
const PedidoFormPage = lazy(() => import('../pedido/pages/PedidoFormPage'));
const NuevaFacturaPage = lazy(
  () => import('../facturas/pages/NuevaFacturaPage')
);
const FacturasPage = lazy(() => import('../facturas/pages/FacturasPage'));
const EditarFacturaPage = lazy(
  () => import('../facturas/pages/EditarFacturaPage')
);
const ClientesPage = lazy(() => import('../cliente/pages/ClientesPage'));
const CatalogoPage = lazy(() => import('../catalogo/pages/CatalogoPage'));
const ArreglosPage = lazy(() => import('../arreglo/pages/ArreglosPage'));
const ReportesPage = lazy(() => import('../reports/pages/ReportesPage'));
const RutasPage = lazy(() => import('../ruta/pages/RutasPage'));
const RutasConductorPage = lazy(
  () => import('../ruta/pages/RutasConductorPage')
);
const EmpleadosPage = lazy(() => import('../empleado/pages/EmpleadosPage'));
const ProfilePage = lazy(() => import('../auth/pages/ProfilePage'));
const CheckoutPage = lazy(() => import('../carrito/pages/CheckoutPage'));
const CompletarPedidoPage = lazy(
  () => import('../carrito/pages/CompletarPedidoPage')
);
const PaymentSuccessPage = lazy(
  () => import('../pago/pages/PaymentSuccessPage')
);
const PaymentCancelPage = lazy(() => import('../pago/pages/PaymentCancelPage'));
const PedidoConfirmacionPage = lazy(
  () => import('../pedido/pages/PedidoConfirmacionPage')
);

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
    <ProtectedRoute>
      <Layout>
        <Suspense fallback={<AdminLoadingFallback />}>
          <Outlet />
        </Suspense>
      </Layout>
    </ProtectedRoute>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <LandingPage />
        </Suspense>
      </ClienteRoute>
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
    path: '/login',
    element: (
      <Suspense fallback={<RouterLoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<RouterLoadingFallback />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/carrito',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <CartPage />
        </Suspense>
      </ClienteRoute>
    ),
  },
  {
    path: '/carrito/checkout',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <CheckoutPage />
        </Suspense>
      </ClienteRoute>
    ),
  },
  {
    path: '/carrito/checkout/completar',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <CompletarPedidoPage />
        </Suspense>
      </ClienteRoute>
    ),
  },
  {
    path: '/payment/success',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <PaymentSuccessPage />
        </Suspense>
      </ClienteRoute>
    ),
  },
  {
    path: '/payment/cancel',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <PaymentCancelPage />
        </Suspense>
      </ClienteRoute>
    ),
  },
  {
    path: '/pedido/:idPedido/confirmacion',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <PedidoConfirmacionPage />
        </Suspense>
      </ClienteRoute>
    ),
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'pedidos',
        element: <PedidosPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'pedidos/nuevo',
        element: <PedidoFormPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'pedidos/:idPedido/editar',
        element: <PedidoFormPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'pedidos/:idPedido/nueva-factura',
        element: <NuevaFacturaPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'facturas',
        element: <FacturasPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'facturas/:idFactura/editar',
        element: <EditarFacturaPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'clientes',
        element: <ClientesPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'catalogo',
        element: <CatalogoPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'arreglos',
        element: <ArreglosPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'reportes',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <ReportesPage />
          </ProtectedRoute>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'rutas',
        element: <RutasPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'mis-rutas',
        element: <RutasConductorPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'empleados',
        element: (
          <ProtectedRoute requiredRoles={['admin']}>
            <EmpleadosPage />
          </ProtectedRoute>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: 'perfil',
        element: <ProfilePage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },
  {
    path: '*',
    element: (
      <ClienteRoute>
        <Suspense fallback={<RouterLoadingFallback />}>
          <LandingPage />
        </Suspense>
      </ClienteRoute>
    ),
  },
]);
