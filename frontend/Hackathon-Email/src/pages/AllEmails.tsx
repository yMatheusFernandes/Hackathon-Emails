import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Search, X, Filter, Mail } from "lucide-react";
import { fetchEmails } from "@/services/api";
import { type Email } from "@/lib/emailStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Interface estendida para incluir propriedades que vêm da API
interface EmailFromAPI extends Omit<Email, 'receiver' | 'city'> {
  receiver?: string;
  city?: string;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AllEmails() {
  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();

  const urlSender = query.get("sender") ?? "all";
  const [emails, setEmails] = useState<EmailFromAPI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [senderFilter, setSenderFilter] = useState(urlSender);
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Estados do Brasil
  const estadosBrasil = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  // Fetch emails do backend
  useEffect(() => {
    async function loadEmails() {
      try {
        const result = await fetchEmails();
        const resultEmails: EmailFromAPI[] = result.data.map((e: any) => ({
          id: e.id,
          subject: e.assunto,
          sender: e.remetente,
          receiver: e.destinatario || "", // Pode ser undefined
          content: e.corpo,
          date: e.data,
          status: e.classificado ? "classified" : "pending",
          state: e.estado || "",
          city: e.municipio || "", // Pode ser undefined
          category: e.categoria || "",
          tags: [],
        }));
        setEmails(resultEmails);
      } catch (err) {
        console.error("Erro ao carregar emails:", err);
      }
      setSenderFilter(urlSender);
    }
    loadEmails();
  }, [location.search]);

  // Filtrar emails
  const filteredEmails = emails.filter((email) => {
    // Filtro por remetente
    if (senderFilter !== "all" && email.sender !== senderFilter) return false;
    
    // Filtro por status
    if (statusFilter !== "all" && email.status !== statusFilter) return false;
    
    // Filtro por estado
    if (stateFilter !== "all" && email.state !== stateFilter) return false;
    
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        email.sender.toLowerCase().includes(searchLower) ||
        email.subject.toLowerCase().includes(searchLower) ||
        email.content.toLowerCase().includes(searchLower) ||
        (email.receiver && email.receiver.toLowerCase().includes(searchLower)) ||
        (email.city && email.city.toLowerCase().includes(searchLower)) ||
        false
      );
    }
    
    return true;
  });

  // Agrupar por remetente
  const groupedEmails = filteredEmails.reduce((acc, email) => {
    if (!acc[email.sender]) acc[email.sender] = [];
    acc[email.sender].push(email);
    return acc;
  }, {} as Record<string, EmailFromAPI[]>);

  const clearFilters = () => {
    setSearchTerm("");
    setSenderFilter("all");
    setStatusFilter("all");
    setStateFilter("all");
    navigate("/all-emails");
  };

  const getStatusColor = (status: Email["status"]) =>
    ({
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      classified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    }[status] ?? "");

  const getStatusText = (status: Email["status"]) =>
    ({
      pending: "Pendente",
      classified: "Classificado",
      archived: "Arquivado",
      urgent: "Urgente",
    }[status] ?? status);

  const senderKeys = Object.keys(groupedEmails);
  const totalEmails = filteredEmails.length;
  const totalSenders = senderKeys.length;

  // Função para obter a primeira linha do conteúdo
  const getPreviewContent = (content: string) => {
    const lines = content.split('\n');
    const firstLine = lines[0] || '';
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-3 sm:px-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Todos os E-mails</h1>
          {senderFilter !== "all" ? (
            <p className="text-sm sm:text-base text-muted-foreground">
              Mostrando e-mails de <strong className="font-semibold">{senderFilter}</strong>
            </p>
          ) : (
            <p className="text-sm sm:text-base text-muted-foreground">
              {totalEmails} e-mails de {totalSenders} remetentes
            </p>
          )}
        </div>

        {(senderFilter !== "all" || searchTerm || statusFilter !== "all" || stateFilter !== "all") && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-1" /> Limpar filtros
          </Button>
        )}
      </div>

      {/* BARRA DE BUSCA E FILTROS */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="h-4 w-4 sm:h-5 sm:w-5" /> Buscar e-mails
            </CardTitle>
            
            {/* BOTÃO FILTROS MOBILE */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros {showMobileFilters ? "▲" : "▼"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          {/* BARRA DE BUSCA */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar por conteúdo</label>
            <Input
              placeholder="Digite remetente, assunto ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>

          {/* FILTROS - DESKTOP */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="classified">Classificados</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                  <SelectItem value="urgent">Urgentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  {estadosBrasil.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remetente específico</label>
              <Input
                placeholder="Filtrar por remetente"
                value={senderFilter === "all" ? "" : senderFilter}
                onChange={(e) => setSenderFilter(e.target.value || "all")}
                className="w-full"
              />
            </div>
          </div>

          {/* FILTROS - MOBILE (Expandable) */}
          {showMobileFilters && (
            <div className="sm:hidden space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="classified">Classificados</SelectItem>
                    <SelectItem value="archived">Arquivados</SelectItem>
                    <SelectItem value="urgent">Urgentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    {estadosBrasil.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Remetente</label>
                <Input
                  placeholder="Filtrar por remetente"
                  value={senderFilter === "all" ? "" : senderFilter}
                  onChange={(e) => setSenderFilter(e.target.value || "all")}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* RESUMO DOS FILTROS */}
          <div className="flex flex-wrap gap-2 pt-2">
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Status: {getStatusText(statusFilter as Email["status"])}
              </Badge>
            )}
            {stateFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Estado: {stateFilter}
              </Badge>
            )}
            {senderFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Remetente: {senderFilter.length > 20 ? senderFilter.substring(0, 20) + '...' : senderFilter}
              </Badge>
            )}
            {searchTerm && (
              <Badge variant="secondary" className="text-xs">
                Busca: "{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RESULTADOS */}
      {senderKeys.length === 0 ? (
        <Card>
          <CardContent className="py-10 sm:py-16 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum e-mail encontrado</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              {searchTerm || statusFilter !== "all" || stateFilter !== "all" || senderFilter !== "all"
                ? "Tente ajustar os filtros para ver mais resultados."
                : "Nenhum e-mail disponível no momento."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* INFO BAR */}
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
              {totalEmails} e-mail{totalEmails !== 1 ? 's' : ''} • {totalSenders} remetente{totalSenders !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-muted-foreground">
              Mostrando até 3 e-mails por remetente
            </p>
          </div>

          {/* LISTA DE REMETENTES */}
          {senderKeys.map((sender) => (
            <Card key={sender} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="p-4 sm:p-6 bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg font-semibold truncate">
                      {sender}
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {groupedEmails[sender].length} e-mail{groupedEmails[sender].length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/sender-emails?sender=${encodeURIComponent(sender)}`)}
                    className="w-full sm:w-auto"
                  >
                    Ver todos ({groupedEmails[sender].length})
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-3">
                {groupedEmails[sender].slice(0, 3).map((email) => (
                  <div 
                    key={email.id} 
                    className="border rounded-lg p-3 sm:p-4 hover:bg-accent/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/email/${email.id}`)}
                  >
                    <div className="flex flex-col gap-2">
                      {/* CABEÇALHO DO EMAIL */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h3 className="font-medium text-sm sm:text-base line-clamp-2">
                          {email.subject}
                        </h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={`text-xs ${getStatusColor(email.status)}`}>
                            {getStatusText(email.status)}
                          </Badge>
                          {email.category && (
                            <Badge variant="outline" className="text-xs">
                              {email.category}
                            </Badge>
                          )}
                          {email.state && (
                            <Badge variant="outline" className="text-xs">
                              {email.state}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* METADADOS */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                        {email.receiver && (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Para:</span>
                              <span className="truncate">{email.receiver}</span>
                            </div>
                            <div className="hidden sm:block">•</div>
                          </>
                        )}
                        <div>
                          {new Date(email.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        {email.city && (
                          <>
                            <div className="hidden sm:block">•</div>
                            <div>{email.city}</div>
                          </>
                        )}
                      </div>

                      {/* PRÉVIA DO CONTEÚDO */}
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                        {getPreviewContent(email.content)}
                      </p>

                      {/* BOTÃO VER EMAIL (MOBILE) */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/email/${email.id}`);
                        }}
                        className="self-start text-xs sm:text-sm mt-2 sm:hidden"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Ver e-mail completo
                      </Button>
                    </div>
                  </div>
                ))}

                {/* MENSAGEM DE EMAILS ADICIONAIS */}
                {groupedEmails[sender].length > 3 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                      +{groupedEmails[sender].length - 3} e-mail{groupedEmails[sender].length - 3 !== 1 ? 's' : ''} adicional{groupedEmails[sender].length - 3 !== 1 ? 'es' : ''}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* BOTÃO VOLTAR AO TOPO PARA MOBILE */}
      {senderKeys.length > 2 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 sm:hidden z-50 shadow-lg"
        >
          ↑ Topo
        </Button>
      )}
    </div>
  );
}