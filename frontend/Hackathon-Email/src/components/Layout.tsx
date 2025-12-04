import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 md:p-8 max-w-7xl">
            <Outlet /> {/* As rotas filhas do React Router vão aparecer aqui */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
