import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const RegisterStudent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [studentName, setStudentName] = useState("");
  const [matricula, setMatricula] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [hasSpecialNeeds, setHasSpecialNeeds] = useState(false);
  const [needsDescription, setNeedsDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName || !matricula) {
      toast.error("Por favor, preencha nome e matrícula do aluno");
      return;
    }

    if (hasSpecialNeeds && !needsDescription) {
      toast.error("Por favor, descreva as necessidades especiais");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create user account for student
      const userResponse = await api.post("/api/auth/register", {
        email: `aluno${matricula}@temp.com`, // Temporary email
        senha: `temp${matricula}123`, // Temporary password
        nome_completo: studentName,
        tipo_usuario: "aluno",
        telefone: ""
      });

      const studentUserId = userResponse.data.id;

      // Step 2: Create aluno record
      await api.post("/api/users/alunos", {
        user_id: studentUserId,
        matricula: matricula,
        data_nascimento: birthDate || null,
        necessidades_especiais: hasSpecialNeeds,
        descricao_necessidades: hasSpecialNeeds ? needsDescription : null,
        pei_ativo: false
      });

      toast.success("Aluno cadastrado com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.error("Error registering student:", error);
      if (error.response?.status === 400) {
        toast.error("Matrícula já cadastrada");
      } else {
        toast.error("Erro ao cadastrar aluno. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-screen-lg mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Cadastrar Aluno</h1>
              <p className="text-muted-foreground mt-1">
                {user?.tipo_usuario === "responsavel" 
                  ? "Cadastre seu filho/aluno no sistema"
                  : "Cadastrar novo aluno na escola"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-screen-lg mx-auto p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Aluno</CardTitle>
              <CardDescription>Informações básicas do estudante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Nome Completo *</Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Nome completo do aluno"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula *</Label>
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Número de matrícula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">Nome da Escola</Label>
                <Input
                  id="schoolName"
                  type="text"
                  placeholder="Ex: Escola Municipal João Silva"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Informe o nome da escola para verificação
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Necessidades Especiais</CardTitle>
              <CardDescription>Informe se o aluno possui alguma deficiência ou necessidade especial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasSpecialNeeds"
                  checked={hasSpecialNeeds}
                  onCheckedChange={(checked) => setHasSpecialNeeds(checked as boolean)}
                />
                <Label
                  htmlFor="hasSpecialNeeds"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  O aluno possui necessidades especiais
                </Label>
              </div>

              {hasSpecialNeeds && (
                <div className="space-y-2">
                  <Label htmlFor="needsDescription">Descrição das Necessidades *</Label>
                  <Textarea
                    id="needsDescription"
                    placeholder="Descreva as necessidades especiais, deficiências ou condições do aluno..."
                    value={needsDescription}
                    onChange={(e) => setNeedsDescription(e.target.value)}
                    rows={4}
                    required={hasSpecialNeeds}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta informação ajudará a escola a fornecer o suporte adequado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Cadastrando..." : "Cadastrar Aluno"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterStudent;
