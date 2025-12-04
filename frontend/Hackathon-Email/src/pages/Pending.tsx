import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmails, updateEmail, type Email } from "@/lib/emailStorage";
import { Mail, Search, Filter, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const estadosBrasil = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO"
];

export default function Pending() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, searchTerm]);

  const loadEmails = () => {
    const pending = getEmails().filter(e => e.status === "pending");
    setEmails(pending);
  };

  const filterEmails = () => {
    let list = [...emails];
    if (searchTerm.trim() !== "") {
      list = list.filter(e =>
        e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEmails(list);
  };

  const findEmail = (id: string) => emails.find(e => e.id === id)!;

  const handleClassify = (id: string) => {
    const e = findEmail(id);
    
    if (!e.category || !e.state) {
      toast({
        title: "Preencha todos os campos!",
        description: "Selecione Categoria e Estado antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    updateEmail(id, {
      status: "classified",
      category: e.category,
      state: e.state,
    });

    toast({
      title: "E-mail classificado!",
      description: `${e.category} | ${e.state}`,
    });
    
    loadEmails();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">E-mails Pendentes</h1>
        <p className="text-muted-foreground">Classifique todos os campos: Categoria, Prioridade e Estado</p>
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

      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Nenhum e-mail pendente</p>
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email) => (
            <Card key={email.id} className="hover:shadow-md transition p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{email.subject}</h3>
                  <p className="text-sm text-muted-foreground">De: {email.sender}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  {/* Categoria */}
                  <Select onValueChange={(v) => { email.category = v; }}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trabalho">Trabalho</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Estado */}
                  <Select onValueChange={(v) => { email.state = v; }}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasil.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={() => handleClassify(email.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Finalizar
                  </Button>
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
