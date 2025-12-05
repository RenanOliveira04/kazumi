import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, FileText, Activity, Calendar, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { alunosApi, peiApi, Aluno, PEI, IntervencaoPedagogica } from "@/services/api";

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Aluno | null>(null);
  const [pei, setPei] = useState<PEI | null>(null);
  const [interventions, setInterventions] = useState<IntervencaoPedagogica[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    try {
      // For demo purposes, if no ID is provided, get the first student
      let studentData;
      if (id) {
        try {
          const response = await alunosApi.get(parseInt(id));
          studentData = response.data;
        } catch (error) {
          console.log("Student not found");
          setLoading(false);
          return;
        }
      } else {
        try {
          const response = await alunosApi.list();
          if (response.data.length === 0) {
            console.log("No students available");
            setLoading(false);
            return;
          }
          studentData = response.data[0];
        } catch (error) {
          console.log("Unable to load students");
          setLoading(false);
          return;
        }
      }
      
      setStudent(studentData);

      // Load PEI if student has one active - don't show toast for 404
      if (studentData.pei_ativo) {
        try {
          const peiResponse = await peiApi.getByAluno(studentData.id);
          setPei(peiResponse.data);

          // Load interventions for this PEI - don't show error if empty
          if (peiResponse.data?.id) {
            try {
              const interventionsResponse = await peiApi.getIntervencoes(peiResponse.data.id);
              setInterventions(interventionsResponse.data || []);
            } catch (error) {
              console.log("No interventions found");
              setInterventions([]);
            }
          }
        } catch (error) {
          console.log("PEI not configured yet");
          setPei(null);
        }
      }
    } catch (error) {
      console.error("Unexpected error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (!student) {
    return <div className="flex justify-center items-center h-screen">Aluno não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {student.user?.nome_completo || "Aluno"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{student.turma?.nome || student.matricula}</Badge>
                {student.necessidades_especiais && student.descricao_necessidades && (
                  <Badge variant="outline" className="border-primary text-primary">
                    {student.descricao_necessidades}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-lg mx-auto p-4 md:p-6 space-y-6">
        {!pei ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                PEI (Plano Educacional Individualizado) ainda não foi configurado para este aluno.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="pei" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pei">PEI - Plano Educacional</TabsTrigger>
              <TabsTrigger value="interventions">Intervenções e Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="pei" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Objetivos e Metas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{pei.objetivos}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pei.adaptacoes_curriculares && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Adaptações Curriculares</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{pei.adaptacoes_curriculares}</p>
                    </CardContent>
                  </Card>
                )}

                {pei.estrategias_ensino && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estratégias de Ensino</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{pei.estrategias_ensino}</p>
                    </CardContent>
                  </Card>
                )}

                {pei.recursos_necessarios && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recursos Necessários</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{pei.recursos_necessarios}</p>
                    </CardContent>
                  </Card>
                )}

                {pei.criterios_avaliacao && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Critérios de Avaliação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{pei.criterios_avaliacao}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="flex justify-end">
                <p className="text-xs text-muted-foreground">
                  Última atualização: {new Date(pei.atualizado_em || pei.criado_em).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="interventions" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Registro de Intervenções
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interventions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma intervenção registrada ainda.
                    </p>
                  ) : (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {interventions.map((intervention) => (
                          <div key={intervention.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                            <div className="flex-shrink-0 mt-1">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-sm">
                                  {new Date(intervention.data_intervencao).toLocaleDateString('pt-BR')}
                                </p>
                                {intervention.tipo_intervencao && (
                                  <Badge variant="outline">{intervention.tipo_intervencao}</Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{intervention.descricao}</p>
                              {intervention.resultados_observados && (
                                <p className="text-sm text-muted-foreground">
                                  Resultado: {intervention.resultados_observados}
                                </p>
                              )}
                              {intervention.proximos_passos && (
                                <p className="text-sm text-muted-foreground">
                                  Próximos passos: {intervention.proximos_passos}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
