from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TipoNotificacao(str, enum.Enum):
    AVISO = "aviso"
    LEMBRETE = "lembrete"
    ALERTA = "alerta"
    INFORMACAO = "informacao"


class Notificacao(Base):
    __tablename__ = "notificacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    titulo = Column(String, nullable=False)
    mensagem = Column(Text, nullable=False)
    tipo = Column(SQLEnum(TipoNotificacao), default=TipoNotificacao.INFORMACAO)
    link_referencia = Column(String)  # URL ou ID de referência
    
    lida = Column(Boolean, default=False)
    criada_em = Column(DateTime(timezone=True), server_default=func.now())
    lida_em = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    usuario = relationship("User")

