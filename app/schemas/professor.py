from pydantic import BaseModel
from typing import Optional, List
from app.schemas.user import UserResponse


class ProfessorBase(BaseModel):
    matricula: Optional[str] = None
    formacao: Optional[str] = None
    especializacao: Optional[str] = None


class ProfessorCreate(ProfessorBase):
    user_id: int


class ProfessorUpdate(ProfessorBase):
    pass


class ProfessorResponse(ProfessorBase):
    id: int
    user_id: int
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

