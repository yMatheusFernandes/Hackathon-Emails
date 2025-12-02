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
    <div
      className={`border-r border-sidebar-border transition-all duration-300
      ${open ? "w-64" : "w-16"}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {open && (
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-sidebar-primary" />
            <h2 className="text-lg font-bold text-sidebar-foreground">
              EmailManager
            </h2>
          </div>
        )}

        <button onClick={() => setOpen(!open)} className="ml-auto">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-2">
        <span className="block px-4 text-sm text-muted-foreground">
          {open ? "Menu Principal" : ""}
        </span>

        <nav className="mt-2 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
            >
              <item.icon className="h-5 w-5" />
              {open && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
