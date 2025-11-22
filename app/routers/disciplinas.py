from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Disciplina, User, TipoUsuario
from app.schemas import DisciplinaCreate, DisciplinaUpdate, DisciplinaResponse
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/disciplinas", tags=["Disciplinas"])


@router.post("/", response_model=DisciplinaResponse, status_code=status.HTTP_201_CREATED)
async def create_disciplina(
    disciplina_data: DisciplinaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Cria uma nova disciplina"""
    # Verifica se o código já existe
    existing = db.query(Disciplina).filter(Disciplina.codigo == disciplina_data.codigo).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de disciplina já existe"
        )
    
    db_disciplina = Disciplina(**disciplina_data.model_dump())
    db.add(db_disciplina)
    db.commit()
    db.refresh(db_disciplina)
    
    return db_disciplina


@router.get("/", response_model=List[DisciplinaResponse])
async def list_disciplinas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista todas as disciplinas"""
    disciplinas = db.query(Disciplina).offset(skip).limit(limit).all()
    return disciplinas


@router.get("/{disciplina_id}", response_model=DisciplinaResponse)
async def get_disciplina(
    disciplina_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retorna os detalhes de uma disciplina"""
    disciplina = db.query(Disciplina).filter(Disciplina.id == disciplina_id).first()
    
    if not disciplina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada"
        )
    
    return disciplina


@router.put("/{disciplina_id}", response_model=DisciplinaResponse)
async def update_disciplina(
    disciplina_id: int,
    disciplina_update: DisciplinaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Atualiza uma disciplina"""
    disciplina = db.query(Disciplina).filter(Disciplina.id == disciplina_id).first()
    
    if not disciplina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada"
        )
    
    update_data = disciplina_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(disciplina, field, value)
    
    db.commit()
    db.refresh(disciplina)
    return disciplina


@router.delete("/{disciplina_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_disciplina(
    disciplina_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Deleta uma disciplina"""
    disciplina = db.query(Disciplina).filter(Disciplina.id == disciplina_id).first()
    
    if not disciplina:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada"
        )
    
    db.delete(disciplina)
    db.commit()
    
    return None

