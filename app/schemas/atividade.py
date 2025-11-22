from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class AtividadeBase(BaseModel):
    turma_id: int
    disciplina_id: int
    professor_id: Optional[int] = None
    titulo: str
    descricao: str
    tipo: Optional[str] = None
    data_entrega: date
    pontuacao_maxima: Optional[int] = None
    anexo_url: Optional[str] = None


class AtividadeCreate(AtividadeBase):
    pass


class AtividadeUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    data_entrega: Optional[date] = None
    pontuacao_maxima: Optional[int] = None
    anexo_url: Optional[str] = None


class AtividadeResponse(AtividadeBase):
    id: int
    data_criacao: datetime
    
    class Config:
        from_attributes = True


class EntregaAtividadeBase(BaseModel):
    atividade_id: int
    aluno_id: int
    observacoes: Optional[str] = None
    anexo_url: Optional[str] = None
    nota: Optional[int] = None
    concluida: bool = True


class EntregaAtividadeCreate(EntregaAtividadeBase):
    pass


class EntregaAtividadeResponse(EntregaAtividadeBase):
    id: int
    data_entrega: datetime
    
    class Config:
        from_attributes = True

