import { useState } from "react";
import { LayoutDashboard, Mail, Plus, History, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export function AppSidebar() {
  const [open, setOpen] = useState(true);

  const menuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Pendentes", url: "/pending", icon: Mail },
    { title: "Novo E-mail", url: "/new", icon: Plus },
    { title: "Histórico", url: "/history", icon: History },
  ];

  return (
    <aside
      className={`
        bg-sidebar text-sidebar-foreground border-r border-sidebar-border 
        transition-all duration-300 ease-in-out shadow-sm
        ${open ? "w-64" : "w-20"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        {open && (
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-sidebar-primary" />
            <h2 className="text-xl font-bold tracking-tight">StorkMail</h2>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          <Menu className="h-5 w-5 text-sidebar-foreground" />
        </button>
      </div>

      {/* LABEL */}
      {open && (
        <span className="block px-4 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Menu Principal
        </span>
      )}

      {/* NAVIGATION */}
      <nav className="mt-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="
              flex items-center gap-4 whitespace-nowrap
              px-4 py-3 rounded-md
              text-sidebar-foreground
              hover:bg-sidebar-accent hover:text-sidebar-primary
              transition-all duration-200 group
            "
            activeClassName="
              bg-sidebar-accent 
              text-sidebar-primary 
              shadow-inner
            "
          >
            <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />

            {open && (
              <span className="text-sm font-medium">{item.title}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
