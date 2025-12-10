import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, School, Users, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { turmasApi, escolasApi, type Escola } from "@/services/api";

interface AxiosError {
  response?: {
    status: number;
    data?: {
      detail?: string;
    };
  };
  request?: unknown;
}

const RegisterSchool = () => {
  const [activeTab, setActiveTab] = useState<"escola" | "turma">("escola");
  const [loading, setLoading] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);

  // School form state
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [schoolPhone, setSchoolPhone] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");

  // Class form state
  const [selectedEscola, setSelectedEscola] = useState("");
  const [className, setClassName] = useState("");
  const [classSeries, setClassSeries] = useState("");
  const [classShift, setClassShift] = useState("");
  const [classYear, setClassYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    loadEscolas();
  }, []);

  const loadEscolas = async () => {
    try {
      const response = await escolasApi.list();
      setEscolas(response.data || []);
    } catch (error) {
      console.error("Error loading escolas:", error);
      setEscolas([]);
    }
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolName) {
      toast.error("Por favor, preencha o nome da escola");
      return;
    }

    setLoading(true);
    
    try {
      await escolasApi.create({
        nome: schoolName,
        endereco: schoolAddress,
        telefone: schoolPhone,
        email: schoolEmail,
      });
      
      toast.success("Escola cadastrada com sucesso!");
      setSchoolName("");
      setSchoolAddress("");
      setSchoolPhone("");
      setSchoolEmail("");
      loadEscolas(); // Reload schools list
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || "Erro ao cadastrar escola";
      toast.error(errorMessage);
      console.error("School creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!className || !classSeries || !classShift || !selectedEscola) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    
    try {
      // Generate class code from name and series
      const codigo = `${classSeries.toUpperCase()}-${className.replace(/\s+/g, '')}`;
      
      await turmasApi.create({
        nome: className,
        codigo,
        serie: classSeries,
        turno: classShift,
        ano_letivo: parseInt(classYear),
        escola_id: parseInt(selectedEscola),
      });
      
      toast.success("Turma cadastrada com sucesso!");
      setClassName("");
      setClassSeries("");
      setClassShift("");
      setSelectedEscola("");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || "Erro ao cadastrar turma";
      toast.error(errorMessage);
      console.error("Class creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Cadastro</h1>
            <p className="text-muted-foreground">Gerencie escolas e turmas</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("escola")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "escola"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Cadastrar Escola
            </div>
          </button>
          <button
            onClick={() => setActiveTab("turma")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "turma"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Cadastrar Turma
            </div>
          </button>
        </div>

        {/* School Registration Form */}
        {activeTab === "escola" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Cadastrar Nova Escola
              </CardTitle>
              <CardDescription>
                Preencha as informações da escola para cadastro no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSchoolSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Nome da Escola *</Label>
                  <Input
                    id="schoolName"
                    placeholder="Ex: Escola Municipal Dom Pedro II"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolAddress">Endereço</Label>
                  <Textarea
                    id="schoolAddress"
                    placeholder="Rua, número, bairro, cidade - CEP"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Telefone de Contato</Label>
                  <Input
                    id="schoolPhone"
                    type="tel"
                    placeholder="(00) 0000-0000"
                    value={schoolPhone}
                    onChange={(e) => setSchoolPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    placeholder="escola@exemplo.com"
                    value={schoolEmail}
                    onChange={(e) => setSchoolEmail(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  <Plus className="mr-2 h-5 w-5" />
                  {loading ? "Cadastrando..." : "Cadastrar Escola"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Class Registration Form */}
        {activeTab === "turma" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cadastrar Nova Turma
              </CardTitle>
              <CardDescription>
                Crie uma turma e associe alunos posteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClassSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="selectedEscola">Escola *</Label>
                  <Select value={selectedEscola} onValueChange={setSelectedEscola}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a escola" />
                    </SelectTrigger>
                    <SelectContent>
                      {escolas.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          Nenhuma escola cadastrada
                        </SelectItem>
                      ) : (
                        escolas.map((escola) => (
                          <SelectItem key={escola.id} value={escola.id.toString()}>
                            {escola.nome}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Nome da Turma *</Label>
                    <Input
                      id="className"
                      placeholder="Ex: 5º Ano A"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classSeries">Série *</Label>
                    <Select value={classSeries} onValueChange={setClassSeries}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a série" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1ano">1º Ano</SelectItem>
                        <SelectItem value="2ano">2º Ano</SelectItem>
                        <SelectItem value="3ano">3º Ano</SelectItem>
                        <SelectItem value="4ano">4º Ano</SelectItem>
                        <SelectItem value="5ano">5º Ano</SelectItem>
                        <SelectItem value="6ano">6º Ano</SelectItem>
                        <SelectItem value="7ano">7º Ano</SelectItem>
                        <SelectItem value="8ano">8º Ano</SelectItem>
                        <SelectItem value="9ano">9º Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classShift">Turno *</Label>
                    <Select value={classShift} onValueChange={setClassShift}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matutino">Matutino</SelectItem>
                        <SelectItem value="vespertino">Vespertino</SelectItem>
                        <SelectItem value="noturno">Noturno</SelectItem>
                        <SelectItem value="integral">Integral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classYear">Ano Letivo</Label>
                    <Input
                      id="classYear"
                      type="number"
                      value={classYear}
                      onChange={(e) => setClassYear(e.target.value)}
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  <Plus className="mr-2 h-5 w-5" />
                  {loading ? "Cadastrando..." : "Cadastrar Turma"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Após cadastrar escolas e turmas, você poderá associar alunos, 
              professores e criar atividades específicas para cada turma.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterSchool;
