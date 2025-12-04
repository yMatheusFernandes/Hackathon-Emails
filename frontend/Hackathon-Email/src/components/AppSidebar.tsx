import { useState } from "react";
import { LayoutDashboard, Mail, Plus, History, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppSidebar({ onToggle }: { onToggle?: (open: boolean) => void }) {
  const [open, setOpen] = useState(true);

  const menuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Pendentes", url: "/pending", icon: Mail },
    { title: "Novo E-mail", url: "/new", icon: Plus },
    { title: "Histórico", url: "/history", icon: History },
  ];

  return (
<<<<<<< Updated upstream
    <TooltipProvider>
      <div
        className={`
        fixed top-0 left-0 z-50                       /* 🔥 sidebar fixa */
        h-screen flex flex-col transition-all duration-300 border-r
        ${open ? "w-64" : "w-20"}
        bg-[#0D1B2A] border-[#1B263B] text-white
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1B263B]">
          {open && (
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold tracking-wide">
                EmailManager
              </h2>
            </div>
          )}

          <button
            onClick={() =>
              setOpen((prev) => {
                const next = !prev;
                onToggle?.(next);
                return next;
              })
            }
            className="p-2 rounded-md hover:bg-[#1B263B] transition"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Menu (scroll caso fique grande) */}
        <div className="flex-1 py-4 space-y-1 overflow-y-auto">
          {open && (
            <span className="px-5 text-xs font-semibold uppercase text-gray-300">
              Menu Principal
            </span>
          )}

          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => (
              <Tooltip key={item.title} delayDuration={100}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.url}
                    end={item.url === "/"}
                    className="flex items-center gap-3 mx-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1B263B]"
                    activeClassName="bg-[#1B263B] text-white font-semibold shadow-md"
                  >
                    <item.icon className="h-5 w-5" />
                    {open && <span>{item.title}</span>}
                  </NavLink>
                </TooltipTrigger>

                {!open && (
                  <TooltipContent side="right" className="text-xs font-medium">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </div>
      </div>
    </TooltipProvider>
=======
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
>>>>>>> Stashed changes
  );
}
