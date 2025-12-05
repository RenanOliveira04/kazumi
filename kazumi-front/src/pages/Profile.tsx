import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Settings, LogOut, Volume2, Eye, Languages } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Profile = () => {
  const { user, signOut } = useAuth();
  const [preferences, setPreferences] = useState({
    narration: false,
    fontSize: false,
    highContrast: false,
    libras: false,
  });

  const handleLogout = async () => {
    signOut();
    toast.success("Até logo!");
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Preferência atualizada!");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Meu Perfil
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas informações e preferências
          </p>
        </div>
      </header>

      <div className="max-w-screen-lg mx-auto p-4 md:p-6 space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{user?.nome_completo || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{user?.email || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{user?.telefone || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Tipo de Usuário</p>
                <p className="font-medium capitalize">{user?.tipo_usuario || "Não informado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferências de Acessibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Volume2 className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="narration" className="text-base font-medium cursor-pointer">
                    Narração Automática
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa leitura automática de textos
                  </p>
                </div>
              </div>
              <Switch
                id="narration"
                checked={preferences.narration}
                onCheckedChange={() => togglePreference("narration")}
                aria-label="Ativar narração automática"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="fontSize" className="text-base font-medium cursor-pointer">
                    Aumentar Fonte
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Textos maiores para melhor leitura
                  </p>
                </div>
              </div>
              <Switch
                id="fontSize"
                checked={preferences.fontSize}
                onCheckedChange={() => togglePreference("fontSize")}
                aria-label="Aumentar tamanho da fonte"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="highContrast" className="text-base font-medium cursor-pointer">
                    Alto Contraste
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Melhor visualização para baixa visão
                  </p>
                </div>
              </div>
              <Switch
                id="highContrast"
                checked={preferences.highContrast}
                onCheckedChange={() => togglePreference("highContrast")}
                aria-label="Ativar modo alto contraste"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Languages className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="libras" className="text-base font-medium cursor-pointer">
                    Libras (VLibras)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Tradução em Língua Brasileira de Sinais
                  </p>
                </div>
              </div>
              <Switch
                id="libras"
                checked={preferences.libras}
                onCheckedChange={() => togglePreference("libras")}
                aria-label="Ativar tradução em Libras"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
