from pydantic import BaseModel
from typing import Optional
from datetime import date


class AvaliacaoBase(BaseModel):
    aluno_id: int
    disciplina_id: int
    professor_id: Optional[int] = None
    titulo: str
    tipo: Optional[str] = None
    nota: Optional[float] = None
    peso: float = 1.0
    data_avaliacao: date
    observacoes: Optional[str] = None


class AvaliacaoCreate(AvaliacaoBase):
    pass


class AvaliacaoUpdate(BaseModel):
    titulo: Optional[str] = None
    tipo: Optional[str] = None
    nota: Optional[float] = None
    peso: Optional[float] = None
    data_avaliacao: Optional[date] = None
    observacoes: Optional[str] = None


class AvaliacaoResponse(AvaliacaoBase):
    id: int
    
    class Config:
        from_attributes = True

