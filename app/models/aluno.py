from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Aluno(Base):
    __tablename__ = "alunos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    responsavel_id = Column(Integer, ForeignKey("responsaveis.id", ondelete="SET NULL"), nullable=True)
    turma_id = Column(Integer, ForeignKey("turmas.id", ondelete="SET NULL"), nullable=True)
    
    matricula = Column(String, unique=True, index=True, nullable=False)
    data_nascimento = Column(Date)
    necessidades_especiais = Column(Boolean, default=False)
    descricao_necessidades = Column(Text)
    pei_ativo = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", backref="aluno", foreign_keys=[user_id])
    responsavel = relationship("Responsavel", back_populates="alunos")
    turma = relationship("Turma", back_populates="alunos")
    peis = relationship("PEI", back_populates="aluno")
    avaliacoes = relationship("Avaliacao", back_populates="aluno")

