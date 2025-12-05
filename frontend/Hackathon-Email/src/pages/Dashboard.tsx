import { useEffect, useState, useRef } from "react";
import { fetchDashboardStats } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
  Trash2,
  FileDown,
  X,
  Menu,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// ✅ IMPORTANDO AS CONSTANTES CENTRALIZADAS
import { BRAZILIAN_STATES, EMAIL_CATEGORIES } from "@/lib/emailStorage";

const COLORS = {
  pending: "hsl(var(--warning))",
  classified: "hsl(var(--success))",
  archived: "hsl(var(--muted))",
  urgent: "hsl(var(--destructive))",
  low: "#a3e635",
  medium: "#facc15",
  high: "#f97316",
  urgentPrio: "hsl(var(--destructive))",
};

const CATEGORY_COLORS = {
  marketing: "#3b82f6",
  financeiro: "#10b981",
  suporte: "#f59e0b",
  pessoal: "#8b5cf6",
  outros: "#6b7280",
};

const ICONS: Record<string, any> = {
  Mail,
  Clock,
  CheckCircle,
  TrendingUp,
};

type ChartType = 'pie' | 'bar';

interface CustomChart {
  id: string;
  title: string;
  data: any[];
  type: ChartType;
  filters: {
    state: string;
    status: string;
    chartType: ChartType;
    showCities: boolean;
  };
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCustomChartOpen, setIsCustomChartOpen] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    classified: 0,
    archived: 0,
    urgent: 0,
    recent: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);
  const [customCards, setCustomCards] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [topStates, setTopStates] = useState<any[]>([]);
  const [topSenders, setTopSenders] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const [chartState, setChartState] = useState("all");
  const [chartStatus, setChartStatus] = useState("all");
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [showCities, setShowCities] = useState(false);
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([]);
  const [chartTitle, setChartTitle] = useState("");

  useEffect(() => {
    const savedCharts = localStorage.getItem("customDashboardCharts");
    if (savedCharts) {
      try {
        const parsed = JSON.parse(savedCharts);
        setCustomCharts(parsed);
      } catch (error) {
        console.error("Erro ao carregar gráficos salvos:", error);
      }
    }
  }, []);

  const saveChartsToLocalStorage = (charts: CustomChart[]) => {
    try {
      localStorage.setItem("customDashboardCharts", JSON.stringify(charts));
    } catch (error) {
      console.error("Erro ao salvar gráficos:", error);
    }
  };

  const gerarPreview = async () => {
    if (!exportRef.current) return alert("Seção do dashboard não encontrada!");
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL("image/png");
      setPreviewImage(imgData);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
      alert("Erro ao gerar preview do relatório");
    }
  };

  const gerarPDF = async () => {
    if (!exportRef.current) {
      alert("Gráficos não encontrados!");
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const larguraPDF = 190;
      const proporcao = canvas.height / canvas.width;
      const alturaPDF = larguraPDF * proporcao;

      pdf.setFontSize(22);
      pdf.text("Relatório - Email Manager", pageWidth / 2, 20, {
        align: "center",
      });

      if (alturaPDF + 40 < pageHeight) {
        pdf.addImage(imgData, "PNG", 10, 30, larguraPDF, alturaPDF);
      } else {
        let y = 0;
        while (y < alturaPDF) {
          if (y > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 10, 10 - y, larguraPDF, alturaPDF);
          y += pageHeight;
        }
      }
      pdf.save("dashboard.pdf");
      setIsPreviewOpen(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF");
    }
  };

  const gerarGraficoPersonalizado = async () => {
    if (!chartTitle.trim()) {
      alert("Por favor, dê um título ao gráfico!");
      return;
    }

    if (chartState === "all") {
      alert("Selecione um estado específico para criar o gráfico personalizado!");
      return;
    }

    try {
      // Buscar dados específicos do estado
      const result = await fetchDashboardStats();
      
      if (!result || result.error) {
        console.error("Erro ao carregar dados:", result?.error);
        alert("Erro ao carregar dados para o gráfico!");
        return;
      }

      const data = result.data;
      let chartData = [];

      if (chartType === 'pie') {
        // Gráfico de pizza: Distribuição de status no estado selecionado
        const stateEmails = emails.filter(email => email.state === chartState);
        
        const statusCount = stateEmails.reduce((acc, email) => {
          const status = email.status || 'unknown';
          if (!acc[status]) acc[status] = 0;
          acc[status]++;
          return acc;
        }, {} as Record<string, number>);

        chartData = Object.entries(statusCount).map(([status, count]) => ({
          name: status === 'pending' ? 'Pendentes' : 
                status === 'classified' ? 'Classificados' : 
                status === 'archived' ? 'Arquivados' : 
                status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
          color: COLORS[status as keyof typeof COLORS] || COLORS.pending,
        }));

      } else if (chartType === 'bar') {
        // Gráfico de barras: Distribuição por categoria no estado selecionado
        const stateEmails = emails.filter(email => email.state === chartState);
        
        const categoryCount = stateEmails.reduce((acc, email) => {
          const category = email.category?.toLowerCase() || 'outros';
          if (!acc[category]) acc[category] = 0;
          acc[category]++;
          return acc;
        }, {} as Record<string, number>);

        chartData = Object.entries(categoryCount).map(([category, count]) => ({
          name: category === 'marketing' ? 'Marketing' :
                category === 'financeiro' ? 'Financeiro' :
                category === 'suporte' ? 'Suporte' :
                category === 'pessoal' ? 'Pessoal' : 'Outros',
          value: count,
          color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.outros,
        }));

        // Ordenar por quantidade (maior para menor)
        chartData.sort((a, b) => b.value - a.value);
      }

      if (chartData.length === 0) {
        alert(`Nenhum dado encontrado para o estado ${chartState} com os filtros aplicados!`);
        return;
      }

      const newChart: CustomChart = {
        id: Date.now().toString(),
        title: chartTitle,
        data: chartData,
        type: chartType,
        filters: {
          state: chartState,
          status: chartStatus,
          chartType: chartType,
          showCities: showCities,
        },
        createdAt: new Date().toLocaleString("pt-BR"),
      };

      const updatedCharts = [...customCharts, newChart];
      setCustomCharts(updatedCharts);
      saveChartsToLocalStorage(updatedCharts);

      // Limpar formulário
      setChartTitle("");
      setChartState("all");
      setChartStatus("all");
      setChartType("pie");
      setShowCities(false);
      setIsCustomChartOpen(false);

      alert(`Gráfico "${chartTitle}" criado com sucesso para o estado ${chartState}!`);

    } catch (error) {
      console.error("Erro ao gerar gráfico personalizado:", error);
      alert("Erro ao processar dados para o gráfico!");
    }
  };

  const removerGrafico = (id: string) => {
    const updatedCharts = customCharts.filter((chart) => chart.id !== id);
    setCustomCharts(updatedCharts);
    saveChartsToLocalStorage(updatedCharts);
  };

  const calculateCardValue = (filters: Record<string, string>) => {
    return emails.filter((email) => {
      const emailCategory =
        email.category?.toString().trim().toLowerCase() || "";
      const emailState = email.state || "";

      const matchesStatus =
        !filters.status ||
        filters.status === "all" ||
        email.status === filters.status;
      const matchesPriority =
        !filters.priority ||
        filters.priority === "all" ||
        email.priority === filters.priority;
      const matchesCategory =
        !filters.category ||
        filters.category === "all" ||
        emailCategory === filters.category.toLowerCase();
      const matchesState =
        !filters.state ||
        filters.state === "all" ||
        emailState === filters.state;

      return (
        matchesStatus && matchesPriority && matchesCategory && matchesState
      );
    }).length;
  };

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchDashboardStats();

      if (!result || result.error) {
        console.error("Erro ao carregar dashboard:", result?.error);
        return;
      }

      const data = result.data;

      setStats({
        total: data.total,
        pending: data.pendentes,
        classified: data.classificados,
        recent: data.emails_ultimos_7_dias,
        archived: 0,
        urgent: 0,
      });

      setChartData([
        { name: "Pendentes", value: data.pendentes, color: COLORS.pending },
        {
          name: "Classificados",
          value: data.classificados,
          color: COLORS.classified,
        },
      ]);

      setDailyTrend([
        {
          date: "Últimos 7 dias",
          emails: data.emails_ultimos_7_dias,
          pending: data.pendentes,
        },
      ]);

      const estados = Object.entries(data.emails_por_estado).map(
        ([estado, count]) => ({ state: estado, count })
      );
      setTopStates(estados);

      setTopSenders(
        data.top_remetentes.map((item: any) => ({
          sender: item.nome,
          sender_email: item.email,
          count: item.total_emails,
        }))
      );

      setEmails([]);
    };

    loadData();
  }, []);

  useEffect(() => {
    const savedCards = localStorage.getItem("customDashboardCards");
    if (savedCards && emails.length > 0) {
      const parsed = JSON.parse(savedCards);
      const updated = parsed.map((c: any) => ({
        ...c,
        value: calculateCardValue(c.customFilters),
      }));
      setCustomCards(updated);
    }
  }, [emails]);

  const statCards = [
    {
      title: "Total de E-mails",
      value: stats.total,
      icon: "Mail",
      color: "text-primary",
      bgColor: "bg-primary/10",
      filterStatus: null,
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: "Clock",
      color: "text-warning",
      bgColor: "bg-warning/10",
      filterStatus: "pending",
    },
    {
      title: "Classificados",
      value: stats.classified,
      icon: "CheckCircle",
      color: "text-success",
      bgColor: "bg-success/10",
      filterStatus: "classified",
    },
    {
      title: "Últimos 7 dias",
      value: stats.recent,
      icon: "TrendingUp",
      color: "text-primary",
      bgColor: "bg-primary/10",
      filterStatus: "recent",
    },
    ...customCards,
  ];

  const handleCardClick = (card: any) => {
    if (card.customFilters) {
      const params = new URLSearchParams();
      if (card.customFilters.status)
        params.append("status", card.customFilters.status);
      if (card.customFilters.priority)
        params.append("priority", card.customFilters.priority);
      if (card.customFilters.category)
        params.append("category", card.customFilters.category);
      if (card.customFilters.state)
        params.append("state", card.customFilters.state);
      navigate(`/history?${params.toString()}`);
      return;
    }
    if (card.title === "Pendentes") {
      navigate("/pending");
      return;
    }
    const filterStatus = card.filterStatus;
    if (!filterStatus) return navigate("/all-emails");
    navigate(`/history?status=${filterStatus}`);
  };

  const addCustomCard = () => {
    if (!newCardTitle.trim()) return;
    const filters: Record<string, string> = {};
    if (categoryFilter !== "all") filters.category = categoryFilter;
    if (statusFilter !== "all") filters.status = statusFilter;
    if (stateFilter !== "all") filters.state = stateFilter;
    const value = calculateCardValue(filters);
    const newCard = {
      title: newCardTitle,
      value,
      icon: "Mail",
      color: "text-primary",
      bgColor: "bg-primary/10",
      customFilters: filters,
    };
    const updated = [...customCards, newCard];
    setCustomCards(updated);
    localStorage.setItem("customDashboardCards", JSON.stringify(updated));
    setNewCardTitle("");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStateFilter("all");
    setIsDialogOpen(false);
  };

  const removeCard = (title: string) => {
    const updated = customCards.filter((c) => c.title !== title);
    setCustomCards(updated);
    localStorage.setItem("customDashboardCards", JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-6">
      {/* HEADER MOBILE OTIMIZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão geral do sistema de gestão de e-mails
          </p>
        </div>
        
        {/* BOTÕES PARA DESKTOP */}
        <div className="hidden sm:flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden xs:inline">Adicionar Atalho</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomChartOpen(true)}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="hidden xs:inline">Gráfico Personalizado</span>
          </Button>
          <Button variant="outline" size="sm" onClick={gerarPreview}>
            <FileDown className="h-4 w-4 mr-1" />
            <span className="hidden xs:inline">Pré-visualizar PDF</span>
          </Button>
        </div>

        {/* MENU MOBILE */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileActions(!showMobileActions)}
            className="w-full"
          >
            <Menu className="h-4 w-4 mr-2" />
            Ações
          </Button>
          
          {showMobileActions && (
            <div className="absolute left-0 right-0 mt-2 mx-4 bg-popover border rounded-lg shadow-lg z-50 p-3 space-y-2">
              <Button
                onClick={() => {
                  setIsDialogOpen(true);
                  setShowMobileActions(false);
                }}
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Atalho
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  setIsCustomChartOpen(true);
                  setShowMobileActions(false);
                }}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Gráfico Personalizado
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  gerarPreview();
                  setShowMobileActions(false);
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Pré-visualizar PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DIALOG DE NOVO ATALHO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Novo Atalho Personalizado
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Ex: Urgentes - Suporte"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="text-sm sm:text-base"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="text-xs sm:text-sm text-muted-foreground">
                  Categoria
                </label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {/* ✅ USANDO EMAIL_CATEGORIES CENTRALIZADA */}
                    {EMAIL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs sm:text-sm text-muted-foreground">
                  Estado
                </label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="all">Todos</SelectItem>
                    {/* ✅ USANDO BRAZILIAN_STATES CENTRALIZADA */}
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={addCustomCard}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DO GRÁFICO PERSONALIZADO */}
      <Dialog open={isCustomChartOpen} onOpenChange={setIsCustomChartOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Criar Novo Gráfico Personalizado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs sm:text-sm text-muted-foreground">
                Título do Gráfico *
              </label>
              <Input
                placeholder="Ex: Distribuição no Estado SP"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs sm:text-sm text-muted-foreground">
                  Tipo de Gráfico *
                </label>
                <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pie">Pizza (Status)</SelectItem>
                    <SelectItem value="bar">Barras (Categorias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs sm:text-sm text-muted-foreground">
                  Estado *
                </label>
                <Select value={chartState} onValueChange={setChartState}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    <SelectItem value="all">Selecione um estado</SelectItem>
                   
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs sm:text-sm text-muted-foreground">
                Status (Filtro opcional)
              </label>
              <Select value={chartStatus} onValueChange={setChartStatus}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="classified">Classificados</SelectItem>
                
                </SelectContent>
              </Select>
            </div>

            {/* Opção para municípios (para uso futuro) */}
            <div className="flex items-center space-x-2 p-2">
              <input
                type="checkbox"
                id="showCities"
                checked={showCities}
                onChange={(e) => setShowCities(e.target.checked)}
                disabled={true}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showCities" className="text-xs sm:text-sm text-muted-foreground">
                Incluir municípios (em breve)
              </label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Em breve</span>
            </div>

            <div className="p-3 bg-muted/30 rounded-md">
              <p className="text-xs sm:text-sm font-medium mb-1">
                Prévia do gráfico:
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground break-words">
                {chartTitle || "(Sem título)"} - {chartType === 'pie' ? 'Gráfico de Pizza' : 'Gráfico de Barras'}
                {chartState !== "all" && ` - Estado: ${chartState}`}
                {chartStatus !== "all" &&
                  ` - Status: ${
                    chartStatus === "pending"
                      ? "Pendentes"
                      : chartStatus === "classified"
                      ? "Classificados"
                      : "Arquivados"
                  }`}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCustomChartOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={gerarGraficoPersonalizado}
              className="w-full sm:w-auto order-1 sm:order-2"
              disabled={chartState === "all"}
            >
              Criar Gráfico
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DO PREVIEW DO PDF */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl p-2 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Pré-visualização do Relatório
            </DialogTitle>
          </DialogHeader>
          {previewImage ? (
            <div className="max-h-[60vh] sm:max-h-[70vh] overflow-auto border rounded-md">
              <img src={previewImage} alt="Prévia do PDF" className="w-full" />
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10 text-sm sm:text-base">
              Gerando preview...
            </p>
          )}
          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={gerarPDF}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Baixar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CARDS PRINCIPAIS RESPONSIVOS */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = ICONS[stat.icon as keyof typeof ICONS];
          return (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow animate-slide-up cursor-pointer relative min-h-[120px] sm:min-h-[140px]"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleCardClick(stat)}
            >
              {customCards.some((c) => c.title === stat.title) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCard(stat.title);
                  }}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition z-10"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-1 sm:p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* GRÁFICOS */}
      <div id="dashboard-export" ref={exportRef} className="space-y-4 sm:space-y-6">
        {/* GRÁFICOS PERSONALIZADOS SALVOS */}
        {customCharts.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Gráficos Personalizados
              </h2>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {customCharts.length} gráfico
                {customCharts.length !== 1 ? "s" : ""} salvo
                {customCharts.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {customCharts.map((chart) => (
                <Card
                  key={chart.id}
                  className="hover:shadow-lg transition-shadow relative"
                >
                  <button
                    onClick={() => removerGrafico(chart.id)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition z-10 bg-background/80 backdrop-blur-sm rounded-full p-1"
                    title="Remover gráfico"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>

                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">
                      <div className="flex items-center gap-2">
                        <div className="truncate">{chart.title}</div>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                          {chart.type === 'pie' ? 'Pizza' : 'Barras'}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground font-normal mt-1 break-words">
                        Criado em: {chart.createdAt}
                        {chart.filters.state !== "all" &&
                          ` • Estado: ${chart.filters.state}`}
                        {chart.filters.status !== "all" &&
                          ` • Status: ${
                            chart.filters.status === "pending"
                              ? "Pendentes"
                              : chart.filters.status === "classified"
                              ? "Classificados"
                              : "Arquivados"
                          }`}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
                    {chart.data.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        {chart.type === 'pie' ? (
                          <PieChart>
                            <Pie
                              data={chart.data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={70}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {chart.data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [
                                `${value} e-mails`,
                                "Quantidade",
                              ]}
                            />
                            <Legend
                              wrapperStyle={{
                                fontSize: "12px",
                                paddingTop: "10px",
                              }}
                            />
                          </PieChart>
                        ) : (
                          <BarChart data={chart.data}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="hsl(var(--border))"
                            />
                            <XAxis
                              dataKey="name"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "0.5rem",
                                fontSize: "12px",
                              }}
                              formatter={(value) => [`${value} e-mails`, "Quantidade"]}
                            />
                            <Bar 
                              dataKey="value" 
                              fill="hsl(var(--primary))"
                              name="Quantidade"
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground text-center px-4">
                          Nenhum dado encontrado com os filtros aplicados
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* GRÁFICO DE PIZZA */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                E-mails por Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={70}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                      paddingTop: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* GRÁFICO DE LINHA */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Tendência Diária (Últimos 7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="emails"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Total de E-mails"
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    stroke="hsl(var(--warning))"
                    strokeWidth={2}
                    name="Pendentes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* TOP 5 ESTADOS E REMETENTES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Top 5 Estados por Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStates}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="state"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Top 5 Remetentes</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6 overflow-y-auto">
              <ul className="w-full space-y-2">
                {topSenders.map(({ sender, sender_email, count }, i) => (
                  <li
                    key={i}
                    onClick={() =>
                      navigate(`/sender-emails?sender=${encodeURIComponent(sender_email)}`)
                    }
                    className="flex justify-between items-center border-b pb-2 text-xs sm:text-sm cursor-pointer hover:bg-accent/40 p-2 rounded-md transition"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">
                        {i + 1}. {sender}
                      </span>
                      <span className="text-muted-foreground text-xs truncate block">
                        {sender_email}
                      </span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-primary ml-2">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

      

        {/* TOP ESTADOS COM DETALHES */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <span>📍</span> Análise Geográfica Detalhada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Top 10 Estados</h4>
                <div className="space-y-2">
                  {topStates.slice(0, 10).map(({ state, count }, index) => {
                    const percentage = (count / stats.total * 100).toFixed(1);
                    return (
                      <div key={state} className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{state}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-3">Distribuição Regional</h4>
                <div className="space-y-3">
                  {[
                    { region: "Sudeste", states: ["SP", "RJ", "MG", "ES"], color: "bg-blue-500" },
                    { region: "Sul", states: ["PR", "SC", "RS"], color: "bg-green-500" },
                    { region: "Nordeste", states: ["BA", "PE", "CE", "MA", "PB", "PI", "RN", "AL", "SE"], color: "bg-yellow-500" },
                    { region: "Centro-Oeste", states: ["GO", "MT", "MS", "DF"], color: "bg-purple-500" },
                    { region: "Norte", states: ["PA", "AM", "TO", "RO", "AC", "AP", "RR"], color: "bg-red-500" }
                  ].map(({ region, states, color }) => {
                    const regionCount = topStates
                      .filter(item => states.includes(item.state))
                      .reduce((sum, item) => sum + item.count, 0);
                    const regionPercentage = (regionCount / stats.total * 100).toFixed(1);
                    
                    return (
                      <div key={region} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 ${color} rounded-full`}></div>
                            <span>{region}</span>
                          </div>
                          <span>{regionCount} ({regionPercentage}%)</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${color} transition-all duration-500`}
                            style={{ width: `${regionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}