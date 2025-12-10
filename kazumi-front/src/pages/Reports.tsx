import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, GraduationCap, ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  relatoriosApi,
  type RelatorioEngajamento,
  type RelatorioDesempenho,
  type RelatorioPEI,
  escolasApi,
  type Escola
} from "@/services/api";
import { toast } from "sonner";

const Reports = () => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState("visao-geral");
  const [selectedPeriod, setSelectedPeriod] = useState("mes");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Data states
  const [schools, setSchools] = useState<Escola[]>([]);
  const [engajamentoData, setEngajamentoData] = useState<RelatorioEngajamento | null>(null);
  const [desempenhoData, setDesempenhoData] = useState<RelatorioDesempenho[]>([]);
  const [peiData, setPeiData] = useState<RelatorioPEI | null>(null);

  // Load schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  // Load data when filters change
  useEffect(() => {
    loadReportData();
  }, [selectedReport, selectedPeriod, selectedSchool]);

  const loadSchools = async () => {
    try {
      const response = await escolasApi.list();
      setSchools(response.data || []);
    } catch (error: unknown) {
      console.error("Error loading schools:", error);
      toast.error("Erro ao carregar lista de escolas");
    }
  };

  const loadReportData = async () => {
    if (!selectedSchool) return;

    setLoading(true);
    try {
      const periodDays = getPeriodDays(selectedPeriod);
      const schoolId = parseInt(selectedSchool);

      if (selectedReport === "visao-geral") {
        const response = await relatoriosApi.getEngajamentoGeral(periodDays, schoolId);
        setEngajamentoData(response.data);
      } else if (selectedReport === "desempenho") {
        const response = await relatoriosApi.getDesempenhoAlunos(schoolId);
        setDesempenhoData(response.data);
      } else if (selectedReport === "pei") {
        const response = await relatoriosApi.getPEIAcompanhamento(schoolId);
        setPeiData(response.data);
      }
    } catch (error: unknown) {
      console.error("Error loading report data:", error);
      toast.error("Erro ao carregar dados do relatório");
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDays = (period: string): number => {
    switch (period) {
      case "semana": return 7;
      case "mes": return 30;
      case "trimestre": return 90;
      case "semestre": return 180;
      case "ano": return 365;
      default: return 30;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Relatórios e Métricas</h1>
              <p className="text-muted-foreground">
                Análise de desempenho e estatísticas da escola
              </p>
            </div>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Escola</label>
                <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.length === 0 ? (
                      <SelectItem value="_none" disabled>
                        Nenhuma escola disponível
                      </SelectItem>
                    ) : (
                      schools.map((escola) => (
                        <SelectItem key={escola.id} value={escola.id.toString()}>
                          {escola.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Relatório</label>
                <Select value={selectedReport} onValueChange={setSelectedReport}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visao-geral">Visão Geral</SelectItem>
                    <SelectItem value="desempenho">Desempenho por Turma</SelectItem>
                    <SelectItem value="frequencia">Frequência</SelectItem>
                    <SelectItem value="atividades">Atividades Entregues</SelectItem>
                    <SelectItem value="pei">Alunos com PEI</SelectItem>
                    <SelectItem value="mensagens">Engajamento (Mensagens)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Última Semana</SelectItem>
                    <SelectItem value="mes">Último Mês</SelectItem>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="semestre">Semestre</SelectItem>
                    <SelectItem value="ano">Ano Letivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Overview */}
        {selectedSchool && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total de Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : engajamentoData ? (
                  <>
                    <div className="text-2xl font-bold">{engajamentoData.total_usuarios}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {engajamentoData.usuarios_ativos} usuários ativos
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Dados não disponíveis</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-success" />
                  Alunos com PEI
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : peiData ? (
                  <>
                    <div className="text-2xl font-bold">{peiData.total_alunos_pei}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {engajamentoData && `${((peiData.total_alunos_pei / engajamentoData.total_usuarios) * 100).toFixed(1)}% do total`}
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Dados não disponíveis</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Taxa de Ativação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : engajamentoData ? (
                  <>
                    <div className="text-2xl font-bold">{engajamentoData.taxa_ativacao}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {engajamentoData.usuarios_ativos} de {engajamentoData.total_usuarios} ativos
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Dados não disponíveis</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-info" />
                  Mensagens Enviadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : engajamentoData ? (
                  <>
                    <div className="text-2xl font-bold">{engajamentoData.mensagens_enviadas}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Últimos {engajamentoData.periodo_dias} dias
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">Dados não disponíveis</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Content */}
        {selectedSchool ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedReport === "visao-geral" && "Visão Geral da Escola"}
                {selectedReport === "desempenho" && "Desempenho por Turma"}
                {selectedReport === "frequencia" && "Relatório de Frequência"}
                {selectedReport === "atividades" && "Atividades Entregues"}
                {selectedReport === "pei" && "Alunos com PEI Ativo"}
                {selectedReport === "mensagens" && "Engajamento com Mensagens"}
              </CardTitle>
              <CardDescription>
                Período: {selectedPeriod === "semana" && "Última Semana"}
                {selectedPeriod === "mes" && "Último Mês"}
                {selectedPeriod === "trimestre" && "Trimestre Atual"}
                {selectedPeriod === "semestre" && "Semestre Atual"}
                {selectedPeriod === "ano" && "Ano Letivo 2024"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando dados...</span>
                </div>
              ) : (
                <>
                  {selectedReport === "visao-geral" && engajamentoData && (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Usuários Ativos</h4>
                          <div className="text-2xl font-bold text-primary">{engajamentoData.usuarios_ativos}</div>
                          <p className="text-sm text-muted-foreground">
                            {engajamentoData.taxa_ativacao}% de taxa de ativação
                          </p>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Total de Ações</h4>
                          <div className="text-2xl font-bold text-secondary">{engajamentoData.total_acoes}</div>
                          <p className="text-sm text-muted-foreground">
                            Nos últimos {engajamentoData.periodo_dias} dias
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedReport === "desempenho" && desempenhoData.length > 0 && (
                    <div className="space-y-4">
                      {desempenhoData.map((turma, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{turma.turma_nome}</span>
                            <span className="text-sm text-muted-foreground">{turma.total_alunos} alunos</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Taxa de Entrega: </span>
                              <span className="font-medium">{turma.taxa_entrega_atividades}%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Média Geral: </span>
                              <span className="font-medium">{turma.media_geral || "N/A"}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success"
                              style={{ width: `${turma.taxa_entrega_atividades}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedReport === "pei" && peiData && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Total de Alunos com PEI</h4>
                          <div className="text-2xl font-bold text-success">{peiData.total_alunos_pei}</div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Progresso Médio</h4>
                          <div className="text-2xl font-bold text-primary">{peiData.progresso_medio}%</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Distribuição por Série</h4>
                        <div className="space-y-2">
                          {peiData.alunos_por_serie.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{item.serie}</span>
                              <span className="font-medium">{item.quantidade} alunos</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedReport === "visao-geral" && !engajamentoData && (
                    <div className="text-center py-8 text-muted-foreground">
                      Dados de engajamento não disponíveis
                    </div>
                  )}

                  {selectedReport === "desempenho" && desempenhoData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Dados de desempenho não disponíveis
                    </div>
                  )}

                  {selectedReport === "pei" && !peiData && (
                    <div className="text-center py-8 text-muted-foreground">
                      Dados de PEI não disponíveis
                    </div>
                  )}

                  {/* Info */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Nota:</strong> Os dados apresentados são atualizados em tempo real.
                      Use os filtros acima para visualizar diferentes perspectivas e períodos.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Selecione uma escola para visualizar os relatórios</p>
              <p className="text-sm mt-1">Use o filtro de escola acima para carregar os dados.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
