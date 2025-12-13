from sqlalchemy import Column, Integer, String, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.database import Base
from app.models.professor import professor_turma


class Turno(str, enum.Enum):
    MATUTINO = "matutino"
    VESPERTINO = "vespertino"
    NOTURNO = "noturno"


class Turma(Base):
    __tablename__ = "turmas"

    id = Column(Integer, primary_key=True, index=True)
    escola_id = Column(Integer, ForeignKey("escolas.id"), nullable=True, index=True)
    nome = Column(String, nullable=False, index=True)  # ex: 7º Ano A
    codigo = Column(String, unique=True, index=True)
    ano_letivo = Column(Integer, nullable=False)
    serie = Column(String, nullable=False)  # 1º ano, 2º ano, etc.
    turno = Column(SQLEnum(Turno), nullable=False)
    capacidade = Column(Integer)

    # Relationships
    escola = relationship("Escola", back_populates="turmas", lazy="selectin")
    alunos = relationship("Aluno", back_populates="turma")
    professores = relationship(
        "Professor", secondary=professor_turma, back_populates="turmas"
    )
    atividades = relationship("Atividade", back_populates="turma")
    eventos = relationship("EventoEscolar", back_populates="turma")
