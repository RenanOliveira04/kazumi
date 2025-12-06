import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Signup = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("responsavel");
  const [loading, setLoading] = useState(false);

  const playInstructions = () => {
    const msg = new SpeechSynthesisUtterance(
      "Para criar sua conta, preencha seu nome completo, e-mail e escolha uma senha. A senha deve ter pelo menos 6 caracteres. Depois, clique no botão Criar Conta."
    );
    msg.lang = "pt-BR";
    window.speechSynthesis.speak(msg);
    toast.info("Reproduzindo instruções...");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/api/auth/register", {
        nome_completo: fullName,
        email,
        senha: password,
        tipo_usuario: userType,
      });

      if (response.data) {
        toast.success("Conta criada com sucesso!");
        
        // Auto login after signup
        await signIn(email, password);
        
        // Navigate based on user type
        if (userType === "gestor") {
          navigate("/register-school");
        } else {
          navigate("/home");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.detail || "Erro ao criar conta. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription className="text-base">
            Preencha seus dados para começar
          </CardDescription>
          
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={playInstructions}
            className="w-full"
            aria-label="Ouvir instruções de cadastro"
          >
            <Volume2 className="mr-2 h-5 w-5" />
            Ouvir instruções
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-lg">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-lg h-14"
                aria-required="true"
                autoComplete="name"
              />
            </div>

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
              <Label htmlFor="userType" className="text-lg">
                Tipo de Conta
              </Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger className="text-lg h-14">
                  <SelectValue placeholder="Selecione o tipo de conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responsavel">Responsável</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-lg">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg h-14"
                aria-required="true"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-lg">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-lg h-14"
                aria-required="true"
                autoComplete="new-password"
              />
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg h-14"
              disabled={loading}
              aria-label="Criar conta"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground mb-2">Já tem uma conta?</p>
            <Link to="/login">
              <Button variant="link" className="text-base">
                Fazer login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
