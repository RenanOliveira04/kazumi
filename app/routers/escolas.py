from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.escola import Escola
from app.models import User, TipoUsuario
from app.schemas.escola import EscolaCreate, EscolaUpdate, EscolaResponse
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/escolas", tags=["Escolas"])


@router.post("/", response_model=EscolaResponse, status_code=status.HTTP_201_CREATED)
async def create_escola(
    escola_data: EscolaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Cria uma nova escola"""
    # Verifica se já existe escola com mesmo nome
    existing = db.query(Escola).filter(Escola.nome == escola_data.nome).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma escola com este nome",
        )

    db_escola = Escola(**escola_data.model_dump())
    db.add(db_escola)
    db.commit()
    db.refresh(db_escola)

    return db_escola


@router.get("/", response_model=List[EscolaResponse])
async def list_escolas(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lista todas as escolas"""
    escolas = db.query(Escola).offset(skip).limit(limit).all()
    return escolas


@router.get("/{escola_id}", response_model=EscolaResponse)
async def get_escola(
    escola_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retorna os detalhes de uma escola"""
    escola = db.query(Escola).filter(Escola.id == escola_id).first()

    if not escola:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Escola não encontrada"
        )

    return escola


@router.put("/{escola_id}", response_model=EscolaResponse)
async def update_escola(
    escola_id: int,
    escola_update: EscolaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Atualiza uma escola"""
    escola = db.query(Escola).filter(Escola.id == escola_id).first()

    if not escola:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Escola não encontrada"
        )

    update_data = escola_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(escola, field, value)

    db.commit()
    db.refresh(escola)
    return escola


@router.delete("/{escola_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_escola(
    escola_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Deleta uma escola"""
    escola = db.query(Escola).filter(Escola.id == escola_id).first()

    if not escola:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Escola não encontrada"
        )

    db.delete(escola)
    db.commit()

    return None


@router.get("/{escola_id}/turmas")
async def list_turmas_by_escola(
    escola_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lista todas as turmas de uma escola"""
    from app.models.turma import Turma

    escola = db.query(Escola).filter(Escola.id == escola_id).first()
    if not escola:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Escola não encontrada"
        )

    turmas = db.query(Turma).filter(Turma.escola_id == escola_id).all()
    return turmas
