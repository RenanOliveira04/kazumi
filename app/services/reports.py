from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.models import (
    MetricaEngajamento, User, TipoUsuario, Mensagem, EventoEscolar,
    Atividade, EntregaAtividade, PEI, IntervencaoPedagogica, Avaliacao, Aluno
)


class ReportsService:
    """Serviço para geração de relatórios estatísticos"""
    
    @staticmethod
    def get_engajamento_geral(db: Session, dias: int = 30):
        """Métricas gerais de uso do sistema"""
        data_inicio = datetime.utcnow() - timedelta(days=dias)
        
        # Total de usuários ativos
        usuarios_ativos = db.query(func.count(func.distinct(MetricaEngajamento.usuario_id))).filter(
            MetricaEngajamento.timestamp >= data_inicio
        ).scalar()
        
        # Total de ações no período
        total_acoes = db.query(func.count(MetricaEngajamento.id)).filter(
            MetricaEngajamento.timestamp >= data_inicio
        ).scalar()
        
        # Total de mensagens enviadas
        mensagens_enviadas = db.query(func.count(Mensagem.id)).filter(
            Mensagem.enviada_em >= data_inicio
        ).scalar()
        
        # Total de eventos criados
        eventos_criados = db.query(func.count(EventoEscolar.id)).filter(
            EventoEscolar.data_evento >= data_inicio.date()
        ).scalar()
        
        # Total de usuários cadastrados
        total_usuarios = db.query(func.count(User.id)).filter(User.ativo == True).scalar()
        
        return {
            "periodo_dias": dias,
            "usuarios_ativos": usuarios_ativos or 0,
            "total_usuarios": total_usuarios or 0,
            "taxa_ativacao": round((usuarios_ativos / total_usuarios * 100) if total_usuarios > 0 else 0, 2),
            "total_acoes": total_acoes or 0,
            "mensagens_enviadas": mensagens_enviadas or 0,
            "eventos_criados": eventos_criados or 0
        }
    
    @staticmethod
    def get_desempenho_alunos(db: Session, turma_id: int = None):
        """Análise de desempenho por turma/aluno"""
        query = db.query(
            Aluno.id,
            User.nome_completo,
            func.avg(Avaliacao.nota).label('media_geral'),
            func.count(Avaliacao.id).label('total_avaliacoes')
        ).join(
            User, Aluno.user_id == User.id
        ).outerjoin(
            Avaliacao, Aluno.id == Avaliacao.aluno_id
        )
        
        if turma_id:
            query = query.filter(Aluno.turma_id == turma_id)
        
        resultados = query.group_by(Aluno.id, User.nome_completo).all()
        
        return [
            {
                "aluno_id": r.id,
                "nome": r.nome_completo,
                "media_geral": round(r.media_geral, 2) if r.media_geral else None,
                "total_avaliacoes": r.total_avaliacoes
            }
            for r in resultados
        ]
    
    @staticmethod
    def get_comunicacao_stats(db: Session, dias: int = 30):
        """Estatísticas de mensagens"""
        data_inicio = datetime.utcnow() - timedelta(days=dias)
        
        # Mensagens enviadas
        total_enviadas = db.query(func.count(Mensagem.id)).filter(
            Mensagem.enviada_em >= data_inicio
        ).scalar()
        
        # Mensagens lidas
        total_lidas = db.query(func.count(Mensagem.id)).filter(
            Mensagem.enviada_em >= data_inicio,
            Mensagem.confirmacao_leitura == True
        ).scalar()
        
        # Taxa de leitura
        taxa_leitura = (total_lidas / total_enviadas * 100) if total_enviadas > 0 else 0
        
        # Tempo médio de resposta (em horas)
        mensagens_com_tempo = db.query(Mensagem).filter(
            Mensagem.enviada_em >= data_inicio,
            Mensagem.confirmacao_leitura == True,
            Mensagem.lida_em.isnot(None)
        ).all()
        
        tempos_resposta = []
        for msg in mensagens_com_tempo:
            delta = msg.lida_em - msg.enviada_em
            horas = delta.total_seconds() / 3600
            tempos_resposta.append(horas)
        
        tempo_medio = sum(tempos_resposta) / len(tempos_resposta) if tempos_resposta else 0
        
        return {
            "periodo_dias": dias,
            "total_enviadas": total_enviadas or 0,
            "total_lidas": total_lidas or 0,
            "taxa_leitura": round(taxa_leitura, 2),
            "tempo_medio_resposta_horas": round(tempo_medio, 2)
        }
    
    @staticmethod
    def get_eventos_participacao(db: Session, dias: int = 30):
        """Taxa de participação em eventos"""
        data_inicio = (datetime.utcnow() - timedelta(days=dias)).date()
        
        total_eventos = db.query(func.count(EventoEscolar.id)).filter(
            EventoEscolar.data_evento >= data_inicio
        ).scalar()
        
        # Agrupa eventos por tipo
        eventos_por_tipo = db.query(
            EventoEscolar.tipo,
            func.count(EventoEscolar.id).label('quantidade')
        ).filter(
            EventoEscolar.data_evento >= data_inicio
        ).group_by(EventoEscolar.tipo).all()
        
        return {
            "periodo_dias": dias,
            "total_eventos": total_eventos or 0,
            "eventos_por_tipo": [
                {"tipo": e.tipo, "quantidade": e.quantidade}
                for e in eventos_por_tipo
            ]
        }
    
    @staticmethod
    def get_atividades_conclusao(db: Session, dias: int = 30, turma_id: int = None):
        """Taxa de conclusão de atividades"""
        data_inicio = (datetime.utcnow() - timedelta(days=dias)).date()
        
        query_atividades = db.query(func.count(Atividade.id)).filter(
            Atividade.data_entrega >= data_inicio
        )
        
        if turma_id:
            query_atividades = query_atividades.filter(Atividade.turma_id == turma_id)
        
        total_atividades = query_atividades.scalar()
        
        # Total de entregas realizadas
        query_entregas = db.query(func.count(EntregaAtividade.id)).join(
            Atividade, EntregaAtividade.atividade_id == Atividade.id
        ).filter(
            Atividade.data_entrega >= data_inicio
        )
        
        if turma_id:
            query_entregas = query_entregas.filter(Atividade.turma_id == turma_id)
        
        total_entregas = query_entregas.scalar()
        
        # Entregas concluídas
        query_concluidas = query_entregas.filter(EntregaAtividade.concluida == True)
        total_concluidas = query_concluidas.scalar()
        
        taxa_conclusao = (total_concluidas / total_entregas * 100) if total_entregas > 0 else 0
        
        return {
            "periodo_dias": dias,
            "turma_id": turma_id,
            "total_atividades": total_atividades or 0,
            "total_entregas": total_entregas or 0,
            "total_concluidas": total_concluidas or 0,
            "taxa_conclusao": round(taxa_conclusao, 2)
        }
    
    @staticmethod
    def get_pei_acompanhamento(db: Session):
        """Progresso dos alunos com PEI"""
        # Alunos com PEI ativo
        alunos_pei = db.query(
            Aluno.id,
            User.nome_completo,
            PEI.id.label('pei_id'),
            PEI.data_inicio,
            func.count(IntervencaoPedagogica.id).label('total_intervencoes')
        ).join(
            User, Aluno.user_id == User.id
        ).join(
            PEI, Aluno.id == PEI.aluno_id
        ).outerjoin(
            IntervencaoPedagogica, PEI.id == IntervencaoPedagogica.pei_id
        ).filter(
            PEI.ativo == 1
        ).group_by(
            Aluno.id, User.nome_completo, PEI.id, PEI.data_inicio
        ).all()
        
        return {
            "total_alunos_com_pei": len(alunos_pei),
            "alunos": [
                {
                    "aluno_id": a.id,
                    "nome": a.nome_completo,
                    "pei_id": a.pei_id,
                    "data_inicio_pei": a.data_inicio.isoformat() if a.data_inicio else None,
                    "total_intervencoes": a.total_intervencoes
                }
                for a in alunos_pei
            ]
        }

