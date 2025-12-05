import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Mic, ThumbsUp, Heart, HandHeart, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { mensagensApi, Mensagem } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const Messages = () => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Polling for new messages every 10 seconds
    const interval = setInterval(loadMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      // Fetch both inbox and sent messages and merge them
      const [inboxRes, sentRes] = await Promise.all([
        mensagensApi.listInbox(),
        mensagensApi.listSent()
      ]);
      
      const allMessages = [...inboxRes.data, ...sentRes.data].sort((a, b) => 
        new Date(a.enviada_em).getTime() - new Date(b.enviada_em).getTime()
      );
      
      setMessages(allMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // For now, hardcoding a recipient (e.g., the first teacher or admin found, or a specific ID)
      // In a real app, you'd select the recipient. 
      // Assuming ID 1 is the school admin/coordinator for simplicity if user is not 1.
      // If user is 1, send to 2. This needs to be dynamic.
      // For this demo, let's assume we are replying to the last message's sender if exists, or a default ID.
      
      let recipientId = 1; // Default to admin
      if (messages.length > 0) {
        const lastReceived = messages.slice().reverse().find(m => m.destinatario_id === user?.id);
        if (lastReceived) {
          recipientId = lastReceived.remetente_id;
        }
      }
      
      // If I am the admin (id 1), send to... wait, I need a better logic.
      // Let's just say: if I am 'responsavel', I send to 'professor' or 'gestor'.
      // Since we don't have a contact list UI yet, I'll use a placeholder logic.
      // If I am user 1, I send to user 2. If I am user 2, I send to user 1.
      const targetId = user?.id === 1 ? 2 : 1;

      await mensagensApi.send({
        destinatario_id: targetId,
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
    // Optionally auto-send
    // await handleSendMessage(); 
    // But let's just set the text for now so user can confirm
  };

  const isMyMessage = (message: Mensagem) => {
    return message.remetente_id === user?.id;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-2xl font-bold">Mensagens</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comunicação com a escola
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-screen-lg mx-auto space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando mensagens...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhuma mensagem.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${!isMyMessage(message) ? "justify-start" : "justify-end"}`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    !isMyMessage(message)
                      ? "bg-card"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {isMyMessage(message) ? "Você" : message.remetente?.nome_completo || "Escola"}
                      </p>
                      <p className="text-base leading-relaxed">{message.conteudo}</p>
                      <div className="flex items-center gap-2 mt-2">
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
                  </div>
                </Card>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Reactions */}
      <div className="border-t border-border bg-card p-3">
        <div className="max-w-screen-lg mx-auto">
          <p className="text-sm text-muted-foreground mb-2">Reações rápidas:</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleQuickReaction("👍")}
              aria-label="Gostei"
            >
              <ThumbsUp className="h-5 w-5 mr-2" />
              Gostei
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleQuickReaction("❤️")}
              aria-label="Amei"
            >
              <Heart className="h-5 w-5 mr-2" />
              Amei
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleQuickReaction("🙏")}
              aria-label="Obrigado"
            >
              <HandHeart className="h-5 w-5 mr-2" />
              Obrigado
            </Button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-screen-lg mx-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={handleVoiceMessage}
            aria-label="Gravar mensagem de áudio"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="text-base h-12"
            aria-label="Campo de mensagem"
          />
          <Button
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={handleSendMessage}
            aria-label="Enviar mensagem"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
