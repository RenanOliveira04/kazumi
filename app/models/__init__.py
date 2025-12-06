from app.models.user import User, TipoUsuario
from app.models.professor import Professor, professor_disciplina, professor_turma
from app.models.responsavel import Responsavel, NivelLiteraciaDigital
from app.models.aluno import Aluno
from app.models.gestor import GestorEscolar
from app.models.disciplina import Disciplina
from app.models.turma import Turma, Turno
from app.models.escola import Escola
from app.models.avaliacao import Avaliacao
from app.models.atividade import Atividade, EntregaAtividade
from app.models.pei import PEI, IntervencaoPedagogica
from app.models.mensagem import Mensagem, TipoMidia
from app.models.notificacao import Notificacao, TipoNotificacao
from app.models.evento import EventoEscolar, TipoEvento
from app.models.metrica import MetricaEngajamento

__all__ = [
    "User",
    "TipoUsuario",
    "Professor",
    "Responsavel",
    "NivelLiteraciaDigital",
    "Aluno",
    "GestorEscolar",
    "Disciplina",
    "Turma",
    "Turno",
    "Escola",
    "Avaliacao",
    "Atividade",
    "EntregaAtividade",
    "PEI",
    "IntervencaoPedagogica",
    "Mensagem",
    "TipoMidia",
    "Notificacao",
    "TipoNotificacao",
    "EventoEscolar",
    "TipoEvento",
    "MetricaEngajamento",
    "professor_disciplina",
    "professor_turma",
]
