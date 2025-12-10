import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AxiosError {
  response?: {
    status: number;
    data?: unknown;
  };
  request?: unknown;
}

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: unknown) {
      toast.error("E-mail ou senha incorretos");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const playInstructions = () => {
    const msg = new SpeechSynthesisUtterance(
      "Para entrar, digite seu e-mail e sua senha. Depois, clique no botão Entrar."
    );
    msg.lang = "pt-BR";
    window.speechSynthesis.speak(msg);
    toast.info("Reproduzindo instruções...");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex items-center justify-center">
            <img 
              src="/logo.jpg" 
              alt="Kazumi Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
          <CardDescription className="text-base">
            Entre com seu e-mail e PIN para acessar
          </CardDescription>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={playInstructions}
            className="w-full"
            aria-label="Ouvir instruções de login"
          >
            <Volume2 className="mr-2 h-5 w-5" />
            Ouvir instruções
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-lg h-14"
                aria-required="true"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg h-14"
                aria-required="true"
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg h-14"
              disabled={loading}
              aria-label="Entrar no aplicativo"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-muted-foreground">Não tem uma conta?</p>
            <Link to="/signup">
              <Button variant="outline" size="lg" className="w-full text-base">
                Criar conta gratuita
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
