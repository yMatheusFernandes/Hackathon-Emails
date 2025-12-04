import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Pending from "./pages/Pending";
import NewEmail from "./pages/NewEmail";
import History from "./pages/History";
import EmailDetail from "./pages/EmailDetail";
import NotFound from "./pages/NotFound";
import AllEmails from "@/pages/AllEmails";
import SenderEmails from "@/pages/SenderEmails"; // <-- Importa a nova página
// ...



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pending" element={<Pending />} />
            <Route path="/new" element={<NewEmail />} />
            <Route path="/history" element={<History />} />
            <Route path="/email/:id" element={<EmailDetail />} />
            <Route path="*" element={<NotFound />} />
            
            <Route path="/all-emails" element={<AllEmails />} />
            <Route path="/sender-emails" element={<SenderEmails />} />

          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
