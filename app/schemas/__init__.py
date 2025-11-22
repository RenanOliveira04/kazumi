from app.schemas.user import (
    UserCreate, UserUpdate, UserResponse, Token, TokenData
)
from app.schemas.professor import (
    ProfessorCreate, ProfessorUpdate, ProfessorResponse
)
from app.schemas.responsavel import (
    ResponsavelCreate, ResponsavelUpdate, ResponsavelResponse
)
from app.schemas.aluno import (
    AlunoCreate, AlunoUpdate, AlunoResponse
)
from app.schemas.gestor import (
    GestorCreate, GestorUpdate, GestorResponse
)
from app.schemas.disciplina import (
    DisciplinaCreate, DisciplinaUpdate, DisciplinaResponse
)
from app.schemas.turma import (
    TurmaCreate, TurmaUpdate, TurmaResponse
)
from app.schemas.avaliacao import (
    AvaliacaoCreate, AvaliacaoUpdate, AvaliacaoResponse
)
from app.schemas.atividade import (
    AtividadeCreate, AtividadeUpdate, AtividadeResponse,
    EntregaAtividadeCreate, EntregaAtividadeResponse
)
from app.schemas.pei import (
    PEICreate, PEIUpdate, PEIResponse,
    IntervencaoPedagogicaCreate, IntervencaoPedagogicaResponse
)
from app.schemas.mensagem import (
    MensagemCreate, MensagemResponse, MensagemBroadcast
)
from app.schemas.notificacao import (
    NotificacaoCreate, NotificacaoResponse
)
from app.schemas.evento import (
    EventoCreate, EventoUpdate, EventoResponse
)
from app.schemas.metrica import (
    MetricaEngajamentoCreate, MetricaEngajamentoResponse
)

__all__ = [
    "UserCreate", "UserUpdate", "UserResponse", "Token", "TokenData",
    "ProfessorCreate", "ProfessorUpdate", "ProfessorResponse",
    "ResponsavelCreate", "ResponsavelUpdate", "ResponsavelResponse",
    "AlunoCreate", "AlunoUpdate", "AlunoResponse",
    "GestorCreate", "GestorUpdate", "GestorResponse",
    "DisciplinaCreate", "DisciplinaUpdate", "DisciplinaResponse",
    "TurmaCreate", "TurmaUpdate", "TurmaResponse",
    "AvaliacaoCreate", "AvaliacaoUpdate", "AvaliacaoResponse",
    "AtividadeCreate", "AtividadeUpdate", "AtividadeResponse",
    "EntregaAtividadeCreate", "EntregaAtividadeResponse",
    "PEICreate", "PEIUpdate", "PEIResponse",
    "IntervencaoPedagogicaCreate", "IntervencaoPedagogicaResponse",
    "MensagemCreate", "MensagemResponse", "MensagemBroadcast",
    "NotificacaoCreate", "NotificacaoResponse",
    "EventoCreate", "EventoUpdate", "EventoResponse",
    "MetricaEngajamentoCreate", "MetricaEngajamentoResponse",
]
