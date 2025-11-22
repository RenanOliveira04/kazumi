from pydantic import BaseModel
from typing import Optional
from app.schemas.user import UserResponse


class GestorBase(BaseModel):
    matricula: Optional[str] = None
    cargo: Optional[str] = None
    departamento: Optional[str] = None


class GestorCreate(GestorBase):
    user_id: int


class GestorUpdate(GestorBase):
    pass


class GestorResponse(GestorBase):
    id: int
    user_id: int
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

