import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <AppSidebar onToggle={setSidebarOpen} />

      <main
        className={`
        transition-all duration-300 w-full px-6 py-4
        ${sidebarOpen ? "ml-64" : "ml-20"}   /* 👈 evita sobreposição */
      `}
      >
        {children}
      </main>
    </div>
  );
}
