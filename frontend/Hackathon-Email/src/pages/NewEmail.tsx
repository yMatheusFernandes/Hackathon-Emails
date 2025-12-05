import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { addEmail } from "@/lib/emailStorage";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, MapPin, Tag, Calendar, User } from "lucide-react";
import { createEmail } from "@/services/api";

// Estados brasileiros
const states = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

// Municípios por estado (exemplo simplificado)
const citiesByState: Record<string, string[]> = {
  "PI": ["Teresina", "Picos", "Piripiri", "Floriano", "Parnaíba", "Outro"],
  "CE": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral", "Outro"],
  "MA": ["São Luís", "Imperatriz", "São José de Ribamar", "Timon", "Caxias", "Outro"],
  "SP": ["São Paulo", "Campinas", "Guarulhos", "São Bernardo do Campo", "Santo André", "Outro"],
  "RJ": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Outro"],
  "MG": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Outro"],
  "RS": ["Porto Alegre", "Caxias do Sul", "Canoas", "Pelotas", "Santa Maria", "Outro"],
  "PR": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "Outro"],
};

// Categorias (as mesmas do emailStorage)
const categories = ['Trabalho', 'Pessoal', 'Financeiro', 'Suporte', 'Marketing', 'Vendas', 'Compras'];


// Interface local para o formulário
interface EmailFormData {
  subject: string;
  sender: string;
  recipient: string;
  content: string;
  state: string;
  city: string; // Este é o novo campo que precisamos adicionar
  category: string;
}

export default function NewEmail() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<EmailFormData>({
    subject: "",
    sender: "",
    recipient: "",
    content: "",
    state: "",
    city: "",
    category: ""
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const handleStateChange = (state: string) => {
    setFormData(prev => ({ 
      ...prev, 
      state,
      city: "" // Limpa a cidade quando muda o estado
    }));
    
    // Atualiza a lista de cidades disponíveis
    const cities = citiesByState[state] || [];
    setAvailableCities(cities);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.subject || !formData.sender || !formData.content || !formData.state || !formData.city) {
    toast({
      title: "Erro",
      description: "Preencha todos os campos obrigatórios (Assunto, Remetente, Conteúdo, Estado e Município).",
      variant: "destructive",
    });
    return;
  }

  try {
    const payload = {
      assunto: formData.subject,
      remetente: formData.sender,
      destinatario: formData.recipient || "cliente@email.com",
      corpo: formData.content,
      estado: formData.state,
      municipio: formData.city,
      categoria: formData.category || null
    };

    const created = await createEmail(payload);

    toast({
      title: "📨 E-mail criado!",
      description: `Local: ${formData.state} - ${formData.city}`,
    });

    navigate(`/email/${created.data.id}`);

  } catch (err) {
    toast({
      title: "Erro ao criar e-mail",
      description: "O servidor não conseguiu salvar o novo e-mail.",
      variant: "destructive",
    });
  }
};


  const handleChange = (field: keyof EmailFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  // Calcula se o formulário está completo para habilitar/desabilitar botão
  const isFormComplete = () => {
    return formData.subject && 
           formData.sender && 
           formData.content && 
           formData.state && 
           formData.city; // Estado e cidade são obrigatórios
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          Novo E-mail Manual
        </h1>
        <p className="text-muted-foreground text-lg">
          Cadastre e classifique o e-mail em uma única etapa
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Mail className="h-6 w-6" />
            Cadastro e Classificação
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Preencha todos os campos para registrar um novo e-mail já classificado
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seção 1: Informações Básicas */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <Calendar className="h-5 w-5" />
                Informações do E-mail
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assunto */}
                <div className="space-y-3">
                  <Label htmlFor="subject" className="font-medium">
                    Assunto *
                  </Label>
                  <Input 
                    id="subject"
                    value={formData.subject} 
                    onChange={(e) => handleChange("subject", e.target.value)} 
                    placeholder="Ex: Proposta Comercial, Orçamento, Suporte Técnico..."
                    className="h-11"
                  />
                </div>

                
              </div>

              {/* Categoria */}
              <div className="space-y-3">
                <Label className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categoria
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      variant={formData.category === category ? "default" : "outline"}
                      className={`justify-start ${
                        formData.category === category 
                          ? 'bg-primary text-primary-foreground' 
                          : ''
                      }`}
                      onClick={() => handleChange("category", category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção 2: Remetente e Destinatário */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <User className="h-5 w-5" />
                Contatos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="sender" className="font-medium">
                    Remetente *
                  </Label>
                  <Input 
                    id="sender"
                    value={formData.sender} 
                    onChange={(e) => handleChange("sender", e.target.value)} 
                    placeholder="seu.email@empresa.com"
                    className="h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="recipient" className="font-medium">
                    Destinatário
                  </Label>
                  <Input 
                    id="recipient"
                    value={formData.recipient} 
                    onChange={(e) => handleChange("recipient", e.target.value)} 
                    placeholder="cliente@email.com"
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Conteúdo */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <Mail className="h-5 w-5" />
                Conteúdo da Mensagem
              </h3>
              
              <div className="space-y-3">
                <Label htmlFor="content" className="font-medium">
                  Conteúdo *
                </Label>
                <Textarea 
                  id="content"
                  rows={10} 
                  value={formData.content} 
                  onChange={(e) => handleChange("content", e.target.value)} 
                  placeholder="Digite o conteúdo completo da mensagem..."
                  className="resize-y min-h-[200px] font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Caracteres: {formData.content.length} (mínimo recomendado: 50)
                </p>
              </div>
            </div>

            {/* Seção 4: Localização */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <MapPin className="h-5 w-5" />
                Localização *
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Estado (UF) *</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                              {state}
                            </span>
                            <span>
                              {state === 'PI' ? 'Piauí' :
                               state === 'CE' ? 'Ceará' :
                               state === 'MA' ? 'Maranhão' :
                               state === 'SP' ? 'São Paulo' :
                               state === 'RJ' ? 'Rio de Janeiro' :
                               state}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Município *</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleChange("city", value)}
                    disabled={!formData.state}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={
                        formData.state 
                          ? "Selecione o município" 
                          : "← Selecione o estado primeiro"
                      } />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                      {availableCities.length === 0 && formData.state && (
                        <div className="p-4 text-center text-muted-foreground">
                          Digite o município manualmente
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {formData.state && formData.city && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Localização definida:</p>
                        <p className="text-lg font-bold text-primary">
                          {formData.state} - {formData.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ✓ Pronto para cadastrar
                    </div>
                  </div>
                </div>
              )}

              {/* Se não houver municípios no dropdown, permitir entrada manual */}
              {formData.state && availableCities.length === 0 && (
                <div className="space-y-3">
                  <Label htmlFor="cityManual">Município (digite manualmente) *</Label>
                  <Input 
                    id="cityManual"
                    value={formData.city} 
                    onChange={(e) => handleChange("city", e.target.value)} 
                    placeholder="Digite o nome do município"
                    className="h-11"
                  />
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="pt-8 border-t space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-12 text-lg"
                  disabled={!isFormComplete()}
                >
                  <Send className="h-5 w-5 mr-3" /> 
                  {isFormComplete() ? "Cadastrar e Classificar" : "Preencha todos os campos obrigatórios"}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  className="h-12"
                >
                  Cancelar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate("/pending")}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Ver E-mails Pendentes
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate("/history")}
                  className="text-green-600 hover:text-green-800"
                >
                  Ver Histórico Classificado
                </Button>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p>✅ Este e-mail será cadastrado já classificado</p>
              </div>
              <p className="text-muted-foreground pl-4">
                Status: <span className="font-semibold text-green-600">Classificado</span> • 
                Irá direto para o histórico • 
                Não aparecerá em "Pendentes"
              </p>
              <p className="text-muted-foreground pl-4 mt-2">
                <strong>Observação:</strong> A data/hora são registradas automaticamente. O município será salvo na propriedade `city` (que precisa ser adicionada ao tipo Email).
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}