import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Calendar, BookOpen, TrendingUp, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { notificacoesApi, mensagensApi, eventosApi, alunosApi } from "@/services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [nextEvent, setNextEvent] = useState<{ title: string; time: string } | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load notifications count - don't show error if endpoint fails
      try {
        const notifResponse = await notificacoesApi.list();
        const unreadNotif = notifResponse.data.filter((n) => !n.lida).length;
        setUnreadNotifications(unreadNotif);
      } catch (error) {
        console.log("Notifications not available yet");
        setUnreadNotifications(0);
      }

      // Load messages count - don't show error if endpoint fails
      try {
        const messagesResponse = await mensagensApi.listInbox();
        const unreadMsg = messagesResponse.data.filter((m) => !m.lida_em).length;
        setUnreadMessages(unreadMsg);
      } catch (error) {
        console.log("Messages not available yet");
        setUnreadMessages(0);
      }

      // Load next event - don't show error if no events
      try {
        const eventsResponse = await eventosApi.list();
        const upcomingEvents = eventsResponse.data
          .filter((e) => new Date(e.data_evento) >= new Date())
          .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime());
        
        if (upcomingEvents.length > 0) {
          const event = upcomingEvents[0];
          const eventDate = new Date(event.data_evento);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          let timeText = eventDate.toLocaleDateString("pt-BR");
          if (eventDate.toDateString() === tomorrow.toDateString()) {
            timeText = "amanhã";
          }
          if (event.hora_inicio) {
            timeText += ` às ${event.hora_inicio}`;
          }
          
          setNextEvent({ title: event.titulo, time: timeText });
        }
      } catch (error) {
        console.log("Events not available yet");
        setNextEvent(null);
      }

      // Load students (for responsavel/professor) - don't show error if no students
      if (user?.tipo_usuario === "responsavel" || user?.tipo_usuario === "professor") {
        try {
          const studentsResponse = await alunosApi.list();
          setStudents(studentsResponse.data || []);
        } catch (error) {
          console.log("Students not available yet");
          setStudents([]);
        }
      }
    } catch (error) {
      console.error("Unexpected error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get first student for progress display (for responsaveis)
  const firstStudent = students.length > 0 ? students[0] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Olá, {user?.nome_completo?.split(" ")[0] || "Usuário"}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {user?.tipo_usuario === "responsavel" && "Acompanhe o desenvolvimento do seu filho"}
                {user?.tipo_usuario === "professor" && "Gerencie suas turmas e alunos"}
                {user?.tipo_usuario === "gestor" && "Visão geral da escola"}
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="relative h-12 w-12"
              aria-label="Notificações"
              asChild
            >
              <Link to="/notificacoes">
                <Bell className="h-6 w-6" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-screen-lg mx-auto p-4 md:p-6 space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando...</p>
        ) : (
          <>
            {/* Register Student Prompt - Only for responsaveis without students */}
            {user?.tipo_usuario === "responsavel" && students.length === 0 && (
              <section className="mb-6">
                <Card className="border-2 border-primary/50 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Cadastre seu Filho/Aluno
                    </CardTitle>
                    <CardDescription>
                      Você ainda não possui nenhum aluno cadastrado. Cadastre agora para acompanhar o desenvolvimento educacional.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/cadastrar-aluno">
                      <Button className="w-full" size="lg">
                        Cadastrar Aluno Agora
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Quick Actions */}
            <section aria-labelledby="quick-actions">
              <h2 id="quick-actions" className="text-xl font-semibold mb-4">
                Acesso Rápido
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/mensagens">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div>Mensagens</div>
                          <div className="text-sm font-normal text-muted-foreground mt-1">
                            {unreadMessages > 0 
                              ? `${unreadMessages} ${unreadMessages === 1 ? "nova mensagem" : "novas mensagens"}`
                              : "Nenhuma mensagem nova"}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>

                <Link to="/agenda">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-secondary">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-secondary/10">
                          <Calendar className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <div>Agenda</div>
                          <div className="text-sm font-normal text-muted-foreground mt-1">
                            {nextEvent ? `${nextEvent.title} ${nextEvent.time}` : "Nenhum evento próximo"}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </section>

            {/* Progress Summary - Only for responsaveis with students */}
            {user?.tipo_usuario === "responsavel" && firstStudent && (
              <section aria-labelledby="progress-summary">
                <h2 id="progress-summary" className="text-xl font-semibold mb-4">
                  Resumo de Desenvolvimento
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Progresso de {firstStudent.user?.nome_completo || "Aluno"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Dados de progresso serão carregados em breve. Acompanhe as métricas de desempenho do aluno.
                    </p>
                    
                    <div className="pt-2">
                      <Link to="/aluno">
                        <Button variant="outline" className="w-full">Ver Detalhes do PEI</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Resources */}
            <section aria-labelledby="resources">
              <h2 id="resources" className="text-xl font-semibold mb-4">
                Conteúdos Recomendados
              </h2>
              <Link to="/conteudos">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-info/10">
                        <BookOpen className="h-6 w-6 text-info" />
                      </div>
                      <div>
                        <div>Materiais Educativos</div>
                        <div className="text-sm font-normal text-muted-foreground mt-1">
                          Explore recursos educacionais
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
