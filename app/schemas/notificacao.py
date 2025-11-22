from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.notificacao import TipoNotificacao


class NotificacaoBase(BaseModel):
    usuario_id: int
    titulo: str
    mensagem: str
    tipo: TipoNotificacao = TipoNotificacao.INFORMACAO
    link_referencia: Optional[str] = None


class NotificacaoCreate(NotificacaoBase):
    pass


class NotificacaoResponse(NotificacaoBase):
    id: int
    lida: bool
    criada_em: datetime
    lida_em: Optional[datetime] = None
    
    class Config:
        from_attributes = True

