from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Atividade, EntregaAtividade, User, TipoUsuario, Aluno, Professor
from app.schemas import (
    AtividadeCreate, AtividadeUpdate, AtividadeResponse,
    EntregaAtividadeCreate, EntregaAtividadeResponse
)
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/atividades", tags=["Atividades"])


@router.post("/", response_model=AtividadeResponse, status_code=status.HTTP_201_CREATED)
async def create_atividade(
    atividade_data: AtividadeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Cria uma nova atividade/tarefa"""
    db_atividade = Atividade(**atividade_data.model_dump())
    
    # Se não especificado, define o professor atual
    if not db_atividade.professor_id and current_user.tipo_usuario == TipoUsuario.PROFESSOR:
        professor = db.query(Professor).filter(Professor.user_id == current_user.id).first()
        if professor:
            db_atividade.professor_id = professor.id
    
    db.add(db_atividade)
    db.commit()
    db.refresh(db_atividade)
    
    return db_atividade


@router.get("/", response_model=List[AtividadeResponse])
async def list_atividades(
    skip: int = 0,
    limit: int = 100,
    turma_id: Optional[int] = None,
    disciplina_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista atividades com filtros opcionais"""
    query = db.query(Atividade)
    
    if turma_id:
        query = query.filter(Atividade.turma_id == turma_id)
    
    if disciplina_id:
        query = query.filter(Atividade.disciplina_id == disciplina_id)
    
    # Se for aluno, filtra pelas atividades da turma dele
    if current_user.tipo_usuario == TipoUsuario.ALUNO:
        aluno = db.query(Aluno).filter(Aluno.user_id == current_user.id).first()
        if aluno and aluno.turma_id:
            query = query.filter(Atividade.turma_id == aluno.turma_id)
    
    atividades = query.order_by(Atividade.data_entrega.desc()).offset(skip).limit(limit).all()
    return atividades


@router.get("/{atividade_id}", response_model=AtividadeResponse)
async def get_atividade(
    atividade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retorna os detalhes de uma atividade"""
    atividade = db.query(Atividade).filter(Atividade.id == atividade_id).first()
    
    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atividade não encontrada"
        )
    
    return atividade


@router.put("/{atividade_id}", response_model=AtividadeResponse)
async def update_atividade(
    atividade_id: int,
    atividade_update: AtividadeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Atualiza uma atividade"""
    atividade = db.query(Atividade).filter(Atividade.id == atividade_id).first()
    
    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atividade não encontrada"
        )
    
    update_data = atividade_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(atividade, field, value)
    
    db.commit()
    db.refresh(atividade)
    return atividade


@router.post("/{atividade_id}/entrega", response_model=EntregaAtividadeResponse, status_code=status.HTTP_201_CREATED)
async def create_entrega(
    atividade_id: int,
    entrega_data: EntregaAtividadeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Registra a entrega de uma atividade por um aluno"""
    # Verifica se a atividade existe
    atividade = db.query(Atividade).filter(Atividade.id == atividade_id).first()
    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atividade não encontrada"
        )
    
    # Se for aluno, só pode entregar para si mesmo
    if current_user.tipo_usuario == TipoUsuario.ALUNO:
        aluno = db.query(Aluno).filter(Aluno.user_id == current_user.id).first()
        if not aluno or entrega_data.aluno_id != aluno.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você só pode registrar suas próprias entregas"
            )
    
    # Verifica se já existe entrega
    entrega_existente = db.query(EntregaAtividade).filter(
        EntregaAtividade.atividade_id == atividade_id,
        EntregaAtividade.aluno_id == entrega_data.aluno_id
    ).first()
    
    if entrega_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Entrega já foi registrada para este aluno"
        )
    
    db_entrega = EntregaAtividade(**entrega_data.model_dump())
    db.add(db_entrega)
    db.commit()
    db.refresh(db_entrega)
    
    return db_entrega


@router.get("/{atividade_id}/entregas", response_model=List[EntregaAtividadeResponse])
async def list_entregas(
    atividade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Lista todas as entregas de uma atividade"""
    # Verifica se a atividade existe
    atividade = db.query(Atividade).filter(Atividade.id == atividade_id).first()
    if not atividade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Atividade não encontrada"
        )
    
    entregas = db.query(EntregaAtividade).filter(
        EntregaAtividade.atividade_id == atividade_id
    ).all()
    
    return entregas

