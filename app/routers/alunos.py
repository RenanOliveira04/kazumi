from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Aluno, User, TipoUsuario, Responsavel
from app.schemas import AlunoCreate, AlunoUpdate, AlunoResponse
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/alunos", tags=["Alunos"])


@router.post("/", response_model=AlunoResponse, status_code=status.HTTP_201_CREATED)
async def create_aluno(
    aluno_data: AlunoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.RESPONSAVEL)
    ),
):
    """Cria um novo aluno"""
    # Check if matricula already exists
    existing = db.query(Aluno).filter(Aluno.matricula == aluno_data.matricula).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Matrícula já existe"
        )

    db_aluno = Aluno(**aluno_data.model_dump())
    db.add(db_aluno)
    db.commit()
    db.refresh(db_aluno)

    return db_aluno


@router.get("/", response_model=List[AlunoResponse])
async def list_alunos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lista alunos - filtrados por responsável se for o tipo de usuário"""
    # If user is responsavel, only show their students
    if current_user.tipo_usuario == TipoUsuario.RESPONSAVEL:
        responsavel = (
            db.query(Responsavel).filter(Responsavel.user_id == current_user.id).first()
        )
        if not responsavel:
            return []

        alunos = (
            db.query(Aluno)
            .filter(Aluno.responsavel_id == responsavel.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        return alunos

    # Otherwise show all alunos (for gestor/professor)
    alunos = db.query(Aluno).offset(skip).limit(limit).all()
    return alunos


@router.get("/{aluno_id}", response_model=AlunoResponse)
async def get_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retorna os detalhes de um aluno"""
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()

    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado"
        )

    # If user is responsavel, check if they own this student
    if current_user.tipo_usuario == TipoUsuario.RESPONSAVEL:
        responsavel = (
            db.query(Responsavel).filter(Responsavel.user_id == current_user.id).first()
        )
        if not responsavel or aluno.responsavel_id != responsavel.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso negado a este aluno",
            )

    return aluno


@router.put("/{aluno_id}", response_model=AlunoResponse)
async def update_aluno(
    aluno_id: int,
    aluno_update: AlunoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Atualiza um aluno"""
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()

    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado"
        )

    update_data = aluno_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(aluno, field, value)

    db.commit()
    db.refresh(aluno)
    return aluno


@router.delete("/{aluno_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Deleta um aluno"""
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()

    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado"
        )

    db.delete(aluno)
    db.commit()

    return None
