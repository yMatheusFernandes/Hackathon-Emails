import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  ArrowLeft,
  Trash2,
  Edit,
  Save,
  X,
  Calendar,
  User,
  MapPin,
  Tag,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { deleteEmailAPI, fetchEmailById } from "@/services/api";

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

// ✅ IMPORTANDO AS CONSTANTES CENTRALIZADAS
import type { Email } from "@/lib/emailStorage";
import { BRAZILIAN_STATES, EMAIL_CATEGORIES } from "@/lib/emailStorage";

export default function EmailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [editForm, setEditForm] = useState({
    subject: "",
    category: "",
    state: "",
    tags: "",
    content: "",
  });

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
          status: e.classificado === true ? "classified" : "pending",
          state: e.estado ?? "",
          category: e.categoria ?? "",
          priority: e.priority ?? "medium",
          tags: Array.isArray(e.tags) ? e.tags : (e.tags ? [e.tags] : []),
        };

        setEmail(normalized);
        
        // Inicializar formulário de edição
        setEditForm({
          subject: normalized.subject,
          category: normalized.category || "",
          state: normalized.state || "",
          tags: normalized.tags.join(", "),
          content: normalized.content,
        });
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

  const handleReclassify = async () => {
    if (!email || !id) return;
    
    setIsReclassifying(true);

    try {
      // Primeiro: Atualizar localmente para feedback imediato
      const originalEmail = { ...email };
      
      // Atualizar status localmente
      setEmail({
        ...email,
        status: "pending",
        category: "",
      });

      // Tentar enviar para a API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Tentar diferentes endpoints e formatos
      const endpoints = [
        `${apiUrl}/api/emails/${id}`,
        `${apiUrl}/api/emails/${id}/status`,
        `${apiUrl}/emails/${id}`,
      ];
      
      const payloads = [
        { classificado: false, categoria: null },
        { status: 'pending', category: '' },
        { classified: false, category: null },
      ];
      
      let success = false;
      
      for (let i = 0; i < endpoints.length; i++) {
        try {
          console.log(`Tentando endpoint: ${endpoints[i]}`);
          const response = await fetch(endpoints[i], {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payloads[i]),
          });
          
          if (response.ok) {
            success = true;
            console.log(`Sucesso com endpoint ${i}`);
            break;
          }
        } catch (error) {
          console.log(`Endpoint ${i} falhou, tentando próximo...`);
          continue;
        }
      }
      
      // Se PUT não funcionar, tentar PATCH
      if (!success) {
        try {
          const response = await fetch(`${apiUrl}/api/emails/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ classificado: false }),
          });
          
          if (response.ok) {
            success = true;
          }
        } catch (error) {
          console.log('PATCH também falhou');
        }
      }

      toast({
        title: success ? "✓ E-mail enviado para Pendentes" : "⚠ E-mail movido (localmente)",
        description: success 
          ? `"${email.subject}" foi removido do histórico e agora aparece como pendente.`
          : `"${email.subject}" foi movido localmente. Os dados podem não estar sincronizados com o servidor.`,
        variant: success ? "default" : "destructive", // ✅ CORRIGIDO: "warning" → "destructive"
        duration: 4000,
      });

      // Redirecionar para a página de pendentes após um breve delay
      setTimeout(() => {
        navigate("/pending");
      }, 1500);

    } catch (err) {
      console.error('Erro completo:', err);
      
      // Reverter mudanças locais em caso de erro
      if (email) {
        setEmail({ ...email });
      }
      
      toast({
        title: "Erro ao reclassificar",
        description: "Não foi possível enviar o e-mail para pendentes. Por favor, tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsReclassifying(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!email || !id) return;

    try {
      // Preparar dados para atualização
      const updatedData = {
        assunto: editForm.subject,
        categoria: editForm.category || null,
        estado: editForm.state || null,
        tags: editForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
        classificado: email.status === "classified", // Manter o status atual
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/emails/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar e-mail');
      }

      const result = await response.json();

      // Atualizar email localmente
      setEmail({
        ...email,
        subject: editForm.subject,
        category: editForm.category || "",
        state: editForm.state || "",
        tags: editForm.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
        content: editForm.content,
      });

      toast({
        title: "E-mail atualizado",
        description: "As alterações foram salvas com sucesso.",
        variant: "default",
      });

      setIsEditing(false);
    } catch (err) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    if (email) {
      setEditForm({
        subject: email.subject,
        category: email.category || "",
        state: email.state || "",
        tags: email.tags.join(", "),
        content: email.content,
      });
    }
    setIsEditing(false);
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    classified: "Classificado",
    archived: "Arquivado",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "classified": return "bg-green-600/20 text-green-700";
      case "pending": return "bg-yellow-600/20 text-yellow-700";
      case "archived": return "bg-gray-600/20 text-gray-700";
      default: return "bg-gray-600/20 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-center">Carregando e-mail...</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4">
        <Mail className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground text-center">E-mail não encontrado.</p>
        <Button onClick={() => navigate("/all-emails")} variant="outline">
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-4 sm:px-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="h-9 w-9 sm:h-10 sm:w-10 p-0"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Detalhes do E-mail
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              ID: {email.id}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {!isEditing ? (
            <>
              {email.status === "classified" && (
                <Button 
                  variant="outline" 
                  onClick={handleReclassify}
                  size="sm"
                  disabled={isReclassifying}
                  className="w-full sm:w-auto bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 disabled:opacity-50"
                >
                  {isReclassifying ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      <span className="text-xs sm:text-sm">Processando...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm">Enviar para Pendentes</span>
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Editar</span>
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                size="sm"
                className="w-full sm:w-auto"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Cancelar</span>
              </Button>
              <Button 
                onClick={handleSaveEdit}
                size="sm"
                className="w-full sm:w-auto"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Salvar</span>
              </Button>
            </>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Excluir</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg sm:text-xl">Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription className="text-sm sm:text-base">
                  Tem certeza que deseja excluir este e-mail? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-destructive text-destructive-foreground w-full sm:w-auto order-1 sm:order-2"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* CARD PRINCIPAL */}
      <Card className="mb-6">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            {isEditing ? "Editar E-mail" : "Visualizar E-mail"}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* ASSUNTO */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">Assunto</Label>
            {isEditing ? (
              <Input
                id="subject"
                value={editForm.subject}
                onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                className="text-sm sm:text-base"
              />
            ) : (
              <p className="text-base sm:text-lg font-semibold">{email.subject}</p>
            )}
          </div>

          {/* REMETENTE E DESTINATÁRIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                Remetente
              </div>
              <p className="text-sm sm:text-base">{email.sender}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                Destinatário
              </div>
              <p className="text-sm sm:text-base">{email.recipient}</p>
            </div>
          </div>

          {/* DATA */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              Data e Hora
            </div>
            <p className="text-sm sm:text-base">
              {new Date(email.date).toLocaleString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          {/* CATEGORIA E ESTADO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                Categoria
              </div>
              {isEditing ? (
                <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {/* ✅ USANDO EMAIL_CATEGORIES CENTRALIZADA */}
                    {EMAIL_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={email.category ? "default" : "outline"} className="text-xs sm:text-sm">
                  {email.category || "Sem categoria"}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                Estado
              </div>
              {isEditing ? (
                <Select value={editForm.state} onValueChange={(value) => setEditForm({...editForm, state: value})}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {/* ✅ USANDO BRAZILIAN_STATES CENTRALIZADA */}
                    {BRAZILIAN_STATES.map(state => (
                      <SelectItem key={state.code} value={state.code}>
                        {state.code} - {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={email.state ? "default" : "outline"} className="text-xs sm:text-sm">
                  {email.state || "Não especificado"}
                </Badge>
              )}
            </div>
          </div>

          {/* TAGS */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
              Tags
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editForm.tags}
                  onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                  placeholder="Separe as tags por vírgula (ex: importante, trabalho, cliente)"
                  className="text-sm sm:text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Exemplo: importante, trabalho, cliente
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {email.tags && email.tags.length > 0 ? (
                  email.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Nenhuma tag</span>
                )}
              </div>
            )}
          </div>

          {/* STATUS */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <Badge 
              className={`text-xs sm:text-sm ${getStatusColor(email.status)}`}
            >
              {statusLabels[email.status] || email.status}
            </Badge>
          </div>

          {/* CONTEÚDO */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">Conteúdo</Label>
            {isEditing ? (
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                className="min-h-[200px] text-sm sm:text-base"
                placeholder="Digite o conteúdo do e-mail..."
              />
            ) : (
              <Card className="bg-secondary/30">
                <CardContent className="p-3 sm:p-4">
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                    {email.content}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BOTÕES INFERIORES PARA MOBILE */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 sm:hidden z-50">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelEdit}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}