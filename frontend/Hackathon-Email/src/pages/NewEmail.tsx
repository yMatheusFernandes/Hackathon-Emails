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

// ✅ IMPORTANDO AS CONSTANTES CENTRALIZADAS
import { BRAZILIAN_STATES, EMAIL_CATEGORIES, BRAZILIAN_CITIES_BY_STATE } from "@/lib/emailStorage";

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
  const [showManualCityInput, setShowManualCityInput] = useState(false);

  const handleStateChange = (state: string) => {
    setFormData(prev => ({ 
      ...prev, 
      state,
      city: "" // Limpa a cidade quando muda o estado
    }));
    setShowManualCityInput(false);
    
    // ✅ USANDO BRAZILIAN_CITIES_BY_STATE CENTRALIZADA
    const cities = BRAZILIAN_CITIES_BY_STATE[state] || [];
    setAvailableCities([...cities, "Outro"]);
  };

  const handleCityChange = (city: string) => {
    if (city === "Outro") {
      setShowManualCityInput(true);
      setFormData(prev => ({ ...prev, city: "" }));
    } else {
      setShowManualCityInput(false);
      setFormData(prev => ({ ...prev, city }));
    }
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

  // ✅ Obter o nome completo do estado usando a função utilitária
  const getStateName = (stateCode: string): string => {
    const state = BRAZILIAN_STATES.find(s => s.code === stateCode);
    return state ? state.name : stateCode;
  };

  return (
    <div className="max-w-5=2xl mx-auto animate-fade-in px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
          <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          Novo E-mail Manual
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg">
          Cadastre e classifique o e-mail em uma única etapa
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b p-4 sm:p-6">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
            Cadastro e Classificação
          </CardTitle>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Preencha todos os campos para registrar um novo e-mail já classificado
          </p>
        </CardHeader>

        <CardContent className="pt-6 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Seção 1: Informações Básicas */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Informações do E-mail
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Assunto */}
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="subject" className="font-medium text-sm sm:text-base">
                    Assunto *
                  </Label>
                  <Input 
                    id="subject"
                    value={formData.subject} 
                    onChange={(e) => handleChange("subject", e.target.value)} 
                    placeholder="Ex: Proposta Comercial, Orçamento, Suporte Técnico..."
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                {/* Categoria */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="font-medium flex items-center gap-2 text-sm sm:text-base">
                    <Tag className="h-4 w-4" />
                    Categoria
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* ✅ USANDO EMAIL_CATEGORIES CENTRALIZADA */}
                    {EMAIL_CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        type="button"
                        variant={formData.category === category ? "default" : "outline"}
                        className={`justify-start text-xs sm:text-sm ${
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
            </div>

            {/* Seção 2: Remetente e Destinatário */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Contatos
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="sender" className="font-medium text-sm sm:text-base">
                    Remetente *
                  </Label>
                  <Input 
                    id="sender"
                    value={formData.sender} 
                    onChange={(e) => handleChange("sender", e.target.value)} 
                    placeholder="seu.email@empresa.com"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="recipient" className="font-medium text-sm sm:text-base">
                    Destinatário
                  </Label>
                  <Input 
                    id="recipient"
                    value={formData.recipient} 
                    onChange={(e) => handleChange("recipient", e.target.value)} 
                    placeholder="cliente@email.com"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Conteúdo */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                Conteúdo da Mensagem
              </h3>
              
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="content" className="font-medium text-sm sm:text-base">
                  Conteúdo *
                </Label>
                <Textarea 
                  id="content"
                  rows={8} 
                  value={formData.content} 
                  onChange={(e) => handleChange("content", e.target.value)} 
                  placeholder="Digite o conteúdo completo da mensagem..."
                  className="resize-y min-h-[150px] sm:min-h-[200px] font-mono text-xs sm:text-sm"
                />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Caracteres: {formData.content.length} (mínimo recomendado: 50)
                </p>
              </div>
            </div>

            {/* Seção 4: Localização */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 pb-2 border-b">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                Localização *
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Estado (UF) *</Label>
                  <Select 
                    value={formData.state} 
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          <div className="flex items-center gap-2 py-1">
                            <span className="font-mono bg-blue-500 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                              {state.code}
                            </span>
                            <span className="text-sm">{state.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base">Município *</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={handleCityChange}
                    disabled={!formData.state}
                  >
                    <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base">
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Campo manual para "Outro" */}
              {showManualCityInput && (
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="cityManual" className="text-sm sm:text-base">
                    Digite o nome do município *
                  </Label>
                  <Input 
                    id="cityManual"
                    value={formData.city} 
                    onChange={(e) => handleChange("city", e.target.value)} 
                    placeholder="Digite o nome do município"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              )}

              {formData.state && formData.city && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Localização definida:</p>
                        <p className="text-base sm:text-lg font-bold text-primary">
                          {getStateName(formData.state)} - {formData.city}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      ✓ Pronto para cadastrar
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="pt-6 sm:pt-8 border-t space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-10 sm:h-12 text-sm sm:text-lg"
                  disabled={!isFormComplete()}
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" /> 
                  {isFormComplete() ? "Cadastrar e Classificar" : "Preencha todos os campos obrigatórios"}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  className="h-10 sm:h-12 text-sm sm:text-base"
                >
                  Cancelar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate("/pending")}
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                >
                  Ver E-mails Pendentes
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate("/history")}
                  className="text-green-600 hover:text-green-800 text-xs sm:text-sm"
                >
                  Ver Histórico Classificado
                </Button>
              </div>
            </div>

            {/* Informações */}
            <div className="bg-muted/30 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p>✅ Este e-mail será cadastrado já classificado</p>
              </div>
              <p className="text-muted-foreground pl-4">
                Status: <span className="font-semibold text-green-600">Classificado</span> • 
                Irá direto para o histórico • 
                Não aparecerá em "Pendentes"
              </p>
              <p className="text-muted-foreground pl-4 mt-1 sm:mt-2">
                <strong>Observação:</strong> A data/hora são registradas automaticamente.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}