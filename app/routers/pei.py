from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import PEI, IntervencaoPedagogica, User, TipoUsuario, Aluno
from app.schemas import (
    PEICreate,
    PEIUpdate,
    PEIResponse,
    IntervencaoPedagogicaCreate,
    IntervencaoPedagogicaResponse,
)
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter(prefix="/api/peis", tags=["PEI e Inclusão"])


@router.post("/", response_model=PEIResponse, status_code=status.HTTP_201_CREATED)
async def create_pei(
    pei_data: PEICreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR)
    ),
):
    """Cria um PEI para um aluno"""
    # Verifica se o aluno existe
    aluno = db.query(Aluno).filter(Aluno.id == pei_data.aluno_id).first()
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado"
        )

    # Desativa outros PEIs ativos do aluno
    db.query(PEI).filter(PEI.aluno_id == pei_data.aluno_id, PEI.ativo == 1).update(
        {"ativo": 0}
    )

    # Cria o novo PEI
    db_pei = PEI(**pei_data.model_dump())
    db_pei.elaborado_por_id = current_user.id
    db_pei.ativo = 1

    db.add(db_pei)

    # Atualiza o aluno
    aluno.pei_ativo = True

    db.commit()
    db.refresh(db_pei)

    return db_pei


@router.get("/aluno/{aluno_id}", response_model=PEIResponse)
async def get_pei_by_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retorna o PEI ativo de um aluno"""
    pei = db.query(PEI).filter(PEI.aluno_id == aluno_id, PEI.ativo == 1).first()

    if not pei:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PEI não encontrado para este aluno",
        )

    return pei


@router.get("/aluno/{aluno_id}/historico", response_model=List[PEIResponse])
async def get_pei_historico(
    aluno_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR)
    ),
):
    """Retorna todos os PEIs (histórico) de um aluno"""
    peis = (
        db.query(PEI)
        .filter(PEI.aluno_id == aluno_id)
        .order_by(PEI.data_inicio.desc())
        .all()
    )
    return peis


@router.put("/{pei_id}", response_model=PEIResponse)
async def update_pei(
    pei_id: int,
    pei_update: PEIUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR)
    ),
):
    """Atualiza um PEI"""
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="PEI não encontrado"
        )

    update_data = pei_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pei, field, value)

    db.commit()
    db.refresh(pei)
    return pei


@router.post(
    "/{pei_id}/intervencoes",
    response_model=IntervencaoPedagogicaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_intervencao(
    pei_id: int,
    intervencao_data: IntervencaoPedagogicaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.PROFESSOR, TipoUsuario.GESTOR)
    ),
):
    """Registra uma intervenção pedagógica"""
    # Verifica se o PEI existe
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="PEI não encontrado"
        )

    db_intervencao = IntervencaoPedagogica(**intervencao_data.model_dump())
    db.add(db_intervencao)
    db.commit()
    db.refresh(db_intervencao)

    return db_intervencao


@router.get(
    "/{pei_id}/intervencoes", response_model=List[IntervencaoPedagogicaResponse]
)
async def list_intervencoes(
    pei_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lista todas as intervenções de um PEI"""
    # Verifica se o PEI existe
    pei = db.query(PEI).filter(PEI.id == pei_id).first()
    if not pei:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="PEI não encontrado"
        )

    intervencoes = (
        db.query(IntervencaoPedagogica)
        .filter(IntervencaoPedagogica.pei_id == pei_id)
        .order_by(IntervencaoPedagogica.data_intervencao.desc())
        .all()
    )

    return intervencoes
