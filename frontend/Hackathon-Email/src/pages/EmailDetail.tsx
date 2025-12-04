import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowLeft, Trash2 } from "lucide-react";
import { getEmailById, deleteEmail, updateEmail, type Email } from "@/lib/emailStorage";
import { useToast } from "@/hooks/use-toast";
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

  useEffect(() => {
    if (id) {
      const foundEmail = getEmailById(id);
      if (foundEmail) {
        setEmail(foundEmail);
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
              Visualizar E-mail
            </CardTitle>
            <div className="flex gap-2">
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          
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
            {email.state && <Badge variant="outline">{email.state}</Badge>}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Conteúdo</h3>
            <Card className="bg-secondary/30">
              <CardContent className="p-4">
                <p className="whitespace-pre-wrap">{email.content}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
