from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.schemas.user import UserResponse


class AlunoBase(BaseModel):
    matricula: str
    data_nascimento: Optional[date] = None
    necessidades_especiais: bool = False
    descricao_necessidades: Optional[str] = None
    pei_ativo: bool = False


class AlunoCreate(AlunoBase):
    user_id: int
    responsavel_id: Optional[int] = None
    turma_id: Optional[int] = None


class AlunoUpdate(BaseModel):
    data_nascimento: Optional[date] = None
    necessidades_especiais: Optional[bool] = None
    descricao_necessidades: Optional[str] = None
    pei_ativo: Optional[bool] = None
    responsavel_id: Optional[int] = None
    turma_id: Optional[int] = None


class AlunoResponse(AlunoBase):
    id: int
    user_id: int
    responsavel_id: Optional[int] = None
    turma_id: Optional[int] = None
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

