from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Notificacao, User, TipoUsuario
from app.schemas import NotificacaoCreate, NotificacaoResponse
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/notificacoes", tags=["Notificações"])


@router.get("/", response_model=List[NotificacaoResponse])
async def list_notificacoes(
    skip: int = 0,
    limit: int = 50,
    apenas_nao_lidas: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lista notificações do usuário"""
    query = db.query(Notificacao).filter(Notificacao.usuario_id == current_user.id)

    if apenas_nao_lidas:
        query = query.filter(Notificacao.lida == False)

    notificacoes = (
        query.order_by(Notificacao.criada_em.desc()).offset(skip).limit(limit).all()
    )
    return notificacoes


@router.post(
    "/", response_model=NotificacaoResponse, status_code=status.HTTP_201_CREATED
)
async def create_notificacao(
    notificacao_data: NotificacaoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR)
    ),
):
    """Cria uma notificação para um usuário"""
    # Verifica se o usuário destinatário existe
    usuario = db.query(User).filter(User.id == notificacao_data.usuario_id).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    db_notificacao = Notificacao(**notificacao_data.model_dump())
    db.add(db_notificacao)
    db.commit()
    db.refresh(db_notificacao)

    return db_notificacao


@router.put("/{notificacao_id}/ler", response_model=NotificacaoResponse)
async def marcar_como_lida(
    notificacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Marca uma notificação como lida"""
    notificacao = db.query(Notificacao).filter(Notificacao.id == notificacao_id).first()

    if not notificacao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notificação não encontrada"
        )

    # Verifica se a notificação pertence ao usuário
    if notificacao.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta notificação",
        )

    notificacao.lida = True
    notificacao.lida_em = datetime.utcnow()

    db.commit()
    db.refresh(notificacao)

    return notificacao


@router.post("/{notificacao_id}/marcar-lida", response_model=NotificacaoResponse)
async def marcar_como_lida_post(
    notificacao_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Marca uma notificação como lida (POST endpoint para compatibilidade)"""
    return await marcar_como_lida(notificacao_id, db, current_user)


@router.put("/marcar-todas-lidas")
async def marcar_todas_como_lidas(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    """Marca todas as notificações do usuário como lidas"""
    db.query(Notificacao).filter(
        Notificacao.usuario_id == current_user.id, Notificacao.lida == False
    ).update({"lida": True, "lida_em": datetime.utcnow()})

    db.commit()

    return {"mensagem": "Todas as notificações foram marcadas como lidas"}


@router.get("/nao-lidas/count")
async def count_notificacoes_nao_lidas(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)
):
    """Retorna o número de notificações não lidas"""
    count = (
        db.query(Notificacao)
        .filter(Notificacao.usuario_id == current_user.id, Notificacao.lida == False)
        .count()
    )

    return {"nao_lidas": count}
