from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Avaliacao, User, TipoUsuario, Aluno
from app.schemas import AvaliacaoCreate, AvaliacaoUpdate, AvaliacaoResponse
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/avaliacoes", tags=["Avaliações"])


@router.post("/", response_model=AvaliacaoResponse, status_code=status.HTTP_201_CREATED)
async def create_avaliacao(
    avaliacao_data: AvaliacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Cria uma nova avaliação"""
    db_avaliacao = Avaliacao(**avaliacao_data.model_dump())
    db.add(db_avaliacao)
    db.commit()
    db.refresh(db_avaliacao)
    
    return db_avaliacao


@router.get("/aluno/{aluno_id}", response_model=List[AvaliacaoResponse])
async def list_avaliacoes_aluno(
    aluno_id: int,
    disciplina_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista todas as avaliações de um aluno"""
    # Verifica permissões
    if current_user.tipo_usuario == TipoUsuario.ALUNO:
        aluno = db.query(Aluno).filter(Aluno.user_id == current_user.id).first()
        if not aluno or aluno.id != aluno_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você só pode acessar suas próprias avaliações"
            )
    
    query = db.query(Avaliacao).filter(Avaliacao.aluno_id == aluno_id)
    
    if disciplina_id:
        query = query.filter(Avaliacao.disciplina_id == disciplina_id)
    
    avaliacoes = query.order_by(Avaliacao.data_avaliacao.desc()).all()
    return avaliacoes


@router.get("/{avaliacao_id}", response_model=AvaliacaoResponse)
async def get_avaliacao(
    avaliacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retorna os detalhes de uma avaliação"""
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada"
        )
    
    return avaliacao


@router.put("/{avaliacao_id}", response_model=AvaliacaoResponse)
async def update_avaliacao(
    avaliacao_id: int,
    avaliacao_update: AvaliacaoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Atualiza uma avaliação (incluindo lançamento de nota)"""
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada"
        )
    
    update_data = avaliacao_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(avaliacao, field, value)
    
    db.commit()
    db.refresh(avaliacao)
    return avaliacao


@router.delete("/{avaliacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_avaliacao(
    avaliacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Deleta uma avaliação"""
    avaliacao = db.query(Avaliacao).filter(Avaliacao.id == avaliacao_id).first()
    
    if not avaliacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avaliação não encontrada"
        )
    
    db.delete(avaliacao)
    db.commit()
    
    return None

