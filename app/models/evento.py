from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class TipoEvento(str, enum.Enum):
    REUNIAO = "reuniao"
    FESTA = "festa"
    APRESENTACAO = "apresentacao"
    PALESTRA = "palestra"
    EXCURSAO = "excursao"
    OUTRO = "outro"


class EventoEscolar(Base):
    __tablename__ = "eventos_escolares"
    
    id = Column(Integer, primary_key=True, index=True)
    turma_id = Column(Integer, ForeignKey("turmas.id", ondelete="CASCADE"), nullable=True)
    criado_por_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    titulo = Column(String, nullable=False, index=True)
    descricao = Column(Text, nullable=False)
    tipo = Column(SQLEnum(TipoEvento), default=TipoEvento.OUTRO)
    
    data_evento = Column(Date, nullable=False, index=True)
    hora_inicio = Column(Time)
    hora_fim = Column(Time)
    local = Column(String)
    
    publico_alvo = Column(String)  # Todos, Pais, Alunos específicos, etc.
    requer_confirmacao = Column(Integer, default=0)  # 0 = não, 1 = sim
    
    # Relationships
    turma = relationship("Turma", back_populates="eventos")
    criado_por = relationship("User")

