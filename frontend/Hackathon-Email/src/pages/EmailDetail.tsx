import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowLeft, Trash2 } from "lucide-react";
import { deleteEmailAPI } from "@/services/api";

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

// AGORA usa API real
import { fetchEmailById } from "@/services/api";

import type { Email } from "@/lib/emailStorage";

export default function EmailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadEmail = async () => {
      try {
        setLoading(true);

        const response = await fetchEmailById(id);

        if (!response) {
          toast({
            title: "E-mail não encontrado",
            description: "Esse e-mail não existe no servidor.",
            variant: "destructive",
          });
          navigate("/history");
          return;
        }

        const e = response;

        // Normalização para o formato Email
        const normalized: Email = {
          id: e.id,
          subject: e.assunto ?? e.subject ?? "",
          sender: e.remetente ?? e.sender ?? "",
          recipient: e.destinatario ?? e.receiver ?? "",
          content: e.corpo ?? e.content ?? "",
          date: e.data ?? e.date ?? new Date().toISOString(),
          status:
            e.classificado === true || e.status === "classified"
              ? "classified"
              : "pending",
          state: e.estado ?? null,
          city: e.municipio ?? null,
          category: e.categoria ?? "",
          tags: e.tags ?? []
        };

        setEmail(normalized);
      } catch (error) {
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar o e-mail.",
          variant: "destructive",
        });
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };

    loadEmail();
  }, [id, navigate, toast]);

  // 🔥 Removemos delete e reclassify locais (não existem na API)
const handleDelete = async () => {
  if (!id) return;

  try {
    const result = await deleteEmailAPI(id);

    toast({
      title: "E-mail excluído",
      description: "O e-mail foi removido do sistema.",
      variant: "default",
    });

    navigate("/all-emails");

  } catch (err) {
    toast({
      title: "Erro ao excluir",
      description: "Não foi possível excluir o e-mail no servidor.",
      variant: "destructive",
    });
  }
};


  const handleReclassify = () => {
    toast({
      title: "⚠ Função desativada",
      description: "A reclassificação deve ser feita na página de Pendentes.",
      variant: "default",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando e-mail...</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">E-mail não encontrado.</p>
      </div>
    );
  }

  const statusLabels = {
    pending: "Pendente",
    classified: "Classificado",
    archived: "Arquivado",
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
