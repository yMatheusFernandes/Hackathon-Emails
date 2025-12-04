import { useState } from "react";
import { LayoutDashboard, Mail, Plus, History, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppSidebar() {
  const [open, setOpen] = useState(true);

  const menuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Pendentes", url: "/pending", icon: Mail },
    { title: "Novo E-mail", url: "/new", icon: Plus },
    { title: "Histórico", url: "/history", icon: History },
  ];

  return (
    <TooltipProvider>
      <div
        className={`h-screen flex flex-col transition-all duration-300 border-r
        ${open ? "w-64" : "w-20"}
        bg-[#0D1B2A] border-[#1B263B] text-white`}
      >
        {/* Cabeçalho */}
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
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-[#1B263B] transition"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 py-4 space-y-1">
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
                    className={`flex items-center gap-3 mx-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    hover:bg-[#1B263B] hover:text-white`}
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
  );
}
