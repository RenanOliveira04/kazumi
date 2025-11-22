from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models import EventoEscolar, User, TipoUsuario
from app.schemas import EventoCreate, EventoUpdate, EventoResponse
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/eventos", tags=["Eventos"])


@router.post("/", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
async def create_evento(
    evento_data: EventoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Cria um evento escolar"""
    db_evento = EventoEscolar(**evento_data.model_dump(exclude={"criado_por_id"}))
    db_evento.criado_por_id = current_user.id
    
    db.add(db_evento)
    db.commit()
    db.refresh(db_evento)
    
    return db_evento


@router.get("/", response_model=List[EventoResponse])
async def list_eventos(
    skip: int = 0,
    limit: int = 100,
    turma_id: Optional[int] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Lista eventos escolares com filtros opcionais"""
    query = db.query(EventoEscolar)
    
    if turma_id:
        query = query.filter(EventoEscolar.turma_id == turma_id)
    
    if data_inicio:
        query = query.filter(EventoEscolar.data_evento >= data_inicio)
    
    if data_fim:
        query = query.filter(EventoEscolar.data_evento <= data_fim)
    
    eventos = query.order_by(EventoEscolar.data_evento.asc()).offset(skip).limit(limit).all()
    return eventos


@router.get("/{evento_id}", response_model=EventoResponse)
async def get_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retorna os detalhes de um evento"""
    evento = db.query(EventoEscolar).filter(EventoEscolar.id == evento_id).first()
    
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    
    return evento


@router.put("/{evento_id}", response_model=EventoResponse)
async def update_evento(
    evento_id: int,
    evento_update: EventoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Atualiza um evento"""
    evento = db.query(EventoEscolar).filter(EventoEscolar.id == evento_id).first()
    
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    
    update_data = evento_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(evento, field, value)
    
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Cancela/deleta um evento"""
    evento = db.query(EventoEscolar).filter(EventoEscolar.id == evento_id).first()
    
    if not evento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    
    db.delete(evento)
    db.commit()
    
    return None

