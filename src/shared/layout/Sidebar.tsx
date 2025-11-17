import { NavLink } from '@/shared/components/NavLink';
import { useLocation } from 'react-router';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import {
  MdDashboard,
  MdLocalFlorist,
  MdPeople,
  MdShoppingCart,
  MdLocalShipping,
  MdCategory,
} from 'react-icons/md';
import { GiRose } from 'react-icons/gi';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: MdDashboard },
  { title: 'Arreglos', url: '/admin/arreglos', icon: MdLocalFlorist },
  { title: 'Catálogo', url: '/admin/catalogo', icon: MdCategory },
  { title: 'Clientes', url: '/admin/clientes', icon: MdPeople },
  { title: 'Pedidos', url: '/admin/pedidos', icon: MdShoppingCart },
  { title: 'Rutas & Envíos', url: '/admin/rutas', icon: MdLocalShipping },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  return (
    <ShadcnSidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-gray-800/50 shadow-2xl shadow-black/10"
    >
      <SidebarContent
        style={{ backgroundColor: '#1f2937' }}
        className="border-r border-gray-800/50 transition-colors duration-200"
      >
        {/* Header del Sidebar con Logo y Botón de Toggle */}
        <div className={`${isCollapsed ? 'px-2 py-4' : 'px-4 py-6'} border-b border-gray-800/50 transition-all duration-200`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3`}>
            {!isCollapsed ? (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#50C878] to-[#3aa85c] shadow-lg shadow-[#50C878]/30 flex-shrink-0">
                  <GiRose className="h-7 w-7 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
                    Floristería
                  </h2>
                  <p className="text-xs text-white/60 font-medium">
                    Sacuanjoche
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center w-full">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#50C878] to-[#3aa85c] shadow-lg shadow-[#50C878]/30">
                  <GiRose className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            {!isCollapsed && (
              <SidebarTrigger className="h-9 w-9 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 shrink-0 border border-white/10 hover:border-white/20" />
            )}
          </div>
          {isCollapsed && (
            <div className="flex justify-center mt-2">
              <SidebarTrigger className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20" />
            </div>
          )}
        </div>

        {/* Menú */}
        <SidebarGroup className={isCollapsed ? 'px-1 py-2' : 'px-2 py-4'}>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider px-3 mb-3 text-white/40">
              MENÚ PRINCIPAL
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  item.url === '/admin'
                    ? currentPath === '/admin'
                    : currentPath.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/admin'}
                        className={`group relative flex items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-3'} rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-[#50C878] to-[#3aa85c] text-white shadow-lg shadow-[#50C878]/40 border-l-4 border-white/30'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                        activeClassName=""
                      >
                        <item.icon
                          className={`${isCollapsed ? 'h-5 w-5' : 'h-5 w-5'} shrink-0 transition-all duration-200 ${
                            isActive
                              ? 'text-white scale-110'
                              : 'text-white/50 group-hover:text-white group-hover:scale-105'
                          }`}
                        />
                        {!isCollapsed && (
                          <span className="truncate font-semibold">
                            {item.title}
                          </span>
                        )}
                        {isActive && !isCollapsed && (
                          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/80" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
