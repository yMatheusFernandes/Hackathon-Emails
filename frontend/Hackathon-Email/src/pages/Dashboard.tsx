import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, CheckCircle, Archive, AlertTriangle, TrendingUp } from "lucide-react";
import { getEmailStats, getEmails } from "@/lib/emailStorage";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = {
  pending: 'hsl(var(--warning))',
  classified: 'hsl(var(--success))',
  archived: 'hsl(var(--muted))',
  urgent: 'hsl(var(--destructive))',
};

export default function Dashboard() {
  const navigate = useNavigate();
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

  useEffect(() => {
    const emailStats = getEmailStats();
    setStats(emailStats);

    const emails = getEmails();
    
    const statusData = [
      { name: 'Pendentes', value: emailStats.pending, color: COLORS.pending },
      { name: 'Classificados', value: emailStats.classified, color: COLORS.classified },
      { name: 'Arquivados', value: emailStats.archived, color: COLORS.archived },
    ];
    setChartData(statusData);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const trendData = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayEmails = emails.filter(e => e.date.startsWith(dateStr));
      return {
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        emails: dayEmails.length,
        pending: dayEmails.filter(e => e.status === 'pending').length,
      };
    });
    setDailyTrend(trendData);
  }, []);

  const statCards = [
    {
      title: "Total de E-mails",
      value: stats.total,
      icon: Mail,
      color: "text-primary",
      bgColor: "bg-primary/10",
      filterStatus: null,
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      filterStatus: "pending",
    },
    {
      title: "Classificados",
      value: stats.classified,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
      filterStatus: "classified",
    },
    {
      title: "Arquivados",
      value: stats.archived,
      icon: Archive,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      filterStatus: "archived",
    },
    {
      title: "Urgentes",
      value: stats.urgent,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      filterStatus: "urgent",
    },
    {
      title: "Últimos 7 dias",
      value: stats.recent,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      filterStatus: "recent",
    },
  ];

  const handleCardClick = (filterStatus: string | null) => {
  if (!filterStatus) {
    navigate("/history");
    return;
  }

  if (filterStatus === "urgent") {
    // envia o filtro de prioridade
    navigate("/history?priority=urgent");
  } else {
    navigate(`/history?status=${filterStatus}`);
  }
};


  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de gestão de e-mails</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="hover:shadow-lg transition-shadow animate-slide-up cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleCardClick(stat.filterStatus)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>E-mails por Estado</CardTitle>
          </CardHeader>
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
                  fill="#8884d8"
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
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
    </div>
  );
}