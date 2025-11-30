import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { MdPerson, MdLogout, MdMenu } from 'react-icons/md';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuthStore } from '@/auth/store/auth.store';
import { AdminNotifications } from '../AdminNotifications';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  isMobile: boolean;
}

export function AppHeader({ onToggleSidebar, onOpenMobile }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const userEmail = user?.email || null;

  // Solo mostrar notificaciones para admin y vendedor, no para conductores
  const mostrarNotificaciones = user?.roles?.some(role => 
    role.toLowerCase() === 'admin' || role.toLowerCase() === 'vendedor'
  ) || false;

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    window.location.href = '/';
  };

  const handleProfileClick = () => {
    navigate('/admin/perfil');
  };

  return (
    <header className="sticky top-0 z-40 h-12 bg-white shadow-sm border-b border-gray-200/40 flex items-center justify-between px-2 sm:px-3 font-sans min-w-0 overflow-x-hidden">
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {/* Botón mobile - hamburger menu */}
        <button
          onClick={onOpenMobile}
          className="md:hidden p-1 rounded-md hover:bg-gray-100 transition-colors duration-150 shrink-0"
          aria-label="Abrir menú"
        >
          <MdMenu className="h-4 w-4 text-gray-700" />
        </button>

        {/* Botón Desktop - toggle sidebar */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-1 rounded-md hover:bg-gray-100 transition-colors duration-150 shrink-0"
          aria-label="Alternar sidebar"
        >
          <MdMenu className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      {/* Notificaciones y Avatar - Siempre visible a la derecha */}
      <div className="flex items-center gap-2 shrink-0 ml-1.5">
        {/* Centro de notificaciones - Solo para admin y vendedor */}
        {mostrarNotificaciones && <AdminNotifications />}
        
        {/* Avatar y menú de usuario */}
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
              className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 shrink-0"
          >
            <Avatar className="h-7 w-7 ring-1 ring-gray-200">
              <AvatarFallback className="bg-[#1E5128] text-white text-[10px] font-semibold font-sans shadow-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={handleProfileClick} className="text-xs py-1">
            <MdPerson className="h-3 w-3 mr-1.5" />
            Mi Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-xs py-1 text-red-600 focus:bg-red-50"
          >
            <MdLogout className="h-3 w-3 mr-1.5" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
