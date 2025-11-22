from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, TipoUsuario
from app.schemas import MetricaEngajamentoCreate, MetricaEngajamentoResponse
from app.utils.dependencies import get_current_active_user, require_role
from app.services.metrics import MetricsService

router = APIRouter(prefix="/api/metricas", tags=["Métricas"])


@router.post("/registrar", response_model=MetricaEngajamentoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_metrica(
    metrica_data: MetricaEngajamentoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Registra uma métrica de engajamento manualmente"""
    metrica = MetricsService.registrar_metrica(
        db=db,
        usuario_id=metrica_data.usuario_id,
        acao=metrica_data.acao,
        categoria=metrica_data.categoria,
        referencia_id=metrica_data.referencia_id,
        referencia_tipo=metrica_data.referencia_tipo,
        tempo_sessao=metrica_data.tempo_sessao,
        dispositivo=metrica_data.dispositivo,
        navegador=metrica_data.navegador
    )
    return metrica


@router.get("/engajamento/responsaveis")
async def get_engajamento_responsaveis(
    dias: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Retorna taxa de engajamento dos responsáveis"""
    return MetricsService.get_engajamento_responsaveis(db, dias)


@router.get("/tempo-resposta/media")
async def get_tempo_resposta_medio(
    dias: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR))
):
    """Retorna tempo médio de resposta a mensagens"""
    return MetricsService.get_tempo_resposta_medio(db, dias)


@router.get("/uso-por-perfil")
async def get_uso_por_perfil(
    dias: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Retorna estatísticas de uso por tipo de usuário"""
    return MetricsService.get_uso_por_perfil(db, dias)


@router.get("/acoes-mais-comuns")
async def get_acoes_mais_comuns(
    dias: int = 30,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR))
):
    """Retorna as ações mais comuns no período"""
    return MetricsService.get_acoes_mais_comuns(db, dias, limit)

