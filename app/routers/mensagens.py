from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Mensagem, User, TipoUsuario
from app.schemas import MensagemCreate, MensagemResponse, MensagemBroadcast
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/mensagens", tags=["Mensagens"])


@router.post("/", response_model=MensagemResponse, status_code=status.HTTP_201_CREATED)
async def send_mensagem(
    mensagem_data: MensagemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Envia uma mensagem"""
    # Verifica se o destinatário existe
    destinatario = db.query(User).filter(User.id == mensagem_data.destinatario_id).first()
    if not destinatario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Destinatário não encontrado"
        )
    
    db_mensagem = Mensagem(**mensagem_data.model_dump())
    db_mensagem.remetente_id = current_user.id
    
    db.add(db_mensagem)
    db.commit()
    db.refresh(db_mensagem)
    
    return db_mensagem


@router.post("/broadcast", status_code=status.HTTP_201_CREATED)
async def send_broadcast(
    broadcast_data: MensagemBroadcast,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR))
):
    """Envia mensagem para múltiplos destinatários"""
    mensagens_criadas = []
    
    for destinatario_id in broadcast_data.destinatarios_ids:
        # Verifica se o destinatário existe
        destinatario = db.query(User).filter(User.id == destinatario_id).first()
        if not destinatario:
            continue  # Pula destinatários inválidos
        
        db_mensagem = Mensagem(
            remetente_id=current_user.id,
            destinatario_id=destinatario_id,
            assunto=broadcast_data.assunto,
            conteudo=broadcast_data.conteudo,
            tipo_midia=broadcast_data.tipo_midia,
            midia_url=broadcast_data.midia_url
        )
        db.add(db_mensagem)
        mensagens_criadas.append(db_mensagem)
    
    db.commit()
    
    return {
        "mensagem": "Mensagens enviadas com sucesso",
        "total_enviadas": len(mensagens_criadas)
    }


@router.get("/", response_model=List[MensagemResponse])
async def list_mensagens_inbox(
    skip: int = 0,
    limit: int = 50,
    apenas_nao_lidas: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista mensagens recebidas (inbox)"""
    query = db.query(Mensagem).filter(Mensagem.destinatario_id == current_user.id)
    
    if apenas_nao_lidas:
        query = query.filter(Mensagem.confirmacao_leitura == False)
    
    mensagens = query.order_by(Mensagem.enviada_em.desc()).offset(skip).limit(limit).all()
    return mensagens


@router.get("/enviadas", response_model=List[MensagemResponse])
async def list_mensagens_enviadas(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista mensagens enviadas"""
    mensagens = db.query(Mensagem).filter(
        Mensagem.remetente_id == current_user.id
    ).order_by(Mensagem.enviada_em.desc()).offset(skip).limit(limit).all()
    
    return mensagens


@router.get("/{mensagem_id}", response_model=MensagemResponse)
async def get_mensagem(
    mensagem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retorna os detalhes de uma mensagem"""
    mensagem = db.query(Mensagem).filter(Mensagem.id == mensagem_id).first()
    
    if not mensagem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensagem não encontrada"
        )
    
    # Verifica se o usuário é remetente ou destinatário
    if mensagem.remetente_id != current_user.id and mensagem.destinatario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta mensagem"
        )
    
    return mensagem


@router.post("/{mensagem_id}/confirmar-leitura", response_model=MensagemResponse)
async def confirmar_leitura(
    mensagem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marca uma mensagem como lida"""
    mensagem = db.query(Mensagem).filter(Mensagem.id == mensagem_id).first()
    
    if not mensagem:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensagem não encontrada"
        )
    
    # Verifica se o usuário é o destinatário
    if mensagem.destinatario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o destinatário pode confirmar a leitura"
        )
    
    mensagem.confirmacao_leitura = True
    mensagem.lida_em = datetime.utcnow()
    
    db.commit()
    db.refresh(mensagem)
    
    return mensagem


@router.get("/stats/nao-lidas")
async def count_mensagens_nao_lidas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Conta o número de mensagens não lidas"""
    count = db.query(Mensagem).filter(
        Mensagem.destinatario_id == current_user.id,
        Mensagem.confirmacao_leitura == False
    ).count()
    
    return {"nao_lidas": count}

