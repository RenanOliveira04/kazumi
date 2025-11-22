from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Turma, Aluno, User, TipoUsuario
from app.schemas import TurmaCreate, TurmaUpdate, TurmaResponse, AlunoResponse
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/turmas", tags=["Turmas"])


@router.post("/", response_model=TurmaResponse, status_code=status.HTTP_201_CREATED)
async def create_turma(
    turma_data: TurmaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Cria uma nova turma"""
    # Verifica se o código já existe
    existing = db.query(Turma).filter(Turma.codigo == turma_data.codigo).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de turma já existe"
        )
    
    db_turma = Turma(**turma_data.model_dump())
    db.add(db_turma)
    db.commit()
    db.refresh(db_turma)
    
    return db_turma


@router.get("/", response_model=List[TurmaResponse])
async def list_turmas(
    skip: int = 0,
    limit: int = 100,
    ano_letivo: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista todas as turmas"""
    query = db.query(Turma)
    
    if ano_letivo:
        query = query.filter(Turma.ano_letivo == ano_letivo)
    
    turmas = query.offset(skip).limit(limit).all()
    return turmas


@router.get("/{turma_id}", response_model=TurmaResponse)
async def get_turma(
    turma_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retorna os detalhes de uma turma"""
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    return turma


@router.get("/{turma_id}/alunos", response_model=List[AlunoResponse])
async def list_alunos_turma(
    turma_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Lista todos os alunos de uma turma"""
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    alunos = db.query(Aluno).filter(Aluno.turma_id == turma_id).all()
    return alunos


@router.put("/{turma_id}", response_model=TurmaResponse)
async def update_turma(
    turma_id: int,
    turma_update: TurmaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Atualiza uma turma"""
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    update_data = turma_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(turma, field, value)
    
    db.commit()
    db.refresh(turma)
    return turma


@router.delete("/{turma_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_turma(
    turma_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Deleta uma turma"""
    turma = db.query(Turma).filter(Turma.id == turma_id).first()
    
    if not turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada"
        )
    
    db.delete(turma)
    db.commit()
    
    return None

