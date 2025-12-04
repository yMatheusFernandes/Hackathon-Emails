import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addEmail } from "@/lib/emailStorage";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send } from "lucide-react";

export default function NewEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: "",
    sender: "",
    recipient: "voce@empresa.com",
    content: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.sender || !formData.content) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newEmail = addEmail({
      ...formData,
      status: "pending",
      category: undefined,
      priority: undefined,
      state: undefined // agora será definido no PENDING
    });

    toast({
      title: "E-mail cadastrado!",
      description: "Foi para Pendentes aguardar classificação.",
    });

    navigate(`/email/${newEmail.id}`);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Novo E-mail</h1>
        <p className="text-muted-foreground">Cadastro básico sem classificação</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Informações do E-mail
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <Label>Assunto *</Label>
              <Input value={formData.subject} onChange={(e)=>handleChange("subject",e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Remetente *</Label>
              <Input value={formData.sender} onChange={(e)=>handleChange("sender",e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Destinatário</Label>
              <Input value={formData.recipient} onChange={(e)=>handleChange("recipient",e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea rows={8} value={formData.content} onChange={(e)=>handleChange("content",e.target.value)} />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Send className="h-4 w-4 mr-2"/> Cadastrar
              </Button>

              <Button variant="outline" onClick={()=>navigate(-1)}>
                Cancelar
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
