import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmails, type Email } from "@/lib/emailStorage";
import { Search, Filter, Eye, Mail, X } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function History() {
  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();
  // respect ?status=... but also allow visiting a route that contains "archiv" to open archived filter
  const urlStatus = query.get("status") ?? (location.pathname.includes("archiv") ? "archived" : "all");
  // read additional query params so dashboard can open /history?priority=urgent or /history?search=...
  const urlPriority = query.get("priority") ?? "all";
  const urlCategory = query.get("category") ?? "all";
  const urlSearch = query.get("search") ?? "";
  const urlStart = query.get("start") ?? "";
  const urlEnd = query.get("end") ?? "";

  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(urlStatus);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // apply query params whenever the location/search changes
  useEffect(() => {
    const allEmails = getEmails();
    setEmails(allEmails);
    setStatusFilter(urlStatus);
    setPriorityFilter(urlPriority);
    setCategoryFilter(urlCategory);
    setSearchTerm(urlSearch);
    setStartDate(urlStart);
    setEndDate(urlEnd);
  }, [location.search, location.pathname]);

  useEffect(() => {
    filterEmails();
  }, [emails, searchTerm, statusFilter, categoryFilter, priorityFilter, startDate, endDate]);

  const filterEmails = () => {
    let filtered = [...emails];

    if (searchTerm) {
      filtered = filtered.filter(e =>
        (e.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.sender || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.content || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "urgent") {
        filtered = filtered.filter(e =>
          e.status === "urgent" ||
          e.priority === "urgent" ||
          e.priority === "high"
        );
      } else if (statusFilter === "recent") {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        filtered = filtered.filter(e => {
          try { return new Date(e.date) >= cutoff; } catch { return false; }
        });
      } else {
        filtered = filtered.filter(e => e.status === statusFilter);
      }
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(e => e.category === categoryFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(e => e.priority === priorityFilter);
    }

    if (startDate) {
      const s = new Date(startDate);
      filtered = filtered.filter(e => {
        try { return new Date(e.date) >= s; } catch { return false; }
      });
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23,59,59,999);
      filtered = filtered.filter(item => {
        try { return new Date(item.date) <= e; } catch { return false; }
      });
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setFilteredEmails(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setStartDate("");
    setEndDate("");
    navigate("/history");
  };

  const getStatusColor = (status: Email['status']) => {
    const colors = {
      pending: 'bg-warning/20 text-warning',
      classified: 'bg-success/20 text-success',
      archived: 'bg-muted text-muted-foreground',
    } as Record<string, string>;
    return colors[status];
  };

  const getPriorityColor = (priority: Email['priority']) => {
    const colors = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-primary/20 text-primary',
      high: 'bg-warning/20 text-warning',
      urgent: 'bg-destructive/20 text-destructive',
    } as Record<string, string>;
    return colors[priority];
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    classified: 'Classificado',
    archived: 'Arquivado',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',
  };

  const categories = Array.from(new Set(emails.map(e => e.category).filter(Boolean)));

  const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all" || priorityFilter !== "all" || searchTerm !== "" || startDate !== "" || endDate !== "";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-foreground mb-2">Histórico de E-mails</h1>
           <p className="text-muted-foreground">
             Visualize e busque todos os e-mails do sistema
           </p>
         </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/history?status=archived")}>
            Arquivados
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>
       </div>
       
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por assunto, remetente ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Estados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="classified">Classificados</SelectItem>
                <SelectItem value="archived">Arquivados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Urgências</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Data inicial</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Data final</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredEmails.length} de {emails.length} e-mails
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum e-mail encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email, index) => (
            <Card key={email.id} className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: `${index * 0.03}s` }}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base md:text-lg">{email.subject}</h3>
                      <Badge className={getStatusColor(email.status)}>
                        {statusLabels[email.status]}
                      </Badge>
                      <Badge className={getPriorityColor(email.priority)}>
                        {priorityLabels[email.priority]}
                      </Badge>
                      {email.category && (
                        <Badge variant="outline">{email.category}</Badge>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-muted-foreground">
                      <span>De: <span className="font-medium">{email.sender}</span></span>
                      <span className="hidden md:inline">•</span>
                      <span>
                        {new Date(email.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/email/${email.id}`)}
                    className="w-full md:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 