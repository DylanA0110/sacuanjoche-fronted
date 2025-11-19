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

const getUserEmail = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = token.split('.')[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    return decoded.email || null;
  } catch {
    return null;
  }
};

interface AppHeaderProps {
  onToggleSidebar: () => void;
  onOpenMobile: () => void;
  isMobile: boolean;
}

export function AppHeader({ onToggleSidebar, onOpenMobile }: AppHeaderProps) {
  const navigate = useNavigate();
  const userEmail = getUserEmail();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Sesión cerrada correctamente');
    window.location.href = '/';
  };

  const handleProfileClick = () => {
    navigate('/admin');
    toast.info('Página de perfil próximamente');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white shadow-sm border-b border-gray-200/40 flex items-center justify-between px-4 sm:px-6 font-sans">
      <div className="flex items-center gap-3">
        {/* Botón mobile - hamburger menu */}
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          aria-label="Abrir menú"
        >
          <MdMenu className="h-6 w-6 text-gray-700" />
        </button>

        {/* Botón Desktop - toggle sidebar */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          aria-label="Alternar sidebar"
        >
          <MdMenu className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* Avatar y menú de usuario */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
          >
            <Avatar className="h-9 w-9 ring-2 ring-gray-200">
              <AvatarFallback className="bg-[#1E5128] text-white font-semibold font-sans shadow-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleProfileClick}>
            <MdPerson className="h-4 w-4 mr-2" />
            Mi Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:bg-red-50"
          >
            <MdLogout className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
