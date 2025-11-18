import { SidebarTrigger } from '@/shared/components/ui/sidebar';
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

export function AppHeader() {
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
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b bg-white shadow-sm">
      {/* Botón oficial del sidebar */}
      <SidebarTrigger className="h-10! w-10! border border-gray-300 rounded-md hover:bg-gray-100 shrink-0">
        <MdMenu className="h-5 w-5 text-gray-800" />
      </SidebarTrigger>

      {/* Avatar */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-linear-to-br from-[#50C878] to-[#3aa85c] text-white">
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
