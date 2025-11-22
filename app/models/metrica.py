from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MetricaEngajamento(Base):
    __tablename__ = "metricas_engajamento"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    acao = Column(String, nullable=False, index=True)  # login, visualizar_mensagem, enviar_mensagem, etc.
    categoria = Column(String, index=True)  # comunicacao, atividade, avaliacao, etc.
    referencia_id = Column(Integer)  # ID do objeto relacionado (mensagem_id, atividade_id, etc.)
    referencia_tipo = Column(String)  # tipo do objeto (mensagem, atividade, etc.)
    
    tempo_sessao = Column(Float)  # tempo em segundos
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Metadados adicionais
    dispositivo = Column(String)  # mobile, desktop, tablet
    navegador = Column(String)
    
    # Relationships
    usuario = relationship("User")

