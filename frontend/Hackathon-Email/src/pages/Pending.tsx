import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmails, updateEmail, type Email } from "@/lib/emailStorage";
import { Mail, Search, Filter, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pending() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, searchTerm, priorityFilter]);

  const loadEmails = () => {
    const allEmails = getEmails();
    const pending = allEmails.filter(e => e.status === 'pending');
    setEmails(pending);
  };

  const filterEmails = () => {
    let filtered = [...emails];

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(e => e.priority === priorityFilter);
    }

    setFilteredEmails(filtered);
  };

  const handleClassify = (id: string, category: string) => {
    updateEmail(id, { status: 'classified', category });
    loadEmails();
    toast({
      title: "E-mail classificado",
      description: `E-mail movido para categoria: ${category}`,
    });
  };

  const getPriorityColor = (priority: Email['priority']) => {
    const colors = {
      low: 'bg-muted text-muted-foreground',
      medium: 'bg-primary/20 text-primary',
      high: 'bg-warning/20 text-warning',
      urgent: 'bg-destructive/20 text-destructive',
    };
    return colors[priority];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">E-mails Pendentes</h1>
        <p className="text-muted-foreground">
          Classifique e organize seus e-mails pendentes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por assunto ou remetente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhum e-mail pendente encontrado
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email, index) => (
            <Card key={email.id} className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{email.subject}</h3>
                      <Badge className={getPriorityColor(email.priority)}>
                        {email.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      De: <span className="font-medium">{email.sender}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(email.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 md:items-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/email/${email.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Select onValueChange={(value) => handleClassify(email.id, value)}>
                      <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Classificar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Trabalho">Trabalho</SelectItem>
                        <SelectItem value="Pessoal">Pessoal</SelectItem>
                        <SelectItem value="Financeiro">Financeiro</SelectItem>
                        <SelectItem value="Suporte">Suporte</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
