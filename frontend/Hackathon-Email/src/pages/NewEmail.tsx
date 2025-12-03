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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const estadosBrasil = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO"
];

export default function NewEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subject: "",
    sender: "",
    recipient: "voce@empresa.com",
    content: "",
    state: "", // campo obrigatório adicionado
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.sender || !formData.content || !formData.state) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios, incluindo o Estado.",
        variant: "destructive",
      });
      return;
    }

    const newEmail = addEmail({
      ...formData,
      status: "pending",
      tags: [],
      priority: "medium",
      category: undefined,
    });

    toast({
      title: "E-mail cadastrado!",
      description: "Ele está em Pendentes aguardando análise.",
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
        <p className="text-muted-foreground">Cadastre um novo e-mail no sistema</p>
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
              <Input
                placeholder="Assunto"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Remetente *</Label>
              <Input
                type="email"
                placeholder="remetente@email.com"
                value={formData.sender}
                onChange={(e) => handleChange("sender", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Destinatário</Label>
              <Input
                type="email"
                value={formData.recipient}
                onChange={(e) => handleChange("recipient", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Estado (UF) *</Label>
              <Select onValueChange={(v) => handleChange("state", v)} value={formData.state}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadosBrasil.map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Conteúdo *</Label>
              <Textarea
                placeholder="Digite o conteúdo..."
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                rows={8}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Cadastrar
              </Button>

              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
