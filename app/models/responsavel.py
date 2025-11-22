from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class NivelLiteraciaDigital(str, enum.Enum):
    BAIXO = "baixo"
    MEDIO = "medio"
    ALTO = "alto"


class Responsavel(Base):
    __tablename__ = "responsaveis"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    cpf = Column(String, unique=True, index=True)
    parentesco = Column(String)  # Mãe, Pai, Avó, Tutor, etc.
    literacia_digital = Column(SQLEnum(NivelLiteraciaDigital), default=NivelLiteraciaDigital.MEDIO)
    preferencia_audio = Column(Boolean, default=False)
    preferencia_video = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", backref="responsavel", foreign_keys=[user_id])
    alunos = relationship("Aluno", back_populates="responsavel")

