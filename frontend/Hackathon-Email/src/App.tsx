import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pending from "./pages/Pending";
import NewEmail from "./pages/NewEmail";
import History from "./pages/History";
import EmailDetail from "./pages/EmailDetail";
import AllEmails from "./pages/AllEmails";
import SenderEmails from "./pages/SenderEmails";
import Funcionarios from "./pages/Funcionarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <Routes>

            {/* Redirecionamento inicial */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pending" element={<Pending />} />
              <Route path="/new" element={<NewEmail />} />
              <Route path="/history" element={<History />} />
              <Route path="/email/:id" element={<EmailDetail />} />
              <Route path="/all-emails" element={<AllEmails />} />
              <Route path="/sender-emails" element={<SenderEmails />} />
            </Route>

            {/* Pública */}
            <Route path="/funcionarios" element={<Funcionarios />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
}
