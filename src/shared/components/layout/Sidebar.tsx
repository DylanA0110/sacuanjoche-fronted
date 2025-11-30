import { NavLink } from '@/shared/components/layout/NavLink';
import { useLocation } from 'react-router';
import { Button } from '@/shared/components/ui/button';
import { MdClose } from 'react-icons/md';
import {
  MdDashboard,
  MdLocalFlorist,
  MdPeople,
  MdShoppingCart,
  MdLocalShipping,
  MdCategory,
  MdDescription,
  MdReceipt,
  MdPerson,
  MdRoute,
  MdBusiness,
} from 'react-icons/md';
import { GiRose } from 'react-icons/gi';
import { useAuthStore } from '@/auth/store/auth.store';

const menuItemsAdmin = [
  { title: 'Dashboard', url: '/admin', icon: MdDashboard },
  { title: 'Arreglos', url: '/admin/arreglos', icon: MdLocalFlorist },
  { title: 'Catálogo', url: '/admin/catalogo', icon: MdCategory },
  { title: 'Clientes', url: '/admin/clientes', icon: MdPeople },
  { title: 'Pedidos', url: '/admin/pedidos', icon: MdShoppingCart },
  { title: 'Facturas', url: '/admin/facturas', icon: MdReceipt },
  { title: 'Rutas & Envíos', url: '/admin/rutas', icon: MdLocalShipping },
  { title: 'Empleados', url: '/admin/empleados', icon: MdBusiness },
  { title: 'Reportes', url: '/admin/reportes', icon: MdDescription },
];

const menuItemsConductor = [
  { title: 'Mis Rutas', url: '/admin/mis-rutas', icon: MdRoute },
];

interface AppSidebarProps {
  isOpen: boolean;
  mobile: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export function AppSidebar({
  isOpen,
  mobile,
  onToggle,
  onClose,
}: AppSidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, hasRole } = useAuthStore();
  
  // Determinar si el usuario es conductor
  const isConductor = user && hasRole('conductor') && !hasRole('admin') && !hasRole('vendedor');
  
  // Seleccionar el menú según el rol
  const menuItems = isConductor ? menuItemsConductor : menuItemsAdmin;

  return (
    <aside
      className={`
        fixed top-0 left-0 h-full bg-linear-to-b from-[#1a1a1a] via-[#0D0D0D] to-[#1a1a1a] text-white z-50
        transition-all duration-300 ease-linear
        ${mobile ? 'w-64' : isOpen ? 'w-64' : 'w-16'}
        ${mobile ? '' : 'hidden md:block'}
        ${mobile ? 'shadow-2xl' : 'shadow-xl'}
        overflow-hidden
        font-sans
        border-r border-white/5
      `}
    >
      <div className="flex flex-col h-full">
        {/* HEADER LOGO */}
        <div
          className={`flex items-center justify-between shrink-0 ${
            isOpen ? 'px-4 py-6' : 'px-2 py-4 justify-center'
          }`}
        >
          <div
            className={`flex items-center ${
              isOpen ? 'gap-3' : 'justify-center'
            }`}
          >
            <div
              className={`${
                isOpen ? 'w-10 h-10' : 'w-9 h-9'
              } rounded-xl flex items-center justify-center bg-linear-to-br from-[#50C878]/20 to-[#00A87F]/20 backdrop-blur-sm border border-[#50C878]/30 shadow-lg`}
            >
              <GiRose
                className={`${isOpen ? 'h-5 w-5' : 'h-4 w-4'} text-[#50C878]`}
              />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white font-sans">
                  Floristería
                </h2>
                <p className="text-xs text-[#50C878]/80 font-sans">
                  Sacuanjoche
                </p>
              </div>
            )}
          </div>

          {/* Botón cerrar en móvil */}
          {mobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Cerrar menú"
            >
              <MdClose className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white-20 scrollbar-track-transparent">
          <div className="px-2 mb-4">
            {isOpen && (
              <p className="text-[11px] text-[#50C878]/60 tracking-wider font-medium">
                Menú Principal
              </p>
            )}
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive =
                item.url === '/admin'
                  ? currentPath === '/admin'
                  : currentPath.startsWith(item.url);

              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.url === '/admin'}
                  onClick={mobile ? onClose : undefined}
                  className={`
                    flex items-center gap-3 rounded-lg text-sm transition-all duration-150 font-sans
                    ${
                      isOpen
                        ? 'justify-start px-3 py-2.5'
                        : 'justify-center px-2 py-2.5'
                    }
                    ${
                      isActive
                        ? 'bg-linear-to-r from-[#50C878]/20 to-[#50C878]/10 text-white font-semibold border-l-4 border-[#50C878] shadow-sm shadow-[#50C878]/20'
                        : 'text-white/70 hover:bg-white/5 hover:text-white hover:border-l-4 hover:border-[#50C878]/30'
                    }
                  `}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-white/80'
                    }`}
                  />
                  {isOpen && <span className="font-medium">{item.title}</span>}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
