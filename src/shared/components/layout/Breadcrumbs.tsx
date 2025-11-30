import React from 'react';
import { Link, useMatches, useLocation } from 'react-router';
import { MdChevronRight, MdHome } from 'react-icons/md';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';

interface CrumbHandle {
  crumb: string | ((data: any) => string);
}

interface RouteMatch {
  handle?: CrumbHandle;
  pathname: string;
  data?: any;
}

interface Crumb {
  to: string;
  label: string;
}

// Mapeo de rutas a nombres amigables (fallback si no hay handle.crumb)
const routeLabels: Record<string, string> = {
  '/admin': 'Home',
  '/admin/pedidos': 'Pedidos',
  '/admin/clientes': 'Clientes',
  '/admin/catalogo': 'Catálogo',
  '/admin/arreglos': 'Arreglos',
  '/admin/rutas': 'Rutas & Envíos',
};

const getRouteLabel = (
  pathname: string,
  handle?: CrumbHandle,
  data?: any
): string => {
  // Si hay un handle con crumb, usarlo (prioridad)
  if (handle?.crumb) {
    return typeof handle.crumb === 'function'
      ? handle.crumb(data)
      : handle.crumb;
  }

  // Si hay un mapeo directo, usarlo
  if (routeLabels[pathname]) {
    return routeLabels[pathname];
  }

  // Si es una ruta con parámetros, extraer el nombre base
  if (pathname.includes('/nueva-factura')) {
    return 'Nueva Factura';
  }

  // Generar nombre desde el pathname
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return pathname;
};

export const Breadcrumbs: React.FC = () => {
  const matches = useMatches() as RouteMatch[];
  const location = useLocation();

  // Determinar si estamos en el panel admin
  const isAdminPanel = location.pathname.startsWith('/admin');
  const homeLink = isAdminPanel ? '/admin' : '/';

  // Si no estamos en admin, no mostrar breadcrumbs
  if (!isAdminPanel) {
    return null;
  }

  // Mostrar breadcrumbs en todas las rutas del admin, incluyendo Dashboard
  // Si estamos en /admin, mostrar "Inicio > Dashboard"
  if (location.pathname === '/admin' || location.pathname === '/admin/') {
    return (
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap items-center gap-1.5 sm:gap-2">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to={homeLink}
                className="flex items-center gap-1.5 hover:text-[#50C878] transition-colors text-gray-700 text-sm font-medium"
              >
                <MdHome className="h-4 w-4" />
                <span>Inicio</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <MdChevronRight className="h-4 w-4 text-gray-500" aria-hidden="true" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900 font-semibold text-sm">
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Generar crumbs desde matches (similar a MTS)
  const crumbs: Crumb[] = matches
    .filter((match: RouteMatch) => {
      // Filtrar solo rutas del admin y que tengan handle o sean rutas válidas
      return (
        match.pathname.startsWith('/admin') &&
        match.pathname !== '/admin' &&
        (match.handle?.crumb ||
          routeLabels[match.pathname] ||
          match.pathname.split('/').length > 2)
      );
    })
    .map((match: RouteMatch) => {
      const handle = match.handle as CrumbHandle | undefined;
      const label = getRouteLabel(match.pathname, handle, match.data);

      return {
        to: match.pathname,
        label: label,
      };
    });

  // Si no hay crumbs, no mostrar breadcrumbs
  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-wrap items-center gap-1.5 sm:gap-2">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              to={homeLink}
              className="flex items-center gap-1.5 hover:text-[#50C878] transition-colors text-gray-700 text-sm font-medium"
            >
              <MdHome className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.map((crumb: Crumb, index: number) => {
          const isLast = index === crumbs.length - 1;

          return (
            <React.Fragment key={crumb.to}>
              <BreadcrumbSeparator>
                <MdChevronRight className="h-4 w-4 text-gray-500" aria-hidden="true" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-gray-900 font-semibold text-sm">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={crumb.to}
                      className="hover:text-[#50C878] transition-colors text-gray-600 text-sm"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
