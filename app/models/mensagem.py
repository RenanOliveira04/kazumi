from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class TipoMidia(str, enum.Enum):
    TEXTO = "texto"
    AUDIO = "audio"
    VIDEO = "video"
    IMAGEM = "imagem"


class Mensagem(Base):
    __tablename__ = "mensagens"
    
    id = Column(Integer, primary_key=True, index=True)
    remetente_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destinatario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    assunto = Column(String, nullable=False)
    conteudo = Column(Text, nullable=False)
    tipo_midia = Column(SQLEnum(TipoMidia), default=TipoMidia.TEXTO)
    midia_url = Column(String)  # URL para áudio, vídeo ou imagem
    
    enviada_em = Column(DateTime(timezone=True), server_default=func.now())
    lida_em = Column(DateTime(timezone=True), nullable=True)
    confirmacao_leitura = Column(Boolean, default=False)
    
    # Relationships
    remetente = relationship("User", foreign_keys=[remetente_id])
    destinatario = relationship("User", foreign_keys=[destinatario_id])

