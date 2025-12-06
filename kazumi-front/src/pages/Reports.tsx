import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, GraduationCap, ArrowLeft, Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("visao-geral");
  const [selectedPeriod, setSelectedPeriod] = useState("mes");

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
            <div className="grid md:grid-cols-2 gap-4">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Total de Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12 desde o último mês
              </p>
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
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground mt-1">
                13.7% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                Taxa de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground mt-1">
                +5% desde o último mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-info" />
                Média Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7.8</div>
              <p className="text-xs text-muted-foreground mt-1">
                Notas de 0 a 10
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
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
            {/* Placeholder for chart/table */}
            <div className="space-y-4">
              {/* Sample report data */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">5º Ano A - Matutino</span>
                  <span className="text-sm text-muted-foreground">35 alunos</span>
                </div>
                <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: "92%" }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Entrega</span>
                  <span className="font-medium text-success">92%</span>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">6º Ano B - Vespertino</span>
                  <span className="text-sm text-muted-foreground">32 alunos</span>
                </div>
                <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-warning" style={{ width: "78%" }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Entrega</span>
                  <span className="font-medium text-warning">78%</span>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">7º Ano A - Matutino</span>
                  <span className="text-sm text-muted-foreground">38 alunos</span>
                </div>
                <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: "89%" }} />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Entrega</span>
                  <span className="font-medium text-success">89%</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Nota:</strong> Os dados apresentados são atualizados em tempo real. 
                Use os filtros acima para visualizar diferentes perspectivas e períodos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
