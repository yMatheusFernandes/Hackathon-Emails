import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmails, updateEmail, type Email } from "@/lib/emailStorage";
import { Mail, Search, Filter, Eye, CheckCircle, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Pending() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { loadEmails(); }, []);
  useEffect(() => { filterEmails(); }, [emails, searchTerm]);

  const loadEmails = () => {
    const allEmails = getEmails();
    const pending = allEmails.filter(e => e.status === 'pending');
    setEmails(pending);
  };

  const filterEmails = () => {
    let filtered = [...emails];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(e =>
        (e.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.sender || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEmails(filtered);
  };

  const handleClassify = (id: string, category: string, priority: Email["priority"]) => {
    updateEmail(id, { status: "classified", category, priority });

    toast({
      title: "E-mail classificado!",
      description: `Categoria: ${category} | Prioridade: ${priority}`,
    });

    loadEmails();
  };

  // ---- Função de Arquivar ----
  const handleArchive = (id: string) => {
    updateEmail(id, { status: "archived" });

    toast({
      title: "E-mail arquivado!",
      description: "Movido para histórico.",
    });

    loadEmails();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">E-mails Pendentes</h1>
        <p className="text-muted-foreground">Classifique ou arquive os e-mails pendentes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por assunto ou remetente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LISTA */}
      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum e-mail pendente</p>
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email, index) => (
            <Card key={email.id} className="hover:shadow-md transition p-4" style={{ animationDelay:`${index * 0.05}s` }}>
              <div className="flex flex-col gap-4">

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{email.subject}</h3>
                    <p className="text-sm text-muted-foreground">De: {email.sender}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={()=>navigate(`/email/${email.id}`)}>
                  <Eye className="h-4 w-4 mr-2" /> Ver detalhes
                </Button>

                {/* --- CLASSIFICAÇÃO E AÇÃO --- */}
                <div className="flex flex-col md:flex-row gap-3">

                  {/* Categoria */}
                  <Select onValueChange={(v)=> email.category = v}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trabalho">Trabalho</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Prioridade */}
                  <Select onValueChange={(v)=> email.priority = v as Email["priority"]}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Prioridade..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={()=>handleClassify(email.id,email.category!,email.priority!)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Finalizar
                  </Button>

                  {/* Arquivar */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={()=>handleArchive(email.id)}
                  >
                    <Archive className="h-4 w-4" />
                    Arquivar
                  </Button>

                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
