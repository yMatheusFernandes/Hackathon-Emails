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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Edit, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getFuncionarios } from "@/services/api";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      } catch (err) {
        console.error("Erro ao carregar funcionários:", err);
      }
    }

    load();
  }, []);

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
        description: `${formData.nome} foi atualizado.`,
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
        description: `${formData.nome} foi adicionado.`,
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
  };

  const toggleStatus = (id: string) => {
    setFuncionarios((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: !f.status } : f))
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                Funcionários
              </h1>
              <p className="text-muted-foreground">
                Gerencie os funcionários do sistema
              </p>
            </div>
          </div>

          {/* Botão novo funcionário */}
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
                    ? "Atualize os dados do funcionário."
                    : "Preencha os campos para cadastrar um funcionário."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, nome: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="total_emails">Total de e-mails</Label>
                  <Input
                    id="total_emails"
                    value={formData.total_emails}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_emails: e.target.value,
                      }))
                    }
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
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

        {/* Lista */}
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
                <p>Nenhum funcionário encontrado</p>
              </div>
            ) : (
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
                  {funcionarios.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.nome}</TableCell>
                      <TableCell>{f.email}</TableCell>
                      <TableCell>{f.total_emails}</TableCell>

                      <TableCell>
                        <Badge variant={f.status ? "true" : "secondary"}>
                          {f.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenDialog(f)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(f.id)}
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
