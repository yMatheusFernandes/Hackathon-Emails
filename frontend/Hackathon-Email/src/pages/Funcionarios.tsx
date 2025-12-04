import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Edit, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  status: "ativo" | "inativo";
}

// Mock data inicial - pronto para integração com backend
const initialFuncionarios: Funcionario[] = [
  { id: "1", nome: "João Silva", email: "joao@emailhub.com", cargo: "Analista", status: "ativo" },
  { id: "2", nome: "Maria Santos", email: "maria@emailhub.com", cargo: "Gerente", status: "ativo" },
  { id: "3", nome: "Pedro Costa", email: "pedro@emailhub.com", cargo: "Assistente", status: "inativo" },
];

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(initialFuncionarios);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cargo: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({ nome: "", email: "", cargo: "" });
    setEditingId(null);
  };

  const handleOpenDialog = (funcionario?: Funcionario) => {
    if (funcionario) {
      setEditingId(funcionario.id);
      setFormData({
        nome: funcionario.nome,
        email: funcionario.email,
        cargo: funcionario.cargo,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim() || !formData.cargo.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      setFuncionarios(prev =>
        prev.map(f =>
          f.id === editingId
            ? { ...f, ...formData }
            : f
        )
      );
      toast({
        title: "Funcionário atualizado",
        description: `${formData.nome} foi atualizado com sucesso.`,
      });
    } else {
      const newFuncionario: Funcionario = {
        id: Date.now().toString(),
        ...formData,
        status: "ativo",
      };
      setFuncionarios(prev => [...prev, newFuncionario]);
      toast({
        title: "Funcionário cadastrado",
        description: `${formData.nome} foi cadastrado com sucesso.`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    const funcionario = funcionarios.find(f => f.id === id);
    setFuncionarios(prev => prev.filter(f => f.id !== id));
    toast({
      title: "Funcionário removido",
      description: `${funcionario?.nome} foi removido do sistema.`,
    });
  };

  const toggleStatus = (id: string) => {
    setFuncionarios(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, status: f.status === "ativo" ? "inativo" : "ativo" }
          : f
      )
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/login")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Funcionários
              </h1>
              <p className="text-muted-foreground">Gerencie os funcionários do sistema</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
                <DialogDescription>
                  {editingId 
                    ? "Atualize as informações do funcionário." 
                    : "Preencha os dados para cadastrar um novo funcionário."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Digite o e-mail"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                    placeholder="Digite o cargo"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? "Salvar alterações" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Funcionários</CardTitle>
            <CardDescription>
              {funcionarios.length} funcionário(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {funcionarios.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum funcionário cadastrado</p>
                <p className="text-sm">Clique em "Novo Funcionário" para começar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">{funcionario.nome}</TableCell>
                      <TableCell>{funcionario.email}</TableCell>
                      <TableCell>{funcionario.cargo}</TableCell>
                      <TableCell>
                        <Badge
                          variant={funcionario.status === "ativo" ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(funcionario.id)}
                        >
                          {funcionario.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(funcionario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(funcionario.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
