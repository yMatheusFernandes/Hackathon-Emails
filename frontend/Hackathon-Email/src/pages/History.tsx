import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Eye, X, MapPin } from "lucide-react";
// ✅ IMPORTANDO AS CONSTANTES CENTRALIZADAS
import { type Email, BRAZILIAN_STATES, EMAIL_CATEGORIES, BRAZILIAN_CITIES_BY_STATE } from "@/lib/emailStorage";
import { fetchEmails } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// 👉 TYPE usado para normalizar os dados da API
type EmailFromAPI = {
  id: string;
  assunto: string;
  remetente: string;
  destinatario: string;
  corpo: string;
  data: string;
  estado: string | null;
  municipio: string | null;
  classificado: boolean;
  categoria: string | null;
};

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const query = useQuery();

  // filtros vindos da URL
  const urlCategory = query.get("category") ?? "all";
  const urlSearch = query.get("search") ?? "";
  const urlState = query.get("state") ?? "all";
  const urlCity = query.get("city") ?? "all";
  const urlSort = query.get("sort") ?? "newest";

  // estados reativos
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [stateFilter, setStateFilter] = useState(urlState);
  const [cityFilter, setCityFilter] = useState(urlCity);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState(urlSort);

  // ============================
  //        CARREGAR DA API
  // ============================
  useEffect(() => {
    const load = async () => {
      try {
        // Sincroniza com a URL
        setSearchTerm(urlSearch);
        setCategoryFilter(urlCategory);
        setStateFilter(urlState);
        setCityFilter(urlCity);
        setSortOption(urlSort);

        // Chama a API
        const response = await fetchEmails();

        // Garantir formato correto
        let apiEmails: any[] = [];

        if (Array.isArray(response)) {
          apiEmails = response;
        } else if (Array.isArray(response.data)) {
          apiEmails = response.data;
        } else {
          apiEmails = [];
          console.warn("Formato inesperado de fetchEmails:", response);
        }

        // Normalizar - INCLUINDO RECIPIENT E MUNICÍPIO
        const normalized: Email[] = apiEmails.map((e: EmailFromAPI) => ({
          id: e.id,
          subject: e.assunto || "",
          sender: e.remetente || "",
          recipient: e.destinatario || "",
          content: e.corpo || "",
          date: e.data || "",
          status: e.classificado ? "classified" : "pending",
          state: e.estado || "",
          city: e.municipio || "", // ✅ Adicionando município
          category: e.categoria || "",
          tags: [],
          priority: "medium",
        }));

        console.log("Emails normalizados (com município):", normalized);

        setEmails(normalized);

      } catch (err) {
        console.error("Erro ao carregar emails (History):", err);
        toast({
          title: "Erro ao carregar e-mails",
          description: "Não foi possível carregar os e-mails da API.",
          variant: "destructive",
        });
      }
    };

    load();
  }, [location.search]);

  // Atualizar cidades disponíveis quando o estado muda
  useEffect(() => {
    if (stateFilter !== "all") {
      const cities = BRAZILIAN_CITIES_BY_STATE[stateFilter] || [];
      setAvailableCities(cities);
      // Se a cidade atual não está na lista do novo estado, resetar para "all"
      if (cityFilter !== "all" && !cities.includes(cityFilter)) {
        setCityFilter("all");
      }
    } else {
      setAvailableCities([]);
      setCityFilter("all");
    }
  }, [stateFilter]);

  // ============================
  //         FILTRAGEM
  // ============================
  useEffect(() => {
    // Mostra apenas emails classificados (status = "classified")
    let filtered = emails.filter(e => e.status === "classified");

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.city && e.city.toLowerCase().includes(searchTerm.toLowerCase())) // Buscar também por município
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(e =>
        e.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    if (stateFilter !== "all") {
      filtered = filtered.filter(e => e.state === stateFilter);
    }

    if (cityFilter !== "all") {
      filtered = filtered.filter(e => e.city === cityFilter);
    }

    // Ordenação
    filtered.sort((a, b) =>
      sortOption === "newest"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setFilteredEmails(filtered);
  }, [emails, searchTerm, categoryFilter, stateFilter, cityFilter, sortOption]);

  // Resetar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStateFilter("all");
    setCityFilter("all");
    setSortOption("newest");
    navigate("/history");
  };

  const getStatusColor = (status: Email["status"]) => ({
    classified: "bg-green-600/20 text-green-700",
    archived: "bg-gray-600/20 text-gray-700",
    urgent: "bg-red-600/20 text-red-700",
    pending: "bg-yellow-600/20 text-yellow-700",
  }[status] ?? "");

  const getStatusText = (status: Email["status"]) => ({
    classified: "Classificado",
    archived: "Arquivado",
    urgent: "Urgente",
    pending: "Pendente",
  }[status] ?? status);

  // ✅ USANDO EMAIL_CATEGORIES CENTRALIZADA
  // Combine categorias da API com as categorias padrão
  const categories = Array.from(new Set([
    ...EMAIL_CATEGORIES,
    ...emails.map(e => e.category).filter(Boolean) as string[],
  ]));

  // Obter todos os municípios únicos dos e-mails filtrados por estado
  const getCitiesForCurrentState = () => {
    if (stateFilter === "all") return [];
    
    const stateEmails = emails.filter(e => e.state === stateFilter && e.status === "classified");
    const uniqueCities = Array.from(new Set(
      stateEmails
        .map(e => e.city)
        .filter(Boolean) as string[]
    ));
    
    return uniqueCities.sort();
  };

  const citiesForFilter = stateFilter !== "all" ? getCitiesForCurrentState() : [];

  const hasActiveFilters =
    categoryFilter !== "all" ||
    stateFilter !== "all" ||
    cityFilter !== "all" ||
    searchTerm !== "" ||
    sortOption !== "newest";

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in px-3 sm:px-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Histórico de E-mails</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            E-mails já classificados por estado e município
          </p>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-1" /> Limpar filtros
          </Button>
        )}
      </div>

      {/* FILTROS */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5" /> Filtros Avançados
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* BARRA DE BUSCA */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por assunto, remetente, destinatário, conteúdo ou município..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>

          {/* FILTROS EM GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Categoria */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {/* ✅ USANDO EMAIL_CATEGORIES CENTRALIZADA */}
                  {categories.map(c => (
                    <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium">Estado</label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os estados</SelectItem>
                  {/* ✅ USANDO BRAZILIAN_STATES CENTRALIZADA */}
                  {BRAZILIAN_STATES.map(state => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.code} - {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Município */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium">Município</label>
              <Select 
                value={cityFilter} 
                onValueChange={setCityFilter}
                disabled={stateFilter === "all"}
              >
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder={
                    stateFilter === "all" 
                      ? "Selecione um estado primeiro" 
                      : "Município"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os municípios</SelectItem>
                  {citiesForFilter.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                  {stateFilter !== "all" && citiesForFilter.length === 0 && (
                    <SelectItem value="all" disabled>
                      Nenhum município encontrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenação */}
            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium">Ordenar por</label>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="text-xs sm:text-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes primeiro</SelectItem>
                  <SelectItem value="oldest">Mais antigos primeiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* RESUMO DOS FILTROS */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categoryFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Categoria: {categoryFilter}
              </Badge>
            )}
            {stateFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Estado: {stateFilter}
              </Badge>
            )}
            {cityFilter !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Município: {cityFilter}
              </Badge>
            )}
            {sortOption !== "newest" && (
              <Badge variant="secondary" className="text-xs">
                Ordenação: {sortOption === "oldest" ? "Mais antigos" : "Personalizada"}
              </Badge>
            )}
          </div>

          {/* CONTAGEM */}
          <p className="text-sm text-muted-foreground pt-2 border-t">
            Mostrando {filteredEmails.length} e-mail{filteredEmails.length !== 1 ? 's' : ''} classificado
            {filteredEmails.length !== 1 ? 's' : ''}
            {stateFilter !== "all" && ` no estado ${stateFilter}`}
            {cityFilter !== "all" && ` no município ${cityFilter}`}
          </p>
        </CardContent>
      </Card>

      {/* LISTA DE E-MAILS */}
      <div className="space-y-3 sm:space-y-4">
        {filteredEmails.length === 0 ? (
          <Card>
            <CardContent className="py-10 sm:py-16 text-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                {searchTerm || categoryFilter !== "all" || stateFilter !== "all" || cityFilter !== "all"
                  ? "Nenhum e-mail encontrado com os filtros atuais"
                  : "Nenhum e-mail classificado no momento"}
              </p>
              {stateFilter === "all" && (
                <p className="text-xs text-muted-foreground mt-2">
                  Dica: Selecione um estado para filtrar por município
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEmails.map(email => (
            <Card key={email.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-3">
                  {/* CABEÇALHO */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg line-clamp-2">
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
                      {email.city && (
                        <Badge variant="secondary" className="text-xs">
                          <MapPin className="h-2 w-2 mr-1" />
                          {email.city}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* METADADOS */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">De:</span>
                      <span className="truncate">{email.sender}</span>
                    </div>
                    <div className="hidden sm:block">•</div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Para:</span>
                      <span className="truncate">{email.recipient}</span>
                    </div>
                    <div className="hidden sm:block">•</div>
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
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{email.city}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* PRÉVIA DO CONTEÚDO */}
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {email.content.length > 150 ? email.content.substring(0, 150) + '...' : email.content}
                  </p>

                  {/* BOTÕES DE AÇÃO */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/email/${email.id}`)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Ver e-mail
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* BOTÃO VOLTAR AO TOPO PARA MOBILE */}
      {filteredEmails.length > 3 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 sm:hidden z-50 shadow-lg"
        >
          ↑ Topo
        </Button>
      )}

      {/* ESTATÍSTICAS */}
      {filteredEmails.length > 0 && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Distribuição por localização:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(() => {
                    const stateCounts = filteredEmails.reduce((acc, email) => {
                      acc[email.state] = (acc[email.state] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);
                    
                    return Object.entries(stateCounts).map(([state, count]) => (
                      <Badge key={state} variant="outline" className="text-xs">
                        {state}: {count}
                      </Badge>
                    ));
                  })()}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Atualizado em {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}