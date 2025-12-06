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

export default function Dashboard() {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // Nova state para controle

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

  const gerarPreview = async () => {
    if (!exportRef.current) return alert("Seção do dashboard não encontrada!");
    try {
      setIsExporting(true); // Ativar modo exportação
      
      // Aguardar um momento para que o DOM seja atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(exportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      setPreviewImage(imgData);
      setIsPreviewOpen(true);
      setIsExporting(false); // Desativar modo exportação
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
      alert("Erro ao gerar preview do relatório");
      setIsExporting(false);
    }
  };

  const gerarPDF = async () => {
    if (!exportRef.current) {
      alert("Gráficos não encontrados!");
      return;
    }
    try {
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
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
      setIsExporting(false);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF");
      setIsExporting(false);
    }
  };

  const calculateCardValue = (filters: Record<string, string>) => {
    if (!emails || emails.length === 0) return 0;
    
    return emails.filter((email) => {
      if (!email) return false;
      
      const emailCategory = email.category?.toString().trim().toLowerCase() || "";
      const emailState = email.state || "";
      const emailStatus = email.status || "";
      const emailPriority = email.priority || "";

      const matchesStatus =
        !filters.status ||
        filters.status === "all" ||
        emailStatus === filters.status;
      const matchesPriority =
        !filters.priority ||
        filters.priority === "all" ||
        emailPriority === filters.priority;
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
      try {
        const result = await fetchDashboardStats();

        if (!result || result.error) {
          console.error("Erro ao carregar dashboard:", result?.error);
          // Fallback com dados de exemplo para desenvolvimento
          setStats({
            total: 1250,
            pending: 320,
            classified: 780,
            recent: 150,
            archived: 85,
            urgent: 45,
          });

          setChartData([
            { name: "Pendentes", value: 320, color: COLORS.pending },
            { name: "Classificados", value: 780, color: COLORS.classified },
          ]);

          setDailyTrend([
            {
              date: "Últimos 7 dias",
              emails: 150,
              pending: 45,
            },
          ]);

          const estadosExemplo = [
            { state: "SP", count: 450 },
            { state: "RJ", count: 320 },
            { state: "MG", count: 280 },
            { state: "RS", count: 120 },
            { state: "PR", count: 80 },
          ];
          setTopStates(estadosExemplo);

          setTopSenders([
            { sender: "João Silva", sender_email: "joao@empresa.com", count: 120 },
            { sender: "Maria Santos", sender_email: "maria@cliente.com", count: 85 },
            { sender: "Carlos Oliveira", sender_email: "carlos@fornecedor.com", count: 72 },
            { sender: "Ana Costa", sender_email: "ana@parceiro.com", count: 65 },
            { sender: "Pedro Souza", sender_email: "pedro@consultoria.com", count: 53 },
          ]);

          // Criar emails dummy para os cards personalizados funcionarem
          const dummyEmails = Array.from({ length: 1250 }, (_, i) => ({
            id: i + 1,
            state: estadosExemplo[i % estadosExemplo.length]?.state || "SP",
            status: i % 4 === 0 ? "pending" : i % 4 === 1 ? "classified" : i % 4 === 2 ? "archived" : "urgent",
            category: ["marketing", "financeiro", "suporte", "pessoal", "outros"][i % 5],
            priority: ["low", "medium", "high", "urgent"][i % 4],
          }));
          setEmails(dummyEmails);
          
          return;
        }

        const data = result.data;

        setStats({
          total: data.total || 0,
          pending: data.pendentes || 0,
          classified: data.classificados || 0,
          recent: data.emails_ultimos_7_dias || 0,
          archived: data.arquivados || 0,
          urgent: data.urgentes || 0,
        });

        setChartData([
          { name: "Pendentes", value: data.pendentes || 0, color: COLORS.pending },
          {
            name: "Classificados",
            value: data.classificados || 0,
            color: COLORS.classified,
          },
        ]);

        setDailyTrend([
          {
            date: "Últimos 7 dias",
            emails: data.emails_ultimos_7_dias || 0,
            pending: data.pendentes || 0,
          },
        ]);

        const estados = Object.entries(data.emails_por_estado || {}).map(
          ([estado, count]) => ({ state: estado, count: count as number })
        );
        setTopStates(estados);

        setTopSenders(
          (data.top_remetentes || []).map((item: any) => ({
            sender: item.nome || item.sender,
            sender_email: item.email || item.sender_email,
            count: item.total_emails || item.count,
          }))
        );

        if (data.emails) {
          setEmails(data.emails);
        } else {
          // Fallback: criar emails dummy
          const dummyEmails = Array.from({ length: data.total || 100 }, (_, i) => ({
            id: i + 1,
            state: estados[i % estados.length]?.state || "SP",
            status: i % 4 === 0 ? "pending" : i % 4 === 1 ? "classified" : i % 4 === 2 ? "archived" : "urgent",
            category: ["marketing", "financeiro", "suporte", "pessoal", "outros"][i % 5],
            priority: ["low", "medium", "high", "urgent"][i % 4],
          }));
          setEmails(dummyEmails);
        }

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Fallback para evitar erros
        setEmails([]);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const savedCards = localStorage.getItem("customDashboardCards");
    if (savedCards && emails.length > 0) {
      try {
        const parsed = JSON.parse(savedCards);
        const updated = parsed.map((c: any) => ({
          ...c,
          value: calculateCardValue(c.customFilters),
        }));
        setCustomCards(updated);
      } catch (error) {
        console.error("Erro ao carregar cards salvos:", error);
      }
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
    if (!newCardTitle.trim()) {
      alert("Por favor, insira um título para o atalho!");
      return;
    }
    
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
    
    alert(`Atalho "${newCardTitle}" criado com sucesso!`);
  };

  const removeCard = (title: string) => {
    const updated = customCards.filter((c) => c.title !== title);
    setCustomCards(updated);
    localStorage.setItem("customDashboardCards", JSON.stringify(updated));
    alert(`Atalho "${title}" removido!`);
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
            onClick={gerarPreview}
            disabled={isExporting}
          >
            <FileDown className="h-4 w-4 mr-1" />
            <span className="hidden xs:inline">
              {isExporting ? "Gerando..." : "Pré-visualizar PDF"}
            </span>
          </Button>
        </div>

        {/* MENU MOBILE */}
        <div className="sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileActions(!showMobileActions)}
            className="w-full"
            disabled={isExporting}
          >
            <Menu className="h-4 w-4 mr-2" />
            {isExporting ? "Processando..." : "Ações"}
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
                  gerarPreview();
                  setShowMobileActions(false);
                }}
                disabled={isExporting}
              >
                <FileDown className="h-4 w-4 mr-2" />
                {isExporting ? "Gerando..." : "Pré-visualizar PDF"}
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
              {isExporting ? "Gerando preview..." : "Preview não disponível"}
            </p>
          )}
          <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsPreviewOpen(false);
                setIsExporting(false);
              }}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={gerarPDF}
              disabled={isExporting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isExporting ? "Gerando PDF..." : "Baixar PDF"}
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

      {/* GRÁFICOS - ÁREA DE EXPORTAÇÃO */}
      <div 
        id="dashboard-export" 
        ref={exportRef} 
        className="space-y-4 sm:space-y-6 bg-white"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* GRÁFICO DE PIZZA - APENAS CLASSIFICADOS E PENDENTES */}
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
                    data={chartData.filter(item => 
                      item.name === "Classificados" || item.name === "Pendentes"
                    )}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={70}
                    dataKey="value"
                  >
                    {chartData
                      .filter(item => item.name === "Classificados" || item.name === "Pendentes")
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} e-mails`, "Quantidade"]}
                  />
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
                <BarChart 
                  data={[...topStates]
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                    formatter={(value) => [`${value} e-mails`, "Quantidade"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    name="Quantidade"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* CARD DOS REMETENTES - OTIMIZADO PARA PDF */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Top 5 Remetentes</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] sm:h-[300px] p-2 sm:p-6">
              <div className={`space-y-3 max-h-full ${!isExporting ? 'overflow-y-auto pr-2' : ''}`}>
                {topSenders.slice(0, 5).map(({ sender, sender_email, count }, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      !isExporting ? 'hover:bg-accent/50 cursor-pointer group' : ''
                    } transition-colors`}
                    onClick={!isExporting ? () =>
                      navigate(`/sender-emails?sender=${encodeURIComponent(sender_email)}`)
                    : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* NÚMERO DO RANKING */}
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      
                      {/* INFORMAÇÕES DO REMETENTE - SEM TRUNCATE NO MODO EXPORTAÇÃO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                          <h4 className={`font-semibold text-foreground ${
                            isExporting ? 'text-sm break-words' : 'text-sm sm:text-base truncate'
                          }`}>
                            {sender}
                          </h4>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            ({count} e-mails)
                          </span>
                        </div>
                        <p className={`text-xs text-muted-foreground ${
                          isExporting ? 'break-words mt-1' : 'truncate mt-1'
                        }`}>
                          {sender_email}
                        </p>
                      </div>
                    </div>
                    
                    {/* SETA APENAS NO MODO NORMAL */}
                    {!isExporting && (
                      <div className="flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg 
                          className="w-4 h-4 text-muted-foreground" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 5l7 7-7 7" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* MENSAGEM SE NÃO HOUVER DADOS */}
                {topSenders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <Mail className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum dado de remetente disponível
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ANÁLISE GEOGRÁFICA DETALHADA */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <span></span> Análise Geográfica Detalhada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-3">Top 10 Estados</h4>
                <div className="space-y-2">
                  {topStates.slice(0, 10).map(({ state, count }, index) => {
                    const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(1) : "0";
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
                    const regionPercentage = stats.total > 0 ? (regionCount / stats.total * 100).toFixed(1) : "0";
                    
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
  );
}