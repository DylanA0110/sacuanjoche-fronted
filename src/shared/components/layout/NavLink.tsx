import { Link, useLocation } from 'react-router';
import { cn } from '@/shared/lib/utils';
import { useSidebar } from '@/shared/components/ui/sidebar';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  end?: boolean;
}

export function NavLink({
  to,
  children,
  className,
  activeClassName,
  end = false,
}: NavLinkProps) {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to);

  const handleClick = () => {
    // Cerrar el sidebar en móviles cuando se hace clic en un enlace
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
}
