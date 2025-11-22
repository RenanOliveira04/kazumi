from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class GestorEscolar(Base):
    __tablename__ = "gestores_escolares"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    matricula = Column(String, unique=True, index=True)
    cargo = Column(String)  # Diretor, Coordenador, etc.
    departamento = Column(String)
    
    # Relationships
    user = relationship("User", backref="gestor", foreign_keys=[user_id])

