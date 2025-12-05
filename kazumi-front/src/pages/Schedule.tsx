import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { eventosApi, Evento } from "@/services/api";
import { toast } from "sonner";

const Schedule = () => {
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [filter, setFilter] = useState<"todos" | "reuniao" | "festa" | "apresentacao" | "palestra" | "excursao" | "outro">("todos");
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventosApi.list();
      setEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === "todos" 
    ? events 
    : events.filter(event => event.tipo === filter);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "reuniao":
        return "bg-warning text-warning-foreground";
      case "festa":
        return "bg-success text-success-foreground";
      case "apresentacao":
        return "bg-info text-info-foreground";
      case "palestra":
        return "bg-primary text-primary-foreground";
      case "excursao":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-primary" />
            Agenda Escolar
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe compromissos e eventos
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-screen-lg mx-auto p-4 md:p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={filter === "todos" ? "default" : "outline"}
            onClick={() => setFilter("todos")}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={filter === "reuniao" ? "default" : "outline"}
            onClick={() => setFilter("reuniao")}
            size="sm"
          >
            Reuniões
          </Button>
          <Button
            variant={filter === "festa" ? "default" : "outline"}
            onClick={() => setFilter("festa")}
            size="sm"
          >
            Festas
          </Button>
          <Button
            variant={filter === "apresentacao" ? "default" : "outline"}
            onClick={() => setFilter("apresentacao")}
            size="sm"
          >
            Apresentações
          </Button>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Carregando eventos...</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum evento encontrado.</p>
          ) : (
            filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEvent(event)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{event.titulo}</CardTitle>
                    <Badge className={getTypeColor(event.tipo)}>
                      {getTypeLabel(event.tipo)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(event.data_evento).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {event.hora_inicio && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.hora_inicio}</span>
                      </div>
                    )}
                    {event.local && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.local}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <DialogTitle className="text-xl">{selectedEvent?.titulo}</DialogTitle>
              <Badge className={getTypeColor(selectedEvent?.tipo || "")}>
                {getTypeLabel(selectedEvent?.tipo || "")}
              </Badge>
            </div>
            <DialogDescription className="text-base text-left space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <span>
                  {selectedEvent?.data_evento && 
                    new Date(selectedEvent.data_evento).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </span>
              </div>
              {selectedEvent?.hora_inicio && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{selectedEvent.hora_inicio}</span>
                </div>
              )}
              {selectedEvent?.local && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{selectedEvent.local}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <p className="font-semibold mb-2">Descrição:</p>
                <p>{selectedEvent?.descricao}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
