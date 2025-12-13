import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, ArrowLeft, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { turmasApi, type Turma, type Aluno } from "@/services/api";

const ClassManagement = () => {
  const [loading, setLoading] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [turmaAlunos, setTurmaAlunos] = useState<Aluno[]>([]);

  useEffect(() => {
    loadProfessorTurmas();
  }, []);

  const loadProfessorTurmas = async () => {
    setLoading(true);
    try {
      const response = await turmasApi.list();
      setTurmas(response.data || []);
    } catch (error) {
      console.error("Error loading turmas:", error);
      toast.error("Erro ao carregar turmas");
      setTurmas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTurmaAlunos = async (turmaId: number) => {
    setLoading(true);
    try {
      const response = await turmasApi.getAlunos(turmaId);
      setTurmaAlunos(response.data || []);
    } catch (error) {
      console.error("Error loading turma alunos:", error);
      toast.error("Erro ao carregar alunos da turma");
      setTurmaAlunos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTurma = (turma: Turma) => {
    setSelectedTurma(turma);
    loadTurmaAlunos(turma.id);
  };

  const handleBackToList = () => {
    setSelectedTurma(null);
    setTurmaAlunos([]);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Minhas Turmas</h1>
            <p className="text-muted-foreground">Gerencie suas turmas e alunos</p>
          </div>
        </div>

        {!selectedTurma ? (
          /* Turmas List View */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Carregando turmas...
                </CardContent>
              </Card>
            ) : turmas.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="font-medium text-lg">Nenhuma turma atribuída</p>
                  <p className="text-sm mt-2">
                    Entre em contato com o gestor da escola para ser atribuído a turmas
                  </p>
                </CardContent>
              </Card>
            ) : (
              turmas.map((turma) => (
                <Card key={turma.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {turma.nome}
                    </CardTitle>
                    <CardDescription>
                      {turma.serie} • {turma.turno}
                      {turma.escola && ` • ${turma.escola.nome}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ano Letivo</span>
                      <span className="font-medium">{turma.ano_letivo}</span>
                    </div>
                    <Button
                      onClick={() => handleViewTurma(turma)}
                      className="w-full"
                      variant="default"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ver Alunos
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          /* Turma Detail View */
          <div className="space-y-6">
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para minhas turmas
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  {selectedTurma.nome}
                </CardTitle>
                <CardDescription>
                  {selectedTurma.serie} • {selectedTurma.turno} • Ano {selectedTurma.ano_letivo}
                  {selectedTurma.escola && ` • ${selectedTurma.escola.nome}`}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Alunos da Turma ({turmaAlunos.length})
                </CardTitle>
                <CardDescription>
                  Lista de todos os alunos matriculados nesta turma
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando alunos...
                  </div>
                ) : turmaAlunos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Nenhum aluno nesta turma</p>
                    <p className="text-sm mt-1">
                      Alunos serão atribuídos pelo gestor da escola
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turmaAlunos.map((aluno, index) => (
                      <div
                        key={aluno.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {aluno.user?.nome_completo || `Aluno ${aluno.id}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Matrícula: {aluno.matricula}
                              {aluno.necessidades_especiais && " • Necessidades Especiais"}
                            </p>
                          </div>
                        </div>
                        <Link to={`/student/${aluno.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Placeholder for future grades/engagement metrics */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Métricas de Desempenho</CardTitle>
                <CardDescription>
                  Visualização de notas e engajamento (em breve)
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Esta seção exibirá estatísticas de desempenho, média de notas,
                frequência e níveis de engajamento dos alunos da turma.
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManagement;
