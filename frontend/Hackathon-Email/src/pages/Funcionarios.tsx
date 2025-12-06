import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  User, 
  Users, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  Power,
  PowerOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getFuncionarios } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  total_emails: number;
  status: boolean;
}

// Normaliza o retorno do backend para garantir tipos corretos
function normalizeFuncionario(raw: any): Funcionario {
  return {
    id: raw.id?.toString() ?? "",
    nome: raw.nome ?? "",
    email: raw.email ?? "",
    total_emails: Number(raw.total_emails) || 0,
    status: raw.ativo,
  };
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [filteredFuncionarios, setFilteredFuncionarios] = useState<Funcionario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showMobileMenu, setShowMobileMenu] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    total_emails: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  // Carrega funcionários do backend
  useEffect(() => {
    async function load() {
      try {
        const response = await getFuncionarios();
        console.log("RAW FUNCIONARIOS:", response);

        const lista = Array.isArray(response)
          ? response.map(normalizeFuncionario)
          : Array.isArray(response.data)
          ? response.data.map(normalizeFuncionario)
          : [];

        setFuncionarios(lista);
        setFilteredFuncionarios(lista);
      } catch (err) {
        console.error("Erro ao carregar funcionários:", err);
      }
    }

    load();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...funcionarios];

    // Filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.nome.toLowerCase().includes(term) || 
        f.email.toLowerCase().includes(term)
      );
    }

    // Filtro por status
    if (statusFilter !== "all") {
      const active = statusFilter === "active";
      filtered = filtered.filter(f => f.status === active);
    }

    setFilteredFuncionarios(filtered);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  }, [searchTerm, statusFilter, funcionarios]);

  const resetForm = () => {
    setFormData({ nome: "", email: "", total_emails: "" });
    setEditingId(null);
  };

  const handleOpenDialog = (funcionario?: Funcionario) => {
    if (funcionario) {
      setEditingId(funcionario.id);
      setFormData({
        nome: funcionario.nome,
        email: funcionario.email,
        total_emails: funcionario.total_emails.toString(),
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nome.trim() ||
      !formData.email.trim() ||
      !formData.total_emails.trim()
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      // Atualizar funcionário existente
      setFuncionarios((prev) =>
        prev.map((f) =>
          f.id === editingId
            ? {
                ...f,
                nome: formData.nome,
                email: formData.email,
                total_emails: Number(formData.total_emails),
              }
            : f
        )
      );

      toast({ 
        title: "Funcionário atualizado", 
        description: `${formData.nome} foi atualizado com sucesso.` 
      });
    } else {
      // Criar novo funcionário
      const newFuncionario: Funcionario = {
        id: Date.now().toString(),
        nome: formData.nome,
        email: formData.email,
        total_emails: Number(formData.total_emails),
        status: true,
      };

      setFuncionarios((prev) => [...prev, newFuncionario]);

      toast({ 
        title: "Funcionário cadastrado", 
        description: `${formData.nome} foi adicionado com sucesso.` 
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const funcionario = funcionarios.find((f) => f.id === id);
    setFuncionarios((prev) => prev.filter((f) => f.id !== id));

    toast({
      title: "Funcionário removido",
      description: `${funcionario?.nome} foi removido do sistema.`,
    });
    setShowMobileMenu(null);
  };

  // FUNÇÃO CORRIGIDA: Agora altera apenas o funcionário específico
  const toggleStatus = (id: string) => {
    setFuncionarios((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newStatus = !f.status;
          return { ...f, status: newStatus };
        }
        return f; // Retorna os outros funcionários SEM alteração
      })
    );
    
    // Adiciona toast apenas uma vez
    const funcionario = funcionarios.find((f) => f.id === id);
    if (funcionario) {
      toast({
        title: !funcionario.status ? "Funcionário ativado" : "Funcionário desativado",
        description: `${funcionario.nome} foi ${!funcionario.status ? 'ativado' : 'desativado'} com sucesso.`,
      });
    }
    
    setShowMobileMenu(null);
  };

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFuncionarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFuncionarios.length / itemsPerPage);

  // Função para formatar e-mail
  const formatEmail = (email: string) => {
    if (window.innerWidth < 640) {
      const parts = email.split('@');
      if (parts[0].length > 10) {
        return parts[0].substring(0, 8) + '...@' + parts[1];
      }
    }
    return email;
  };

  // Função para formatar nome
  const formatName = (name: string) => {
    if (window.innerWidth < 640 && name.length > 15) {
      return name.substring(0, 12) + '...';
    }
    return name;
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate("/dashboard")}
              className="h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
                Funcionários
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Gerencie os funcionários do sistema
              </p>
            </div>
          </div>

          {/* Botão novo funcionário */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => handleOpenDialog()}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Novo Funcionário</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-[95vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">
                  {editingId ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  {editingId
                    ? "Atualize os dados do funcionário."
                    : "Preencha os campos para cadastrar um funcionário."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="nome" className="text-sm sm:text-base">Nome completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm sm:text-base">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="total_emails" className="text-sm sm:text-base">Total de e-mails</Label>
                  <Input
                    id="total_emails"
                    type="number"
                    min="0"
                    value={formData.total_emails}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_emails: e.target.value }))}
                    className="text-sm sm:text-base"
                  />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {editingId ? "Salvar alterações" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                Buscar Funcionários
              </CardTitle>
              
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
            {/* Barra de busca */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nome ou E-mail</Label>
              <Input
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm sm:text-base"
              />
            </div>

            {/* Filtros - Desktop */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros - Mobile */}
            {showMobileFilters && (
              <div className="sm:hidden space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Resumo dos filtros */}
            <div className="flex flex-wrap gap-2 pt-2">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Busca: "{searchTerm}"
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Status: {statusFilter === "active" ? "Ativos" : "Inativos"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Funcionários */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Lista de Funcionários</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {filteredFuncionarios.length} funcionário(s) encontrado(s)
              {searchTerm && ` para "${searchTerm}"`}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-2 sm:p-6">
            {filteredFuncionarios.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <User className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">Nenhum funcionário encontrado</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros para ver mais resultados." 
                    : "Cadastre um novo funcionário para começar."}
                </p>
              </div>
            ) : (
              <>
                {/* Tabela Desktop */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Total de e-mails</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {currentItems.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {f.nome}
                            </div>
                          </TableCell>
                          <TableCell>{f.email}</TableCell>
                          <TableCell>{f.total_emails}</TableCell>
                          <TableCell>
                            <Badge
                              variant={f.status ? "default" : "secondary"}
                              className={f.status ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                            >
                              {f.status ? (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Ativo
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Inativo
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* Botão Ativar/Desativar - Desktop */}
                              <Button
                                variant={f.status ? "outline" : "default"}
                                size="sm"
                                onClick={() => toggleStatus(f.id)}
                                className={`h-8 px-3 ${
                                  f.status 
                                    ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" 
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                              >
                                {f.status ? (
                                  <>
                                    <PowerOff className="h-3 w-3 mr-1" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-3 w-3 mr-1" />
                                    Ativar
                                  </>
                                )}
                              </Button>
                              
                              {/* Botão Editar - Desktop */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(f)}
                                className="h-8 w-8"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              
                              {/* Botão Excluir - Desktop */}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(f.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Lista Mobile */}
                <div className="sm:hidden space-y-3">
                  {currentItems.map((f) => (
                    <Card key={f.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-medium text-sm truncate">
                              {formatName(f.nome)}
                            </h3>
                            <Badge
                              variant={f.status ? "default" : "secondary"}
                              className={`text-xs ${f.status ? 'bg-green-100 text-green-800' : ''}`}
                            >
                              {f.status ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-2">
                            {formatEmail(f.email)}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="font-medium">{f.total_emails} e-mails</span>
                          </div>
                        </div>
                        
                        {/* Menu Mobile */}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMobileMenu(showMobileMenu === f.id ? null : f.id)}
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                          
                          {showMobileMenu === f.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-md shadow-lg z-50">
                              {/* Botão Ativar/Desativar - Mobile */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStatus(f.id)}
                                className={`w-full justify-start text-xs ${
                                  f.status 
                                    ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                                    : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                }`}
                              >
                                {f.status ? (
                                  <>
                                    <PowerOff className="h-3 w-3 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-3 w-3 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </Button>
                              
                              {/* Botão Editar - Mobile */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  handleOpenDialog(f);
                                  setShowMobileMenu(null);
                                }}
                                className="w-full justify-start text-xs"
                              >
                                <Edit className="h-3 w-3 mr-2" />
                                Editar
                              </Button>
                              
                              {/* Botão Excluir - Mobile */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(f.id)}
                                className="w-full justify-start text-xs text-destructive hover:text-destructive hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Excluir
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Botões de ação rápida - Mobile (opcional) */}
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button
                          variant={f.status ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleStatus(f.id)}
                          className={`flex-1 text-xs ${
                            f.status 
                              ? "border-red-200 text-red-600 hover:bg-red-50" 
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {f.status ? (
                            <>
                              <PowerOff className="h-3 w-3 mr-1" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Power className="h-3 w-3 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(f)}
                          className="flex-1 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 sm:mt-6 pt-4 border-t">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages} • {filteredFuncionarios.length} funcionários
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <div className="flex items-center px-2 sm:px-3 text-xs sm:text-sm">
                        {currentPage} / {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 sm:h-9 sm:w-9"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Botão Voltar ao Topo Mobile */}
      {filteredFuncionarios.length > 3 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 sm:hidden z-50 shadow-lg h-10 w-10 rounded-full"
        >
          ↑
        </Button>
      )}
    </div>
  );
}