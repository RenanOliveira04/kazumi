from pydantic import BaseModel
from typing import Optional
from datetime import date, time
from app.models.evento import TipoEvento


class EventoBase(BaseModel):
    turma_id: Optional[int] = None
    criado_por_id: Optional[int] = None
    titulo: str
    descricao: str
    tipo: TipoEvento = TipoEvento.OUTRO
    data_evento: date
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    local: Optional[str] = None
    publico_alvo: Optional[str] = None
    requer_confirmacao: int = 0


class EventoCreate(EventoBase):
    pass


class EventoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[TipoEvento] = None
    data_evento: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    local: Optional[str] = None
    publico_alvo: Optional[str] = None
    requer_confirmacao: Optional[int] = None


class EventoResponse(EventoBase):
    id: int
    
    class Config:
        from_attributes = True

