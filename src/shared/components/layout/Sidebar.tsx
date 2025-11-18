import { NavLink } from '@/shared/components/layout/NavLink';
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
  SidebarFooter,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { Button } from '@/shared/components/ui/button';
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
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  return (
    <ShadcnSidebar
      collapsible="icon"
      className="w-64 data-[state=collapsed]:w-16 border-r border-gray-300 shadow-sm"
    >
      <SidebarContent
        style={{ backgroundColor: '#1f2937' }}
        className="border-r border-gray-300 flex flex-col"
      >
        {/* HEADER LOGO */}
        <div
          className={`${
            isCollapsed ? 'px-2 py-4' : 'px-4 py-6'
          } border-b border-gray-300`}
        >
          <div className="flex items-center gap-3 justify-center">
            <div
              className={`${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'} 
              rounded-xl flex items-center justify-center bg-linear-to-br from-[#50C878] to-[#3aa85c]`}
            >
              <GiRose
                className={`${isCollapsed ? 'h-6 w-6' : 'h-7 w-7'} text-white`}
              />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white">Floristería</h2>
                <p className="text-xs text-white/60">Sacuanjoche</p>
              </div>
            )}
          </div>
        </div>

        {/* MENU */}
        <SidebarGroup className={isCollapsed ? 'px-1 py-2' : 'px-2 py-4'}>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[11px] text-white/40 px-3 mb-3">
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
                        className={`group flex items-center ${
                          isCollapsed
                            ? 'justify-center px-2 py-2.5'
                            : 'gap-3 px-3 py-3'
                        } rounded-xl text-sm transition-all ${
                          isActive
                            ? 'bg-linear-to-r from-[#50C878] to-[#3aa85c] text-white'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer con botón para ocultar sidebar */}
        <SidebarFooter className="mt-auto border-t border-gray-300 p-1.5">
          <Button
            onClick={toggleSidebar}
            variant="ghost"
            size="sm"
            className={`w-full ${
              isCollapsed ? 'justify-center px-1' : 'justify-start px-2'
            } h-7 text-white/50 hover:text-white/80 hover:bg-white/5 text-[10px] font-normal`}
            title={isCollapsed ? 'Expandir' : 'Colapsar'}
          >
            {isCollapsed ? (
              <span className="text-sm">→</span>
            ) : (
              <>
                <span className="text-[10px] mr-1.5">←</span>
                <span>Ocultar</span>
              </>
            )}
          </Button>
        </SidebarFooter>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
