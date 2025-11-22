from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Avaliacao(Base):
    __tablename__ = "avaliacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    aluno_id = Column(Integer, ForeignKey("alunos.id", ondelete="CASCADE"), nullable=False)
    disciplina_id = Column(Integer, ForeignKey("disciplinas.id", ondelete="CASCADE"), nullable=False)
    professor_id = Column(Integer, ForeignKey("professores.id", ondelete="SET NULL"), nullable=True)
    
    titulo = Column(String, nullable=False)
    tipo = Column(String)  # Prova, Trabalho, Apresentação, etc.
    nota = Column(Float)
    peso = Column(Float, default=1.0)
    data_avaliacao = Column(Date, nullable=False)
    observacoes = Column(Text)
    
    # Relationships
    aluno = relationship("Aluno", back_populates="avaliacoes")
    disciplina = relationship("Disciplina")
    professor = relationship("Professor")

