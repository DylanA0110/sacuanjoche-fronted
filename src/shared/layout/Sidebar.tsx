import { NavLink } from '@/components/NavLink';
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
  useSidebar,
} from '@/components/ui/sidebar';
import {
  MdDashboard,
  MdLocalFlorist,
  MdPeople,
  MdShoppingCart,
  MdLocalShipping,
  MdDescription,
  MdCategory,
} from 'react-icons/md';

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: MdDashboard },
  { title: 'Arreglos', url: '/admin/arreglos', icon: MdLocalFlorist },
  { title: 'Catálogo', url: '/admin/catalogo', icon: MdCategory },
  { title: 'Clientes', url: '/admin/clientes', icon: MdPeople },
  { title: 'Pedidos', url: '/admin/pedidos', icon: MdShoppingCart },
  { title: 'Rutas & Envíos', url: '/admin/rutas', icon: MdLocalShipping },
  { title: 'Facturas', url: '/admin/factura', icon: MdDescription },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(path);
  };

  return (
    <ShadcnSidebar
      className={`${isCollapsed ? 'w-14' : 'w-56 sm:w-64'} transition-all duration-300`}
      collapsible="icon"
      variant="sidebar"
      style={{
        '--sidebar-z-index': '50',
      } as React.CSSProperties}
    >
      <SidebarContent className="bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
        <div className={`p-4 sm:p-6 ${isCollapsed ? 'hidden' : 'block'}`}>
          <h1 className="text-xl sm:text-2xl font-display text-gradient-vibrant">
            FloralPanel
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? 'hidden' : ''} text-xs sm:text-sm`}>
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="hover:bg-sidebar-accent transition-all duration-200 text-sm"
                      activeClassName="bg-primary/10 text-primary border-l-2 border-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                      {!isCollapsed && <span className="ml-2 sm:ml-3 truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
}

