import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmailById, updateEmail, deleteEmail, type Email } from "@/lib/emailStorage";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EmailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState<Email | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    sender: "",
    recipient: "",
    content: "",
    status: "pending" as Email['status'],
    priority: "medium" as Email['priority'],
    category: "",
  });

  useEffect(() => {
    if (id) {
      const foundEmail = getEmailById(id);
      if (foundEmail) {
        setEmail(foundEmail);
        setFormData({
          subject: foundEmail.subject,
          sender: foundEmail.sender,
          recipient: foundEmail.recipient,
          content: foundEmail.content,
          status: foundEmail.status,
          priority: foundEmail.priority,
          category: foundEmail.category || "",
        });
      } else {
        toast({
          title: "E-mail não encontrado",
          description: "O e-mail solicitado não existe.",
          variant: "destructive",
        });
        navigate("/history");
      }
    }
  }, [id, navigate, toast]);

  const handleSave = () => {
    if (!id) return;

    const updated = updateEmail(id, {
      subject: formData.subject,
      sender: formData.sender,
      recipient: formData.recipient,
      content: formData.content,
      status: formData.status,
      priority: formData.priority,
      category: formData.category || undefined,
    });

    if (updated) {
      setEmail(updated);
      setIsEditing(false);
      toast({
        title: "E-mail atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    }
  };

  const handleDelete = () => {
    if (!id) return;

    const success = deleteEmail(id);
    if (success) {
      toast({
        title: "E-mail excluído",
        description: "O e-mail foi removido do sistema.",
      });
      navigate("/history");
    }
  };

  const handleReclassify = () => {
    if (!id || !email) return;

    const updated = updateEmail(id, {
      subject: email.subject,
      sender: email.sender,
      recipient: email.recipient,
      content: email.content,
      status: "pending",
      priority: "medium",
      category: undefined,
    });

    if (updated) {
      setEmail(updated);
      toast({
        title: "Classificação removida",
        description: "O e-mail voltou para Pendentes para ser reclassificado.",
      });
      navigate("/pending");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const statusLabels = {
    pending: 'Pendente',
    classified: 'Classificado',
    archived: 'Arquivado',
  };

  const priorityLabels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Detalhes do E-mail</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {isEditing ? "Editar E-mail" : "Visualizar E-mail"}
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)}>Editar</Button>

                  <Button variant="secondary" onClick={handleReclassify}>
                    Editar Classificação
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este e-mail? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Salvar</span>
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          
          {!isEditing ? (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Assunto</h3>
                <p className="text-lg font-semibold">{email.subject}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Remetente</h3>
                  <p>{email.sender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Destinatário</h3>
                  <p>{email.recipient}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Data</h3>
                <p>
                  {new Date(email.date).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{statusLabels[email.status]}</Badge>
                <Badge variant="outline">{priorityLabels[email.priority]}</Badge>
                {email.category && <Badge variant="outline">{email.category}</Badge>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Conteúdo</h3>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{email.content}</p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender">Remetente</Label>
                  <Input
                    id="sender"
                    type="email"
                    value={formData.sender}
                    onChange={(e) => handleChange('sender', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Destinatário</Label>
                  <Input
                    id="recipient"
                    type="email"
                    value={formData.recipient}
                    onChange={(e) => handleChange('recipient', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={10}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
