import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmails, updateEmail, type Email } from "@/lib/emailStorage";
import { Mail, Search, Filter, Eye, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchEmailsPending } from "@/services/api";
import { classifyEmail } from "@/services/api";

// ✅ IMPORTANDO AS CONSTANTES CENTRALIZADAS
import { BRAZILIAN_STATES, EMAIL_CATEGORIES, BRAZILIAN_CITIES_BY_STATE } from "@/lib/emailStorage";

// Interface para armazenar os valores selecionados por email
interface EmailSelections {
  [emailId: string]: {
    category: string;
    state: string;
    city: string;
  }
}

export default function Pending() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selections, setSelections] = useState<EmailSelections>({});
  const [availableCities, setAvailableCities] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    filterEmails();
  }, [emails, searchTerm]);

  // 🔥 Agora a função pega da API REAL, não mais dos fakes
  const loadEmails = async () => {
    try {
      const response = await fetchEmailsPending();

      // Agora usamos response.data que contém a lista real
      const apiEmails = response.data;

      // Normalização (a API usa nomes diferentes dos usados no front)
      const pendingEmails: Email[] = apiEmails.map((e: any) => ({
        id: e.id,
        subject: e.assunto,
        sender: e.remetente,
        recipient: e.destinatario,
        content: e.corpo,
        date: e.data,
        status: e.classificado ? "classified" : "pending",
        state: e.estado || "",
        category: e.categoria || "",
        tags: [],
        priority: "medium",
      }));

      setEmails(pendingEmails);

      // Inicializar seleções para cada email
      const initialSelections: EmailSelections = {};
      pendingEmails.forEach(email => {
        initialSelections[email.id] = {
          category: email.category || "",
          state: email.state || "",
          city: "",
        };
      });
      setSelections(initialSelections);

    } catch (err) {
      console.error("Erro ao carregar e-mails pendentes", err);
      toast({
        title: "Erro ao carregar e-mails",
        description: "Não foi possível carregar os e-mails pendentes.",
        variant: "destructive",
      });
    }
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

  const handleSelectionChange = (emailId: string, field: 'category' | 'state' | 'city', value: string) => {
    setSelections(prev => {
      const updated = { ...prev };
      
      if (field === 'state') {
        // Quando muda o estado, limpa a cidade e atualiza cidades disponíveis
        updated[emailId] = {
          ...updated[emailId],
          state: value,
          city: ""
        };
        
        // ✅ USANDO BRAZILIAN_CITIES_BY_STATE CENTRALIZADA
        const cities = [...(BRAZILIAN_CITIES_BY_STATE[value] || []), "Outro"];
        setAvailableCities(prevCities => ({
          ...prevCities,
          [emailId]: cities
        }));
      } else {
        updated[emailId] = {
          ...updated[emailId],
          [field]: value
        };
      }
      
      return updated;
    });
  };

  const getAvailableCitiesForEmail = (emailId: string) => {
    return availableCities[emailId] || [];
  };

  const handleClassify = async (emailId: string) => {
    const emailSelections = selections[emailId];
    const email = emails.find(e => e.id === emailId);

    if (!emailSelections || !email) {
      toast({
        title: "Erro!",
        description: "E-mail não encontrado.",
        variant: "destructive",
      });
      return;
    }

    if (!emailSelections.category || !emailSelections.state || !emailSelections.city) {
      toast({
        title: "Preencha todos os campos!",
        description: "Selecione Categoria, Estado e Município antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 🔥 Envia os dados reais para a API Flask
      await classifyEmail(
        emailId,
        emailSelections.state,
        emailSelections.city,
        emailSelections.category
      );

      toast({
        title: "E-mail classificado!",
        description: `${emailSelections.category} | ${emailSelections.state} - ${emailSelections.city}`,
      });

      // Limpa seleções
      setSelections(prev => {
        const { [emailId]: _, ...rest } = prev;
        return rest;
      });

      // Recarrega pendentes
      await loadEmails();

    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao classificar!",
        description: "Não foi possível enviar os dados para o servidor.",
        variant: "destructive",
      });
    }
  };

  const isEmailReadyToClassify = (emailId: string) => {
    const selection = selections[emailId];
    return selection && selection.category && selection.state && selection.city;
  };

  // ✅ Função para obter nome completo do estado
  const getStateName = (stateCode: string): string => {
    const state = BRAZILIAN_STATES.find(s => s.code === stateCode);
    return state ? state.name : stateCode;
  };

  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">E-mails Pendentes</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Classifique todos os campos: Categoria, Estado e Município
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por assunto ou remetente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-10 sm:py-12">
              <Mail className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm sm:text-base">
                {searchTerm ? "Nenhum e-mail encontrado com essa busca" : "Nenhum e-mail pendente"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map((email) => {
            const selection = selections[email.id] || { category: "", state: "", city: "" };
            const cities = getAvailableCitiesForEmail(email.id);
            
            return (
              <Card key={email.id} className="hover:shadow-md transition p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{email.subject}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">De: {email.sender}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {email.content.substring(0, 100)}...
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Categoria */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Categoria *</label>
                      <Select 
                        value={selection.category} 
                        onValueChange={(value) => handleSelectionChange(email.id, 'category', value)}
                      >
                        <SelectTrigger className="w-full text-xs sm:text-sm">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {/* ✅ USANDO EMAIL_CATEGORIES CENTRALIZADA */}
                          {EMAIL_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Estado */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Estado (UF) *</label>
                      <Select 
                        value={selection.state} 
                        onValueChange={(value) => handleSelectionChange(email.id, 'state', value)}
                      >
                        <SelectTrigger className="w-full text-xs sm:text-sm">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {/* ✅ USANDO BRAZILIAN_STATES CENTRALIZADA */}
                          {BRAZILIAN_STATES.map((state) => (
                            <SelectItem key={state.code} value={state.code}>
                              <div className="flex items-center gap-2 py-1">
                                <span className="font-mono bg-blue-500 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                  {state.code}
                                </span>
                                <span className="text-xs sm:text-sm">{state.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Município */}
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Município *</label>
                      <Select 
                        value={selection.city} 
                        onValueChange={(value) => handleSelectionChange(email.id, 'city', value)}
                        disabled={!selection.state}
                      >
                        <SelectTrigger className="w-full text-xs sm:text-sm">
                          <SelectValue placeholder={
                            selection.state 
                              ? "Selecione..." 
                              : "← Selecione o estado"
                          } />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                          {cities.length === 0 && selection.state && (
                            <div className="p-4 text-center text-muted-foreground text-xs sm:text-sm">
                              Nenhuma cidade disponível para este estado
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      
                      {/* Campo de texto para município quando "Outro" é selecionado */}
                      {(selection.city === "Outro" || (selection.state && cities.length === 0)) && (
                        <Input
                          placeholder="Digite o nome do município"
                          value={selection.city === "Outro" ? "" : selection.city}
                          onChange={(e) => handleSelectionChange(email.id, 'city', e.target.value)}
                          className="mt-2 text-xs sm:text-sm"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button 
                      onClick={() => handleClassify(email.id)}
                      disabled={!isEmailReadyToClassify(email.id)}
                      className="sm:w-auto text-xs sm:text-sm"
                      size="sm"
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      {isEmailReadyToClassify(email.id) 
                        ? "Finalizar Classificação" 
                        : "Preencha todos os campos"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/email/${email.id}`)}
                      className="sm:w-auto text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>

                  {/* Mostrar resumo quando todos os campos estiverem preenchidos */}
                  {isEmailReadyToClassify(email.id) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-xs sm:text-sm font-medium text-green-800">
                          Pronto para classificar: 
                          <span className="font-bold ml-1">{selection.category}</span> • 
                          <span className="font-bold ml-1">{selection.state}</span> • 
                          <span className="font-bold ml-1">{selection.city}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Resumo no rodapé */}
      {filteredEmails.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            {filteredEmails.length} e-mail{filteredEmails.length !== 1 ? 's' : ''} pendente{filteredEmails.length !== 1 ? 's' : ''} • 
            Preencha todos os campos para classificar cada e-mail
          </p>
        </div>
      )}
    </div>
  );
}