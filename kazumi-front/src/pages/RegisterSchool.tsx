import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, School, Users, Plus, ArrowLeft, GraduationCap, UserCheck, UserX, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { turmasApi, escolasApi, professoresApi, alunosApi, type Escola, type Turma, type Professor, type Aluno } from "@/services/api";

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
  const [activeTab, setActiveTab] = useState<"escola" | "turma" | "professores" | "alunos">("escola");
  const [loading, setLoading] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);

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

  // Professors management state
  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [turmaProfessores, setTurmaProfessores] = useState<Professor[]>([]);

  // Student management state
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState("");
  const [selectedTurmaForAluno, setSelectedTurmaForAluno] = useState("");
  const [turmaAlunos, setTurmaAlunos] = useState<Aluno[]>([]);

  useEffect(() => {
    loadEscolas();
    loadTurmas();
    loadProfessores();
  }, []);

  // Reload data when switching tabs to ensure fresh data
  useEffect(() => {
    if (activeTab === 'turma') {
      loadEscolas(); // Refresh schools list when viewing turma tab
    } else if (activeTab === 'professores') {
      loadTurmas(); // Refresh turmas list when viewing professores tab
      loadProfessores(); // Refresh professores list
    } else if (activeTab === 'alunos') {
      loadAlunos(); // Refresh alunos list for student management
      loadTurmas(); // Refresh turmas list for assignment
    }
  }, [activeTab]);

  const loadEscolas = async () => {
    try {
      const response = await escolasApi.list();
      setEscolas(response.data || []);
    } catch (error) {
      console.error("Error loading escolas:", error);
      setEscolas([]);
    }
  };

  const loadTurmas = async () => {
    try {
      const response = await turmasApi.list();
      setTurmas(response.data || []);
    } catch (error) {
      console.error("Error loading turmas:", error);
      setTurmas([]);
    }
  };

  const loadProfessores = async () => {
    try {
      const response = await professoresApi.list();
      setProfessores(response.data || []);
    } catch (error) {
      console.error("Error loading professores:", error);
      setProfessores([]);
    }
  };

  const loadTurmaProfessores = async (turmaId: string) => {
    try {
      const response = await turmasApi.getProfessores(parseInt(turmaId));
      setTurmaProfessores(response.data || []);
    } catch (error) {
      console.error("Error loading turma professores:", error);
      setTurmaProfessores([]);
    }
  };

  const loadAlunos = async () => {
    try {
      const response = await alunosApi.list();
      setAlunos(response.data || []);
    } catch (error) {
      console.error("Error loading alunos:", error);
      setAlunos([]);
    }
  };

  const loadTurmaAlunos = async (turmaId: string) => {
    try {
      const response = await turmasApi.getAlunos(parseInt(turmaId));
      setTurmaAlunos(response.data || []);
    } catch (error) {
      console.error("Error loading turma alunos:", error);
      setTurmaAlunos([]);
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

  const handleAddProfessor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTurma || !selectedProfessor) {
      toast.error("Por favor, selecione uma turma e um professor");
      return;
    }

    setLoading(true);

    try {
      await turmasApi.addProfessor(parseInt(selectedTurma), parseInt(selectedProfessor));
      toast.success("Professor adicionado à turma com sucesso!");
      setSelectedProfessor("");
      loadTurmaProfessores(selectedTurma);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || "Erro ao adicionar professor";
      toast.error(errorMessage);
      console.error("Add professor error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfessor = async (turmaId: number, professorId: number) => {
    if (!confirm("Tem certeza que deseja remover este professor da turma?")) {
      return;
    }

    setLoading(true);

    try {
      await turmasApi.removeProfessor(turmaId, professorId);
      toast.success("Professor removido da turma com sucesso!");
      loadTurmaProfessores(selectedTurma);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || "Erro ao remover professor";
      toast.error(errorMessage);
      console.error("Remove professor error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAluno = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAluno || !selectedTurmaForAluno) {
      toast.error("Por favor, selecione um aluno e uma turma");
      return;
    }

    setLoading(true);

    try {
      await alunosApi.update(parseInt(selectedAluno), { turma_id: parseInt(selectedTurmaForAluno) });
      toast.success("Aluno adicionado à turma com sucesso!");
      setSelectedAluno("");
      setSelectedTurmaForAluno("");
      loadAlunos(); // Refresh list
      if (selectedTurmaForAluno) {
        loadTurmaAlunos(selectedTurmaForAluno);
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || "Erro ao adicionar aluno à turma";
      toast.error(errorMessage);
      console.error("Assign aluno error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAluno = async (alunoId: number, turmaId: string) => {
    if (!confirm("Tem certeza que deseja remover este aluno da turma?")) {
      return;
    }

    setLoading(true);

    try {
      await alunosApi.update(alunoId, { turma_id: null });
      toast.success("Aluno removido da turma com sucesso!");
      loadTurmaAlunos(turmaId);
      loadAlunos(); // Refresh unassigned list
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || "Erro ao remover aluno da turma";
      toast.error(errorMessage);
      console.error("Remove aluno error:", error);
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
          <button
            onClick={() => setActiveTab("professores")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "professores"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Gerenciar Professores
            </div>
          </button>
          <button
            onClick={() => setActiveTab("alunos")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "alunos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Gerenciar Alunos
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

        {/* Professors Management Tab */}
        {activeTab === "professores" && (
          <div className="space-y-6">
            {/* Add Professor Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Adicionar Professor à Turma
                </CardTitle>
                <CardDescription>
                  Associe professores cadastrados às turmas existentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProfessor} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectedTurma">Turma *</Label>
                      <Select
                        value={selectedTurma}
                        onValueChange={(value) => {
                          setSelectedTurma(value);
                          loadTurmaProfessores(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {turmas.length === 0 ? (
                            <SelectItem value="_none" disabled>
                              Nenhuma turma cadastrada
                            </SelectItem>
                          ) : (
                            turmas.map((turma) => (
                              <SelectItem key={turma.id} value={turma.id.toString()}>
                                {turma.nome} - {turma.escola?.nome || 'Escola não definida'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedProfessor">Professor *</Label>
                      <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o professor" />
                        </SelectTrigger>
                        <SelectContent>
                          {professores.length === 0 ? (
                            <SelectItem value="_none" disabled>
                              Nenhum professor cadastrado
                            </SelectItem>
                          ) : (
                            professores.map((professor) => (
                              <SelectItem key={professor.id} value={professor.id.toString()}>
                                {professor.user?.nome_completo || `Professor ${professor.id}`} - {professor.matricula}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    <Plus className="mr-2 h-5 w-5" />
                    {loading ? "Adicionando..." : "Adicionar Professor à Turma"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Current Professors List */}
            {selectedTurma && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Professores da Turma
                  </CardTitle>
                  <CardDescription>
                    Professores atualmente associados a esta turma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {turmaProfessores.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">Nenhum professor associado</p>
                      <p className="text-sm mt-1">Adicione professores usando o formulário acima</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {turmaProfessores.map((professor) => (
                        <div
                          key={professor.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {professor.user?.nome_completo || `Professor ${professor.id}`}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Matrícula: {professor.matricula}
                                {professor.formacao && ` • ${professor.formacao}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveProfessor(parseInt(selectedTurma), professor.id)}
                            disabled={loading}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Student Management Tab */}
        {activeTab === "alunos" && (
          <div className="space-y-6">
            {/* Assign Student Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Adicionar Aluno à Turma
                </CardTitle>
                <CardDescription>
                  Atribua alunos cadastrados às suas respectivas turmas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssignAluno} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectedAluno">Aluno *</Label>
                      <Select value={selectedAluno} onValueChange={setSelectedAluno}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o aluno" />
                        </SelectTrigger>
                        <SelectContent>
                          {alunos.filter(a => !a.turma_id).length === 0 ? (
                            <SelectItem value="_none" disabled>
                              Nenhum aluno sem turma
                            </SelectItem>
                          ) : (
                            alunos
                              .filter(a => !a.turma_id)
                              .map((aluno) => (
                                <SelectItem key={aluno.id} value={aluno.id.toString()}>
                                  {aluno.user?.nome_completo || `Aluno ${aluno.id}`} - {aluno.matricula}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selectedTurmaForAluno">Turma *</Label>
                      <Select value={selectedTurmaForAluno} onValueChange={setSelectedTurmaForAluno}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          {turmas.length === 0 ? (
                            <SelectItem value="_none" disabled>
                              Nenhuma turma cadastrada
                            </SelectItem>
                          ) : (
                            turmas.map((turma) => (
                              <SelectItem key={turma.id} value={turma.id.toString()}>
                                {turma.nome} - {turma.escola?.nome || 'Escola não definida'}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    <Plus className="mr-2 h-5 w-5" />
                    {loading ? "Adicionando..." : "Adicionar Aluno à Turma"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* View Students by Class */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Alunos por Turma
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie alunos de cada turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="viewTurma">Selecione uma Turma</Label>
                    <Select
                      value={selectedTurmaForAluno}
                      onValueChange={(value) => {
                        setSelectedTurmaForAluno(value);
                        loadTurmaAlunos(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.length === 0 ? (
                          <SelectItem value="_none" disabled>
                            Nenhuma turma cadastrada
                          </SelectItem>
                        ) : (
                          turmas.map((turma) => (
                            <SelectItem key={turma.id} value={turma.id.toString()}>
                              {turma.nome} - {turma.serie}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTurmaForAluno && (
                    <div className="mt-6">
                      {turmaAlunos.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium">Nenhum aluno nesta turma</p>
                          <p className="text-sm mt-1">Adicione alunos usando o formulário acima</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {turmaAlunos.map((aluno) => (
                            <div
                              key={aluno.id}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <UserCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {aluno.user?.nome_completo || `Aluno ${aluno.id}`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Matrícula: {aluno.matricula}
                                    {aluno.necessidades_especiais && " • PcD"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveAluno(aluno.id, selectedTurmaForAluno)}
                                disabled={loading}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Remover
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Dica:</strong> Após cadastrar escolas e turmas, você poderá associar professores às turmas,
              gerenciar alunos e criar atividades específicas. Professores terão acesso para dar notas,
              acompanhar engajamento e conversar com responsáveis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterSchool;
