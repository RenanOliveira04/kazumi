from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base


# Tabela de associação professor-disciplina
professor_disciplina = Table(
    'professor_disciplina',
    Base.metadata,
    Column('professor_id', Integer, ForeignKey('professores.id', ondelete='CASCADE')),
    Column('disciplina_id', Integer, ForeignKey('disciplinas.id', ondelete='CASCADE'))
)

# Tabela de associação professor-turma
professor_turma = Table(
    'professor_turma',
    Base.metadata,
    Column('professor_id', Integer, ForeignKey('professores.id', ondelete='CASCADE')),
    Column('turma_id', Integer, ForeignKey('turmas.id', ondelete='CASCADE'))
)


class Professor(Base):
    __tablename__ = "professores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    matricula = Column(String, unique=True, index=True)
    formacao = Column(String)
    especializacao = Column(String)
    
    # Relationships
    user = relationship("User", backref="professor", foreign_keys=[user_id])
    disciplinas = relationship("Disciplina", secondary=professor_disciplina, back_populates="professores")
    turmas = relationship("Turma", secondary=professor_turma, back_populates="professores")

