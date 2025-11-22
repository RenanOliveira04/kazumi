from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class TipoUsuario(str, enum.Enum):
    PROFESSOR = "professor"
    RESPONSAVEL = "responsavel"
    ALUNO = "aluno"
    GESTOR = "gestor"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    nome_completo = Column(String, nullable=False)
    telefone = Column(String)
    tipo_usuario = Column(SQLEnum(TipoUsuario), nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    deletado_em = Column(DateTime(timezone=True), nullable=True)  # soft delete

