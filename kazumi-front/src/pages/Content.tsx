import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Volume2, Video, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ContentItem {
  id: number;
  title: string;
  type: "texto" | "audio" | "video";
  description: string;
  content: string;
  thumbnail?: string;
}

const Content = () => {
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

  const contents: ContentItem[] = [
    {
      id: 1,
      title: "Como apoiar o desenvolvimento da criança em casa",
      type: "texto",
      description: "Dicas práticas para criar um ambiente acolhedor e estimulante.",
      content: "Criar um ambiente acolhedor é fundamental para o desenvolvimento da criança. Algumas dicas incluem: estabelecer rotinas claras, criar espaços de aprendizado, valorizar conquistas pequenas e grandes, manter comunicação constante com a escola, e celebrar a individualidade do seu filho.",
    },
    {
      id: 2,
      title: "Entendendo as necessidades especiais",
      type: "audio",
      description: "Áudio educativo sobre como compreender e atender necessidades especiais.",
      content: "audio-placeholder.mp3",
    },
    {
      id: 3,
      title: "Atividades de inclusão em família",
      type: "video",
      description: "Vídeo demonstrativo de atividades que promovem inclusão.",
      content: "video-placeholder.mp4",
    },
    {
      id: 4,
      title: "Comunicação escola-família",
      type: "texto",
      description: "Como manter uma comunicação efetiva com a escola.",
      content: "A comunicação entre escola e família é essencial para o sucesso do aluno. Participe de reuniões, compartilhe observações sobre o desenvolvimento da criança em casa, tire dúvidas com os professores, e mantenha contato regular através de mensagens. Lembre-se: você é parte fundamental da equipe educacional!",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "texto":
        return <BookOpen className="h-5 w-5" />;
      case "audio":
        return <Volume2 className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "texto":
        return "Texto";
      case "audio":
        return "Áudio";
      case "video":
        return "Vídeo";
      default:
        return type;
    }
  };

  const handleReadText = (text: string) => {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "pt-BR";
    window.speechSynthesis.speak(msg);
    toast.info("Reproduzindo texto em áudio...");
  };

  const handleFeedback = (liked: boolean) => {
    toast.success(liked ? "Obrigado! Ficamos felizes que gostou!" : "Obrigado pelo feedback!");
    setSelectedContent(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Conteúdos Educativos
          </h1>
          <p className="text-muted-foreground mt-1">
            Materiais para apoiar a educação inclusiva
          </p>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-screen-lg mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contents.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedContent(item)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg flex-1">{item.title}</CardTitle>
                  <Badge variant="outline" className="shrink-0">
                    <span className="flex items-center gap-1">
                      {getTypeIcon(item.type)}
                      {getTypeLabel(item.type)}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content Details Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {getTypeIcon(selectedContent?.type || "")}
              {selectedContent?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {selectedContent?.type === "texto" && (
              <>
                <div className="prose prose-lg max-w-none">
                  <p className="text-base leading-relaxed">{selectedContent.content}</p>
                </div>
                <Button
                  onClick={() => handleReadText(selectedContent.content)}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Volume2 className="mr-2 h-5 w-5" />
                  Ouvir este conteúdo
                </Button>
              </>
            )}

            {selectedContent?.type === "audio" && (
              <div className="bg-muted rounded-lg p-8 text-center">
                <Volume2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Player de áudio (em desenvolvimento)
                </p>
                <Button size="lg">
                  Reproduzir Áudio
                </Button>
              </div>
            )}

            {selectedContent?.type === "video" && (
              <div className="bg-muted rounded-lg p-8 text-center aspect-video flex items-center justify-center">
                <div>
                  <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Player de vídeo (em desenvolvimento)
                  </p>
                  <Button size="lg">
                    Assistir Vídeo
                  </Button>
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="border-t pt-4">
              <p className="text-center mb-4 font-medium">Este conteúdo foi útil?</p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleFeedback(true)}
                  className="flex-1 max-w-xs"
                >
                  <ThumbsUp className="mr-2 h-5 w-5" />
                  Gostei
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleFeedback(false)}
                  className="flex-1 max-w-xs"
                >
                  <ThumbsDown className="mr-2 h-5 w-5" />
                  Não gostei
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Content;
