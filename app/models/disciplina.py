from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.professor import professor_disciplina


class Disciplina(Base):
    __tablename__ = "disciplinas"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, index=True)
    codigo = Column(String, unique=True, index=True)
    descricao = Column(Text)
    carga_horaria = Column(Integer)  # em horas
    
    # Relationships
    professores = relationship("Professor", secondary=professor_disciplina, back_populates="disciplinas")
    atividades = relationship("Atividade", back_populates="disciplina")

