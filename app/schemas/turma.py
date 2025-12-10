from pydantic import BaseModel
from typing import Optional
from app.models.turma import Turno
from app.schemas.escola import EscolaResponse


class TurmaBase(BaseModel):
    nome: str
    codigo: str
    ano_letivo: int
    serie: str
    turno: Turno
    escola_id: Optional[int] = None
    capacidade: Optional[int] = None


class TurmaCreate(TurmaBase):
    pass


class TurmaUpdate(BaseModel):
    nome: Optional[str] = None
    codigo: Optional[str] = None
    ano_letivo: Optional[int] = None
    serie: Optional[str] = None
    turno: Optional[Turno] = None
    escola_id: Optional[int] = None
    capacidade: Optional[int] = None


class TurmaResponse(TurmaBase):
    id: int
    escola: Optional[EscolaResponse] = None

    class Config:
        from_attributes = True
