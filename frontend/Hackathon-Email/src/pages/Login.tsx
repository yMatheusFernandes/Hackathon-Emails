import { useState } from "react";
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
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/assets/images/StorkMailGG.png";

export default function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const GERENTE_LOGIN = "gerente@storkmail.com";
  const GERENTE_SENHA = "admin123";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !password.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    // Validação simples (somente para protótipo)
    if (name !== GERENTE_LOGIN || password !== GERENTE_SENHA) {
      toast({
        title: "Acesso negado",
        description: "Credenciais inválidas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simula chamada assincrona (ex.: requisição ao backend)
    setTimeout(() => {
      setIsLoading(false);

      // Persistir autenticação apenas após validação
      localStorage.setItem("auth", "true");

      toast({
        title: "Login realizado",
        description: `Bem-vindo, gerente!`,
      });

      // Navegar para a rota correta (minúscula)
      navigate("/dashboard");
    }, 700);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo (usa a mesma largura do card) */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg w-full h-36 flex items-center justify-center overflow-hidden shadow-md scale-100">
            <img
              src={Logo}
              alt="StorkMail logo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Card de login com mesma largura */}
        <Card className="shadow-lg w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" aria-label="formulário de login">
              <div className="space-y-2">
                <Label htmlFor="name">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="name"
                    name="email"
                    type="email"
                    placeholder="Digite seu email"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 text-sm sm:text-base"
                    autoComplete="username"
                    autoFocus
                    aria-required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 text-sm sm:text-base"
                    autoComplete="current-password"
                    aria-required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted/10"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
