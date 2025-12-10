import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Calendar, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { atividadesApi, turmasApi, Turma } from "@/services/api";

interface AxiosError {
  response?: {
    status: number;
    data?: {
      detail?: string;
    };
  };
  request?: unknown;
}

const CreateActivity = () => {
  const [loading, setLoading] = useState(false);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [activityType, setActivityType] = useState("");

  useEffect(() => {
    loadTurmas();
  }, []);

  const loadTurmas = async () => {
    try {
      const response = await turmasApi.list();
      setTurmas(response.data);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !dueDate || !targetClass) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    
    try {
      await atividadesApi.create({
        titulo: title,
        descricao: description,
        data_entrega: dueDate,
        turma_id: parseInt(targetClass),
        tipo_atividade: activityType || undefined,
      });

      toast.success("Atividade criada com sucesso!");
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setSubject("");
      setTargetClass("");
      setActivityType("");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data?.detail || "Erro ao criar atividade";
      toast.error(errorMessage);
      console.error("Activity creation error:", error);
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
            <h1 className="text-3xl font-bold">Criar Atividade</h1>
            <p className="text-muted-foreground">
              Crie tarefas e atividades para suas turmas
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Nova Atividade
            </CardTitle>
            <CardDescription>
              Preencha as informações da atividade que será disponibilizada para os alunos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título da Atividade *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Leitura do Capítulo 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva os objetivos e instruções da atividade..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              {/* Type and Subject */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activityType">Tipo de Atividade</Label>
                  <Select value={activityType} onValueChange={setActivityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tarefa">Tarefa de Casa</SelectItem>
                      <SelectItem value="leitura">Leitura</SelectItem>
                      <SelectItem value="pesquisa">Pesquisa</SelectItem>
                      <SelectItem value="projeto">Projeto</SelectItem>
                      <SelectItem value="prova">Prova/Avaliação</SelectItem>
                      <SelectItem value="apresentacao">Apresentação</SelectItem>
                      <SelectItem value="exercicio">Exercício</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Disciplina</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portugues">Português</SelectItem>
                      <SelectItem value="matematica">Matemática</SelectItem>
                      <SelectItem value="ciencias">Ciências</SelectItem>
                      <SelectItem value="historia">História</SelectItem>
                      <SelectItem value="geografia">Geografia</SelectItem>
                      <SelectItem value="ingles">Inglês</SelectItem>
                      <SelectItem value="artes">Artes</SelectItem>
                      <SelectItem value="educacao-fisica">Educação Física</SelectItem>
                      <SelectItem value="outra">Outra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Class and Due Date */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetClass">Turma *</Label>
                  <Select value={targetClass} onValueChange={setTargetClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmas.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhuma turma cadastrada
                        </SelectItem>
                      ) : (
                        turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id.toString()}>
                            {turma.nome} - {turma.turno}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    A atividade será visível para todos os alunos da turma
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data de Entrega *
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                <Plus className="mr-2 h-5 w-5" />
                {loading ? "Criando..." : "Criar Atividade"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong className="text-primary">📌 Visibilidade</strong>
                <br />
                <span className="text-muted-foreground">
                  Alunos e responsáveis terão acesso à atividade assim que for criada.
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong className="text-secondary">💡 Dica</strong>
                <br />
                <span className="text-muted-foreground">
                  Você pode anexar materiais de apoio na seção de Conteúdos.
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;
