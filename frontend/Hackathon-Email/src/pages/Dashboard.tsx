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
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { getEmailStats, getEmails } from "@/lib/emailStorage";
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

const estadosBrasil = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

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

// Interface para o gráfico personalizado salvo
interface CustomChart {
  id: string;
  title: string;
  data: any[];
  filters: {
    state: string;
    status: string;
  };
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const exportRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCustomChartOpen, setIsCustomChartOpen] = useState(false);

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

  // Estados para o gráfico personalizado
  const [chartState, setChartState] = useState("all");
  const [chartStatus, setChartStatus] = useState("all");
  const [customCharts, setCustomCharts] = useState<CustomChart[]>([]);
  const [chartTitle, setChartTitle] = useState("");

  // ---------- CARREGAR GRÁFICOS SALVOS ----------
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

  // ---------- SALVAR GRÁFICOS ----------
  const saveChartsToLocalStorage = (charts: CustomChart[]) => {
    try {
      localStorage.setItem("customDashboardCharts", JSON.stringify(charts));
    } catch (error) {
      console.error("Erro ao salvar gráficos:", error);
    }
  };

  // ---------- FUNÇÕES DE PDF ----------
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

  // ---------- FUNÇÃO DO GRÁFICO PERSONALIZADO ----------
  const gerarGraficoPersonalizado = () => {
    if (!chartTitle.trim()) {
      alert("Por favor, dê um título ao gráfico!");
      return;
    }

    let filtrados = [...emails];

    if (chartState !== "all")
      filtrados = filtrados.filter((e) => e.state === chartState);
    if (chartStatus !== "all")
      filtrados = filtrados.filter((e) => e.status === chartStatus);

    // Agrupar por categoria
    const categorias = filtrados.reduce((acc, email) => {
      const categoria = email.category?.toLowerCase() || "outros";
      if (!acc[categoria]) acc[categoria] = 0;
      acc[categoria]++;
      return acc;
    }, {} as Record<string, number>);

    // Converter para o formato do gráfico
    const data = Object.entries(categorias).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color:
        CATEGORY_COLORS[name as keyof typeof CATEGORY_COLORS] ||
        CATEGORY_COLORS.outros,
    }));

    // Criar novo gráfico
    const newChart: CustomChart = {
      id: Date.now().toString(),
      title: chartTitle,
      data,
      filters: {
        state: chartState,
        status: chartStatus,
      },
      createdAt: new Date().toLocaleString("pt-BR"),
    };

    // Adicionar à lista
    const updatedCharts = [...customCharts, newChart];
    setCustomCharts(updatedCharts);
    saveChartsToLocalStorage(updatedCharts);

    // Limpar formulário
    setChartTitle("");
    setChartState("all");
    setChartStatus("all");
    setIsCustomChartOpen(false);
  };

  // ---------- REMOVER GRÁFICO ----------
  const removerGrafico = (id: string) => {
    const updatedCharts = customCharts.filter((chart) => chart.id !== id);
    setCustomCharts(updatedCharts);
    saveChartsToLocalStorage(updatedCharts);
  };

  // ---------- CÁLCULO DE CARDS ----------
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

  // ...

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchDashboardStats();

      if (!result || result.error) {
        console.error("Erro ao carregar dashboard:", result?.error);
        return;
      }

      const data = result.data;

      // 1 — Atualiza cards principais
      setStats({
        total: data.total,
        pending: data.pendentes,
        classified: data.classificados,
        recent: data.emails_ultimos_7_dias,
        archived: 0, // sua API ainda não retorna isso
        urgent: 0, // nem isso
      });

      // 2 — Atualiza gráficos
      setChartData([
        { name: "Pendentes", value: data.pendentes, color: COLORS.pending },
        {
          name: "Classificados",
          value: data.classificados,
          color: COLORS.classified,
        },
      ]);

      // 3 — Tendência (por enquanto usa apenas número bruto)
      setDailyTrend([
        {
          date: "Últimos 7 dias",
          emails: data.emails_ultimos_7_dias,
          pending: data.pendentes,
        },
      ]);

      // 4 — Top estados
      const estados = Object.entries(data.emails_por_estado).map(
        ([estado, count]) => ({ state: estado, count })
      );
      setTopStates(estados);

    // 5 — Top remetentes
    setTopSenders(
      data.top_remetentes.map((item: any) => ({
        sender: item.nome,
        sender_email: item.email,
        count: item.total_emails,
      }))
    );

      // 6 — Emails brutos (se precisar depois)
      setEmails([]); // Sua API ainda não retorna todos os emails
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
    if (!filterStatus) return navigate("/history");
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão de e-mails
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Adicionar Atalho
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomChartOpen(true)}
          >
            <TrendingUp className="h-4 w-4 mr-1" /> Gráfico Personalizado
          </Button>

          <Button variant="outline" size="sm" onClick={gerarPreview}>
            <FileDown className="h-4 w-4 mr-1" /> Pré-visualizar PDF
          </Button>
        </div>
      </div>

      {/* DIALOG DE NOVO ATALHO */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Atalho Personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Ex: Urgentes - Suporte"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <label className="text-sm text-muted-foreground">
                  Categoria
                </label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
                    <SelectItem value="pessoal">Pessoal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Estado</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {estadosBrasil.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addCustomCard}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DO GRÁFICO PERSONALIZADO */}
      <Dialog open={isCustomChartOpen} onOpenChange={setIsCustomChartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Gráfico Personalizado</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Título do gráfico */}
            <div>
              <label className="text-sm text-muted-foreground">
                Título do Gráfico *
              </label>
              <Input
                placeholder="Ex: Distribuição por Categoria no PI"
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="text-sm text-muted-foreground">Estado</label>
              <Select value={chartState} onValueChange={setChartState}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Estados</SelectItem>
                  {estadosBrasil.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <Select value={chartStatus} onValueChange={setChartStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="classified">Classificados</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prévia do título do gráfico */}
            <div className="p-3 bg-muted/30 rounded-md">
              <p className="text-sm font-medium mb-1">Prévia do gráfico:</p>
              <p className="text-sm text-muted-foreground">
                {chartTitle || "(Sem título)"}
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

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomChartOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={gerarGraficoPersonalizado}>Criar Gráfico</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DO PREVIEW DO PDF */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização do Relatório</DialogTitle>
          </DialogHeader>
          {previewImage ? (
            <div className="max-h-[70vh] overflow-auto border rounded-md">
              <img src={previewImage} alt="Prévia do PDF" className="w-full" />
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-10">
              Gerando preview...
            </p>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={gerarPDF}>Baixar PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CARDS PRINCIPAIS (SEM ARQUIVADOS E URGENTES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {statCards.map((stat, index) => {
          const Icon = ICONS[stat.icon as keyof typeof ICONS];
          return (
            <Card
              key={stat.title}
              className="hover:shadow-lg transition-shadow animate-slide-up cursor-pointer relative"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleCardClick(stat)}
            >
              {customCards.some((c) => c.title === stat.title) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCard(stat.title);
                  }}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* GRÁFICOS */}
      <div id="dashboard-export" ref={exportRef} className="space-y-6">
        {/* GRÁFICOS PERSONALIZADOS SALVOS */}
        {customCharts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Gráficos Personalizados
              </h2>
              <div className="text-sm text-muted-foreground">
                {customCharts.length} gráfico
                {customCharts.length !== 1 ? "s" : ""} salvo
                {customCharts.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {customCharts.map((chart) => (
                <Card
                  key={chart.id}
                  className="hover:shadow-lg transition-shadow relative"
                >
                  <button
                    onClick={() => removerGrafico(chart.id)}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition z-10"
                    title="Remover gráfico"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <CardHeader>
                    <CardTitle className="text-lg">
                      {chart.title}
                      <div className="text-sm text-muted-foreground font-normal mt-1">
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
                  <CardContent className="h-[300px]">
                    {chart.data.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chart.data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
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
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GRÁFICO DE PIZZA (Apenas Pendentes e Classificados) */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>E-mails por Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData} // ← já contém apenas pendentes e classificados
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Tendência Diária (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Top 5 Estados por Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStates}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="state"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Top 5 Remetentes</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] overflow-y-auto">
              <ul className="w-full space-y-3">
                {topSenders.map(({ sender, sender_email, count }, i) => (
                  <li
                    key={i}
                    onClick={() =>
                      navigate(`/sender-emails?sender=${ (sender_email)}`)
                    }
                    className="flex justify-between items-center border-b pb-2 text-sm cursor-pointer hover:bg-accent/40 p-2 rounded-md transition"
                  >
                    <span className="font-medium break-words">
                      {i + 1}. {sender}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
