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

const estadosBrasil = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO"
];

export default function History() {
  const navigate = useNavigate();
  const query = useQuery();
  const location = useLocation();

  const urlStatus = query.get("status") ?? "all";
  const urlCategory = query.get("category") ?? "all";
  const urlSearch = query.get("search") ?? "";
  const urlState = query.get("state") ?? "all";
  const urlSort = query.get("sort") ?? "newest";

  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(urlStatus);
  const [categoryFilter, setCategoryFilter] = useState(urlCategory);
  const [stateFilter, setStateFilter] = useState(urlState);
  const [sortOption, setSortOption] = useState(urlSort);

  useEffect(() => {
    const all = getEmails();
    setEmails(all);
    setSearchTerm(urlSearch);
    setStatusFilter(urlStatus);
    setCategoryFilter(urlCategory);
    setStateFilter(urlState);
    setSortOption(urlSort);
  }, [location.search]);

  useEffect(() => {
    let filtered = emails.filter(e => e.status !== "pending");

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") filtered = filtered.filter(e => e.status === statusFilter);
    if (categoryFilter !== "all") filtered = filtered.filter(e => e.category?.toLowerCase() === categoryFilter.toLowerCase());
    if (stateFilter !== "all") filtered = filtered.filter(e => e.state === stateFilter);

    filtered.sort((a, b) =>
      sortOption === "newest"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setFilteredEmails(filtered);
  }, [emails, searchTerm, statusFilter, categoryFilter, stateFilter, sortOption]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setStateFilter("all");
    setSortOption("newest");
    navigate("/history");
  };

  const getStatusColor = (status: Email['status']) => ( {
    classified: 'bg-green-600/20 text-green-700',
    archived: 'bg-muted text-muted-foreground',
  }[status] ?? "");

  const categoriesBase = ["Trabalho", "Pessoal", "Financeiro", "Suporte", "Marketing"];
  const categories = Array.from(new Set([...categoriesBase, ...emails.map(e => e.category).filter(Boolean)]));

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    stateFilter !== "all" ||
    searchTerm !== "" ||
    sortOption !== "newest";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Histórico de E-mails</h1>
          <p className="text-muted-foreground">E-mails já classificados ou arquivados</p>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1"/> Limpar filtros
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input
              placeholder="Buscar por assunto, remetente ou conteúdo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
           

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Categoria"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger><SelectValue placeholder="Estado"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {estadosBrasil.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
              </SelectContent>
            </Select>
{/* <label className="text-xs text-muted-foreground">Ordenar por</label>*/}
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais recentes primeiro</SelectItem>
                <SelectItem value="oldest">Mais antigos primeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
           
          </div>

          <p className="text-sm text-muted-foreground">
            Mostrando {filteredEmails.length} e-mails
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredEmails.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum e-mail encontrado</CardContent></Card>
        ) : (
          filteredEmails.map(email => (
            <Card key={email.id} className="hover:shadow-md transition">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{email.subject}</h3>
                  <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                  {email.category && <Badge variant="outline">{email.category}</Badge>}
                  {email.state && <Badge variant="outline">{email.state}</Badge>}
                </div>

                <p className="text-sm text-muted-foreground">
                  De: <span className="font-medium">{email.sender}</span> •{" "}
                  {new Date(email.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>

                <Button size="sm" variant="outline" onClick={() => navigate(`/email/${email.id}`)}>
                  <Eye className="h-4 w-4 mr-1"/> Ver
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
