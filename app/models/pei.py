from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PEI(Base):
    """Plano Educacional Individualizado"""
    __tablename__ = "peis"
    
    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id", ondelete="CASCADE"), nullable=False, index=True)
    elaborado_por_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date)
    objetivos = Column(Text, nullable=False)
    adaptacoes_curriculares = Column(Text)
    estrategias_ensino = Column(Text)
    recursos_necessarios = Column(Text)
    criterios_avaliacao = Column(Text)
    observacoes = Column(Text)
    ativo = Column(Integer, default=1)  # 1 = ativo, 0 = inativo
    
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    aluno = relationship("Aluno", back_populates="peis")
    elaborado_por = relationship("User")
    intervencoes = relationship("IntervencaoPedagogica", back_populates="pei")


class IntervencaoPedagogica(Base):
    """Registro de intervenções pedagógicas realizadas"""
    __tablename__ = "intervencoes_pedagogicas"
    
    id = Column(Integer, primary_key=True, index=True)
    pei_id = Column(Integer, ForeignKey("peis.id", ondelete="CASCADE"), nullable=False, index=True)
    professor_id = Column(Integer, ForeignKey("professores.id", ondelete="SET NULL"), nullable=True)
    
    data_intervencao = Column(Date, nullable=False)
    tipo_intervencao = Column(String)  # Individual, Grupo, Adaptação material, etc.
    descricao = Column(Text, nullable=False)
    resultados_observados = Column(Text)
    proximos_passos = Column(Text)
    
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    pei = relationship("PEI", back_populates="intervencoes")
    professor = relationship("Professor")

