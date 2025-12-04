import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO"
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
      pdf.text("Relatório - Email Manager", pageWidth / 2, 20, { align: "center" });

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

  // ---------- CÁLCULO DE CARDS ----------
  const calculateCardValue = (filters: Record<string, string>) => {
    return emails.filter((email) => {
      const emailCategory = email.category?.toString().trim().toLowerCase() || "";
      const emailState = email.state || "";

      const matchesStatus =
        !filters.status || filters.status === "all" || email.status === filters.status;
      const matchesPriority =
        !filters.priority || filters.priority === "all" || email.priority === filters.priority;
      const matchesCategory =
        !filters.category ||
        filters.category === "all" ||
        emailCategory === filters.category.toLowerCase();
      const matchesState =
        !filters.state ||
        filters.state === "all" ||
        emailState === filters.state;

      return matchesStatus && matchesPriority && matchesCategory && matchesState;
    }).length;
  };

  useEffect(() => {
    const emailStats = getEmailStats();
    const allEmails = getEmails();
    setStats(emailStats);
    setEmails(allEmails);

    const statusData = [
      { name: "Pendentes", value: emailStats.pending, color: COLORS.pending },
      { name: "Classificados", value: emailStats.classified, color: COLORS.classified },
    ];
    setChartData(statusData);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const trendData = last7Days.map((date) => {
      const dateStr = date.toISOString().split("T")[0];
      const dayEmails = allEmails.filter((e) => e.date.startsWith(dateStr));
      return {
        date: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        emails: dayEmails.length,
        pending: dayEmails.filter((e) => e.status === "pending").length,
      };
    });
    setDailyTrend(trendData);

    const emailByState = allEmails.reduce((acc, email) => {
      const state = email.state || "Não informado";
      if (!acc[state]) acc[state] = 0;
      acc[state]++;
      return acc;
    }, {} as Record<string, number>);

    const top5States = Object.entries(emailByState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }));
    setTopStates(top5States);

    const emailBySender = allEmails.reduce((acc, email) => {
      const sender = email.sender || "Desconhecido";
      if (!acc[sender]) acc[sender] = 0;
      acc[sender]++;
      return acc;
    }, {} as Record<string, number>);

    const top5Senders = Object.entries(emailBySender)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sender, count]) => ({ sender, count }));
    setTopSenders(top5Senders);
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
      if (card.customFilters.status) params.append("status", card.customFilters.status);
      if (card.customFilters.priority) params.append("priority", card.customFilters.priority);
      if (card.customFilters.category) params.append("category", card.customFilters.category);
      if (card.customFilters.state) params.append("state", card.customFilters.state);
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
                <label className="text-sm text-muted-foreground">Categoria</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
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
                  <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader><CardTitle>E-mails por Status</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
            <CardHeader><CardTitle>Tendência Diária (Últimos 7 dias)</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
            <CardHeader><CardTitle>Top 5 Estados por Volume</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="state" stroke="hsl(var(--muted-foreground))" />
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
            <CardHeader><CardTitle>Top 5 Remetentes</CardTitle></CardHeader>
            <CardContent className="h-[300px] overflow-y-auto">
              <ul className="w-full space-y-3">
                {topSenders.map(({ sender, count }, i) => (
                  <li
                    key={i}
                    onClick={() =>
                      navigate(`/all-emails?sender=${encodeURIComponent(sender)}`)
                    }
                    className="flex justify-between items-center border-b pb-2 text-sm cursor-pointer hover:bg-accent/40 p-2 rounded-md transition"
                  >
                    <span className="font-medium break-words">
                      {i + 1}. {sender}
                    </span>
                    <span className="text-lg font-bold text-primary">{count}</span>
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
