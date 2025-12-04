import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Mail, Plus, History, Menu, Inbox, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button"; // Caso queira usar botão estilizado

export function AppSidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Pendentes", url: "/pending", icon: Mail },
    { title: "Novo E-mail", url: "/new", icon: Plus },
    { title: "Histórico", url: "/history", icon: History },
    { title: "Todos os E-mails", url: "/all-emails", icon: Inbox },
  ];

  return (
    <TooltipProvider>
      <div
        className={`fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 border-r
        ${open ? "w-64" : "w-20"}
        bg-[#0D1B2A] border-[#1B263B] text-white z-40`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-[#1B263B]">
          {open && (
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold tracking-wide">StorkMail</h2>
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-[#1B263B] transition"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Menu com rolagem */}
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

        {/* Botão de sair */}
        <div className="p-4 border-t border-[#1B263B]">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#1B263B]"
          >
            <LogOut className="h-5 w-5" />
            {open && <span>Sair</span>}
          </button>
        </div>
      </div>

      {/* Espaço reservado para o layout principal */}
      <div className={`${open ? "w-64" : "w-20"} transition-all duration-300`} />
    </TooltipProvider>
  );
}
