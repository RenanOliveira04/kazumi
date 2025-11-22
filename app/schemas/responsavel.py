from pydantic import BaseModel
from typing import Optional
from app.models.responsavel import NivelLiteraciaDigital
from app.schemas.user import UserResponse


class ResponsavelBase(BaseModel):
    cpf: Optional[str] = None
    parentesco: Optional[str] = None
    literacia_digital: NivelLiteraciaDigital = NivelLiteraciaDigital.MEDIO
    preferencia_audio: bool = False
    preferencia_video: bool = False


class ResponsavelCreate(ResponsavelBase):
    user_id: int


class ResponsavelUpdate(ResponsavelBase):
    pass


class ResponsavelResponse(ResponsavelBase):
    id: int
    user_id: int
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

