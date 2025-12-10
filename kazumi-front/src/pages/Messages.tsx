import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Mic, 
  ThumbsUp, 
  Heart, 
  HandHeart, 
  CheckCheck, 
  School as SchoolIcon,
  Users,
  User,
  ChevronRight,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { 
  mensagensApi, 
  escolasApi, 
  turmasApi,
  type Mensagem, 
  type Escola,
  type Turma 
} from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface Contact {
  id: number;
  user_id: number;
  nome_completo: string;
  email: string;
  tipo: 'professor' | 'responsavel';
  telefone?: string;
}

interface AxiosError {
  response?: {
    status: number;
    data?: unknown;
  };
}

interface ProfessorContact {
  id: number;
  user_id: number;
  nome_completo: string;
  email: string;
  matricula: string;
  formacao: string;
}

interface ResponsavelContact {
  id: number;
  user_id: number;
  nome_completo: string;
  email: string;
  telefone?: string;
  parentesco: string;
  alunos: Array<{
    id: number;
    nome: string;
    matricula: string;
  }>;
}

const Messages = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hierarchical selection state
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [selectedEscola, setSelectedEscola] = useState<string>("");
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurma, setSelectedTurma] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadEscolas();
    loadMessages();
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load turmas when escola changes
  useEffect(() => {
    if (selectedEscola) {
      loadTurmas(parseInt(selectedEscola));
      setSelectedTurma("");
      setSelectedContact(null);
      setContacts([]);
    }
  }, [selectedEscola]);

  // Load contacts when turma changes
  useEffect(() => {
    if (selectedTurma) {
      loadContacts(parseInt(selectedTurma));
      setSelectedContact(null);
    }
  }, [selectedTurma]);

  // Reload messages when contact changes
  useEffect(() => {
    if (selectedContact) {
      loadMessages();
    }
  }, [selectedContact]);

  const loadEscolas = async () => {
    try {
      const response = await escolasApi.list();
      setEscolas(response.data || []);
      if ((response.data || []).length === 0) {
        toast.info("Nenhuma escola encontrada");
      }
    } catch (error: unknown) {
      console.error("Error loading escolas:", error);
      setEscolas([]);
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 403) {
        toast.error("Você não tem permissão para acessar escolas");
      } else {
        toast.error("Erro ao carregar escolas");
      }
    }
  };

  const loadTurmas = async (escolaId: number) => {
    try {
      const response = await escolasApi.getTurmas(escolaId);
      setTurmas(response.data || []);
      if ((response.data || []).length === 0) {
        toast.info("Nenhuma turma encontrada para esta escola");
      }
    } catch (error: unknown) {
      console.error("Error loading turmas:", error);
      setTurmas([]);
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 404) {
        toast.error("Escola não encontrada");
      } else if (axiosError?.response?.status === 403) {
        toast.error("Você não tem permissão para acessar turmas desta escola");
      } else {
        toast.error("Erro ao carregar turmas");
      }
    }
  };

  const loadContacts = async (turmaId: number) => {
    try {
      const [professoresRes, responsaveisRes] = await Promise.all([
        turmasApi.getProfessores(turmaId),
        turmasApi.getResponsaveis(turmaId)
      ]);

      const professores = (professoresRes.data || []).map((p: ProfessorContact) => ({
        ...p,
        tipo: 'professor' as const
      }));

      const responsaveis = (responsaveisRes.data || []).map((r: ResponsavelContact) => ({
        ...r,
        tipo: 'responsavel' as const
      }));

      const allContacts = [...professores, ...responsaveis];
      setContacts(allContacts);
      
      if (allContacts.length === 0) {
        toast.info("Nenhum contato encontrado para esta turma");
      }
    } catch (error: unknown) {
      console.error("Error loading contacts:", error);
      setContacts([]);
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 404) {
        toast.error("Turma não encontrada");
      } else if (axiosError?.response?.status === 403) {
        toast.error("Você não tem permissão para acessar contatos desta turma");
      } else {
        toast.error("Erro ao carregar contatos");
      }
    }
  };

  const loadMessages = async () => {
    if (!selectedContact) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const [inboxRes, sentRes] = await Promise.all([
        mensagensApi.listInbox(),
        mensagensApi.listSent()
      ]);

      // Filter messages for selected contact
      const allMessages = [...inboxRes.data, ...sentRes.data].filter(
        (msg) =>
          (msg.remetente_id === selectedContact.user_id && msg.destinatario_id === user?.id) ||
          (msg.destinatario_id === selectedContact.user_id && msg.remetente_id === user?.id)
      ).sort((a, b) => 
        new Date(a.enviada_em).getTime() - new Date(b.enviada_em).getTime()
      );

      setMessages(allMessages);
    } catch (error: unknown) {
      console.error("Error loading messages:", error);
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 403) {
        toast.error("Você não tem permissão para acessar mensagens");
      } else {
        toast.error("Erro ao carregar mensagens");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) {
      toast.error("Selecione um contato antes de enviar mensagem");
      return;
    }

    try {
      await mensagensApi.send({
        destinatario_id: selectedContact.user_id,
        assunto: "Nova mensagem",
        conteudo: newMessage,
        tipo_midia: "texto"
      });

      setNewMessage("");
      loadMessages();
      toast.success("Mensagem enviada!");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem");
    }
  };

  const handleVoiceMessage = () => {
    toast.info("Gravação de áudio em desenvolvimento");
  };

  const handleQuickReaction = async (emoji: string) => {
    setNewMessage(emoji);
  };

  const isMyMessage = (message: Mensagem) => {
    return message.remetente_id === user?.id;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Mensagens
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comunicação com a escola
          </p>
        </div>
      </header>

      {/* Hierarchical Selection Panel */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-screen-lg mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Step 1: Select Escola */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <SchoolIcon className="h-4 w-4 text-primary" />
                <span>1. Selecione a Escola</span>
              </div>
              <Select value={selectedEscola} onValueChange={setSelectedEscola}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher escola..." />
                </SelectTrigger>
                <SelectContent>
                  {escolas.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      Nenhuma escola disponível
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

            {/* Step 2: Select Turma */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" />
                <span>2. Selecione a Turma</span>
              </div>
              <Select 
                value={selectedTurma} 
                onValueChange={setSelectedTurma}
                disabled={!selectedEscola}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher turma..." />
                </SelectTrigger>
                <SelectContent>
                  {turmas.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      {selectedEscola ? "Nenhuma turma disponível" : "Selecione uma escola primeiro"}
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

            {/* Step 3: Select Contact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-primary" />
                <span>3. Selecione o Contato</span>
              </div>
              <Select 
                value={selectedContact?.id.toString() || ""} 
                onValueChange={(value) => {
                  const contact = contacts.find(c => c.id.toString() === value);
                  setSelectedContact(contact || null);
                }}
                disabled={!selectedTurma}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolher contato..." />
                </SelectTrigger>
                <SelectContent>
                  {contacts.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      {selectedTurma ? "Nenhum contato disponível" : "Selecione uma turma primeiro"}
                    </SelectItem>
                  ) : (
                    contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        <div className="flex items-center gap-2">
                          {contact.nome_completo}
                          <Badge variant={contact.tipo === 'professor' ? 'default' : 'secondary'} className="text-xs">
                            {contact.tipo === 'professor' ? 'Professor' : 'Responsável'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Contact Info */}
          {selectedContact && (
            <>
              <Separator className="my-4" />
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(selectedContact.nome_completo)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{selectedContact.nome_completo}</h3>
                      <p className="text-sm text-muted-foreground">{selectedContact.email}</p>
                    </div>
                    <Badge variant={selectedContact.tipo === 'professor' ? 'default' : 'secondary'}>
                      {selectedContact.tipo === 'professor' ? 'Professor' : 'Responsável'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-screen-lg mx-auto space-y-4">
          {!selectedContact ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Selecione um contato para iniciar a conversa</p>
                <p className="text-sm mt-1">
                  Escolha uma escola, turma e depois selecione um professor ou responsável
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <p className="text-center text-muted-foreground">Carregando mensagens...</p>
          ) : messages.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma mensagem ainda</p>
                <p className="text-sm mt-1">
                  Seja o primeiro a enviar uma mensagem para {selectedContact.nome_completo}
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${!isMyMessage(message) ? "justify-start" : "justify-end"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${isMyMessage(message) ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className={isMyMessage(message) ? "bg-primary" : "bg-secondary"}>
                      {getInitials(isMyMessage(message) ? user?.nome_completo || "U" : selectedContact.nome_completo)}
                    </AvatarFallback>
                  </Avatar>
                  <Card
                    className={`p-4 ${
                      !isMyMessage(message)
                        ? "bg-card"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold text-sm">
                        {isMyMessage(message) ? "Você" : selectedContact.nome_completo}
                      </p>
                      <p className="text-base leading-relaxed">{message.conteudo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.enviada_em)}
                        </span>
                        {isMyMessage(message) && (
                          <CheckCheck
                            className={`h-4 w-4 ${
                              message.lida_em ? "text-success" : "opacity-50"
                            }`}
                            aria-label={message.lida_em ? "Lida" : "Enviada"}
                          />
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Reactions */}
      {selectedContact && (
        <div className="border-t border-border bg-card p-3">
          <div className="max-w-screen-lg mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Reações rápidas:</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickReaction("👍")}
                aria-label="Gostei"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Gostei
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickReaction("❤️")}
                aria-label="Amei"
              >
                <Heart className="h-4 w-4 mr-2" />
                Amei
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickReaction("🙏")}
                aria-label="Obrigado"
              >
                <HandHeart className="h-4 w-4 mr-2" />
                Obrigado
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-screen-lg mx-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={handleVoiceMessage}
            aria-label="Gravar mensagem de áudio"
            disabled={!selectedContact}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            placeholder={selectedContact ? "Digite sua mensagem..." : "Selecione um contato primeiro..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="text-base h-12"
            aria-label="Campo de mensagem"
            disabled={!selectedContact}
          />
          <Button
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={handleSendMessage}
            aria-label="Enviar mensagem"
            disabled={!selectedContact || !newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
