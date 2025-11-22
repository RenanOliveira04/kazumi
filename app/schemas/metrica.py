from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MetricaEngajamentoBase(BaseModel):
    usuario_id: int
    acao: str
    categoria: Optional[str] = None
    referencia_id: Optional[int] = None
    referencia_tipo: Optional[str] = None
    tempo_sessao: Optional[float] = None
    dispositivo: Optional[str] = None
    navegador: Optional[str] = None


class MetricaEngajamentoCreate(MetricaEngajamentoBase):
    pass


class MetricaEngajamentoResponse(MetricaEngajamentoBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

