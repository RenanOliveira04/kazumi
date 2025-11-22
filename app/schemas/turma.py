from pydantic import BaseModel
from typing import Optional
from app.models.turma import Turno


class TurmaBase(BaseModel):
    nome: str
    codigo: str
    ano_letivo: int
    serie: str
    turno: Turno
    capacidade: Optional[int] = None


class TurmaCreate(TurmaBase):
    pass


class TurmaUpdate(BaseModel):
    nome: Optional[str] = None
    codigo: Optional[str] = None
    ano_letivo: Optional[int] = None
    serie: Optional[str] = None
    turno: Optional[Turno] = None
    capacidade: Optional[int] = None


class TurmaResponse(TurmaBase):
    id: int
    
    class Config:
        from_attributes = True

