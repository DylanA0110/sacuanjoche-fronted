import { useState, useEffect } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { FiSun, FiMoon } from 'react-icons/fi';

export function AppHeader() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Leer del localStorage o default a dark
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    // Aplicar tema al cargar
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <SidebarTrigger className="text-foreground hover:bg-sidebar-accent shrink-0" />
        <div className="h-6 sm:h-8 w-px bg-border shrink-0" />
        <h2 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
          Sistema de Gestión
        </h2>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="relative overflow-hidden group hover:bg-sidebar-accent shrink-0 h-8 w-8 sm:h-10 sm:w-10"
      >
        {theme === 'dark' ? (
          <FiSun className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:rotate-90" />
        ) : (
          <FiMoon className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:rotate-12" />
        )}
      </Button>
    </header>
  );
}

