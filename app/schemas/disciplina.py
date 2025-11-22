from pydantic import BaseModel
from typing import Optional


class DisciplinaBase(BaseModel):
    nome: str
    codigo: str
    descricao: Optional[str] = None
    carga_horaria: Optional[int] = None


class DisciplinaCreate(DisciplinaBase):
    pass


class DisciplinaUpdate(BaseModel):
    nome: Optional[str] = None
    codigo: Optional[str] = None
    descricao: Optional[str] = None
    carga_horaria: Optional[int] = None


class DisciplinaResponse(DisciplinaBase):
    id: int
    
    class Config:
        from_attributes = True

