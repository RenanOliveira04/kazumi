from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EscolaBase(BaseModel):
    nome: str
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None


class EscolaCreate(EscolaBase):
    pass


class EscolaUpdate(BaseModel):
    nome: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None


class EscolaResponse(EscolaBase):
    id: int
    criado_em: datetime

    class Config:
        from_attributes = True
