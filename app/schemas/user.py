from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from app.models.user import TipoUsuario


class UserBase(BaseModel):
    email: EmailStr
    nome_completo: str
    telefone: Optional[str] = None
    tipo_usuario: TipoUsuario


class UserCreate(UserBase):
    senha: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    nome_completo: Optional[str] = None
    telefone: Optional[str] = None
    senha: Optional[str] = Field(None, min_length=6)


class UserResponse(UserBase):
    id: int
    ativo: bool
    criado_em: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

