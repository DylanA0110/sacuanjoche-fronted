import { SidebarTrigger } from '@/shared/components/ui/sidebar';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 h-14 sm:h-16 border-b border-gray-200 bg-white/95 backdrop-blur-md transition-all duration-200">
      <div className="flex h-full items-center justify-between px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger className="h-9 w-9 sm:h-10 sm:w-10 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0" />
        </div>
      </div>
    </header>
  );
}
