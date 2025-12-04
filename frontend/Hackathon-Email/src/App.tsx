import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";

import Dashboard from "./pages/Dashboard";
import Pending from "./pages/Pending";
import NewEmail from "./pages/NewEmail";
import History from "./pages/History";
import EmailDetail from "./pages/EmailDetail";
import NotFound from "./pages/NotFound";

import Login from "./pages/Login";
import Funcionarios from "./pages/Funcionarios";

import AllEmails from "@/pages/AllEmails";
import SenderEmails from "@/pages/SenderEmails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rota raiz redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas fora do Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/funcionarios" element={<Funcionarios />} />

          {/* Todas as outras rotas dentro do Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/new" element={<NewEmail />} />
            <Route path="/history" element={<History />} />
            <Route path="/email/:id" element={<EmailDetail />} />
            <Route path="/all-emails" element={<AllEmails />} />
            <Route path="/sender-emails" element={<SenderEmails />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
