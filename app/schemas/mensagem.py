from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.mensagem import TipoMidia


class UserBasic(BaseModel):
    """Informações básicas do usuário para exibição em mensagens"""

    nome_completo: str
    tipo_usuario: str

    class Config:
        from_attributes = True


class MensagemBase(BaseModel):
    destinatario_id: int
    assunto: str
    conteudo: str
    tipo_midia: TipoMidia = TipoMidia.TEXTO
    midia_url: Optional[str] = None


class MensagemCreate(MensagemBase):
    pass


class MensagemBroadcast(BaseModel):
    destinatarios_ids: list[int]
    assunto: str
    conteudo: str
    tipo_midia: TipoMidia = TipoMidia.TEXTO
    midia_url: Optional[str] = None


class MensagemResponse(MensagemBase):
    id: int
    remetente_id: int
    enviada_em: datetime
    lida_em: Optional[datetime] = None
    confirmacao_leitura: bool
    remetente: Optional[UserBasic] = None

    class Config:
        from_attributes = True
