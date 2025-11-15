import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { AppHeader } from './Header';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col admin-panel">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-background p-4 sm:p-6">
          <div className="max-w-full">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
