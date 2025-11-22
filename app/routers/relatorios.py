from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, TipoUsuario
from app.utils.dependencies import require_role
from app.services.reports import ReportsService

router = APIRouter(prefix="/api/relatorios", tags=["Relatórios"])


@router.get("/engajamento-geral")
async def get_engajamento_geral(
    dias: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Retorna métricas gerais de uso do sistema"""
    return ReportsService.get_engajamento_geral(db, dias)


@router.get("/desempenho-alunos")
async def get_desempenho_alunos(
    turma_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Retorna análise de desempenho por turma/aluno"""
    return ReportsService.get_desempenho_alunos(db, turma_id)


@router.get("/comunicacao")
async def get_comunicacao_stats(
    dias: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Retorna estatísticas de mensagens (enviadas, lidas, tempo resposta)"""
    return ReportsService.get_comunicacao_stats(db, dias)


@router.get("/eventos/participacao")
async def get_eventos_participacao(
    dias: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Retorna taxa de participação em eventos"""
    return ReportsService.get_eventos_participacao(db, dias)


@router.get("/atividades/conclusao")
async def get_atividades_conclusao(
    dias: int = 30,
    turma_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Retorna taxa de conclusão de atividades"""
    return ReportsService.get_atividades_conclusao(db, dias, turma_id)


@router.get("/pei/acompanhamento")
async def get_pei_acompanhamento(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Retorna progresso dos alunos com PEI"""
    return ReportsService.get_pei_acompanhamento(db)

