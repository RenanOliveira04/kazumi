from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Atividade(Base):
    __tablename__ = "atividades"
    
    id = Column(Integer, primary_key=True, index=True)
    turma_id = Column(Integer, ForeignKey("turmas.id", ondelete="CASCADE"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id", ondelete="CASCADE"), nullable=False)
    professor_id = Column(Integer, ForeignKey("professores.id", ondelete="SET NULL"), nullable=True)
    
    titulo = Column(String, nullable=False, index=True)
    descricao = Column(Text, nullable=False)
    tipo = Column(String)  # Tarefa de casa, Trabalho em grupo, Pesquisa, etc.
    data_criacao = Column(DateTime(timezone=True), server_default=func.now())
    data_entrega = Column(Date, nullable=False)
    pontuacao_maxima = Column(Integer)
    anexo_url = Column(String)  # URL para material de apoio
    
    # Relationships
    turma = relationship("Turma", back_populates="atividades")
    disciplina = relationship("Disciplina", back_populates="atividades")
    professor = relationship("Professor")
    entregas = relationship("EntregaAtividade", back_populates="atividade")


class EntregaAtividade(Base):
    __tablename__ = "entregas_atividades"
    
    id = Column(Integer, primary_key=True, index=True)
    atividade_id = Column(Integer, ForeignKey("atividades.id", ondelete="CASCADE"), nullable=False)
    aluno_id = Column(Integer, ForeignKey("alunos.id", ondelete="CASCADE"), nullable=False)
    
    data_entrega = Column(DateTime(timezone=True), server_default=func.now())
    observacoes = Column(Text)
    anexo_url = Column(String)
    nota = Column(Integer)
    concluida = Column(Boolean, default=True)
    
    # Relationships
    atividade = relationship("Atividade", back_populates="entregas")
    aluno = relationship("Aluno")

