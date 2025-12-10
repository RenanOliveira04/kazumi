from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.models import (
    MetricaEngajamento, User, Mensagem, EventoEscolar,
    Atividade, EntregaAtividade, PEI, IntervencaoPedagogica, Avaliacao, Aluno, Responsavel, Professor, Turma
)


class ReportsService:
    """Serviço para geração de relatórios estatísticos"""
    
    @staticmethod
    def get_engajamento_geral(db: Session, dias: int = 30, escola_id: int = None):
        """Métricas gerais de uso do sistema"""
        data_inicio = datetime.utcnow() - timedelta(days=dias)

        # Base queries
        usuarios_query = db.query(func.count(func.distinct(MetricaEngajamento.usuario_id))).filter(
            MetricaEngajamento.timestamp >= data_inicio
        )
        acoes_query = db.query(func.count(MetricaEngajamento.id)).filter(
            MetricaEngajamento.timestamp >= data_inicio
        )
        mensagens_query = db.query(func.count(Mensagem.id)).filter(
            Mensagem.enviada_em >= data_inicio
        )
        eventos_query = db.query(func.count(EventoEscolar.id)).filter(
            EventoEscolar.data_evento >= data_inicio.date()
        )
        usuarios_total_query = db.query(func.count(User.id)).filter(User.ativo == True)

        # Apply school filter if provided
        if escola_id:
            # Filter users by school (through their roles/classes)
            usuarios_query = usuarios_query.join(User).filter(
                User.id.in_(
                    db.query(User.id).join(Professor).filter(Professor.escola_id == escola_id)
                    .union(
                        db.query(User.id).join(Responsavel).join(Aluno).join(Turma).filter(Turma.escola_id == escola_id)
                    )
                )
            )
            mensagens_query = mensagens_query.filter(
                Mensagem.remetente_id.in_(
                    db.query(User.id).join(Professor).filter(Professor.escola_id == escola_id)
                    .union(
                        db.query(User.id).join(Responsavel).join(Aluno).join(Turma).filter(Turma.escola_id == escola_id)
                    )
                )
            )
            eventos_query = eventos_query.filter(EventoEscolar.escola_id == escola_id)
            usuarios_total_query = usuarios_total_query.filter(
                User.id.in_(
                    db.query(User.id).join(Professor).filter(Professor.escola_id == escola_id)
                    .union(
                        db.query(User.id).join(Responsavel).join(Aluno).join(Turma).filter(Turma.escola_id == escola_id)
                    )
                )
            )

        # Execute queries
        usuarios_ativos = usuarios_query.scalar()
        total_acoes = acoes_query.scalar()
        mensagens_enviadas = mensagens_query.scalar()
        eventos_criados = eventos_query.scalar()
        total_usuarios = usuarios_total_query.scalar()
        
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
    def get_desempenho_alunos(db: Session, escola_id: int = None, turma_id: int = None):
        """Análise de desempenho por turma"""
        query = db.query(
            Turma.id.label('turma_id'),
            Turma.nome.label('turma_nome'),
            func.count(Aluno.id).label('total_alunos'),
            func.sum(func.case((Aluno.pei_ativo == True, 1), else_=0)).label('alunos_com_pei'),
            func.avg(func.coalesce(Avaliacao.nota, 0)).label('media_geral'),
            func.count(func.distinct(func.case((EntregaAtividade.status == 'entregue', EntregaAtividade.id)))).label('atividades_entregues'),
            func.count(func.distinct(Atividade.id)).label('total_atividades')
        ).select_from(Turma).outerjoin(
            Aluno, Turma.id == Aluno.turma_id
        ).outerjoin(
            Avaliacao, Aluno.id == Avaliacao.aluno_id
        ).outerjoin(
            EntregaAtividade, and_(EntregaAtividade.aluno_id == Aluno.id, EntregaAtividade.atividade_id == Atividade.id)
        ).outerjoin(
            Atividade, Atividade.turma_id == Turma.id
        )

        # Apply filters
        if escola_id:
            query = query.filter(Turma.escola_id == escola_id)
        if turma_id:
            query = query.filter(Turma.id == turma_id)

        resultados = query.group_by(Turma.id, Turma.nome).all()

        return [
            {
                "turma_id": r.turma_id,
                "turma_nome": r.turma_nome,
                "total_alunos": r.total_alunos or 0,
                "alunos_com_pei": r.alunos_com_pei or 0,
                "media_geral": round(r.media_geral, 2) if r.media_geral and r.media_geral > 0 else None,
                "taxa_entrega_atividades": round((r.atividades_entregues / r.total_atividades * 100) if r.total_atividades and r.total_atividades > 0 else 0, 2),
                "frequencia_media": 85.0  # Placeholder - would need attendance data
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
    def get_pei_acompanhamento(db: Session, escola_id: int = None):
        """Progresso dos alunos com PEI"""
        # Base query for PEI students
        query = db.query(
            Aluno.id,
            User.nome_completo,
            Turma.serie,
            PEI.id.label('pei_id'),
            PEI.data_inicio,
            func.count(IntervencaoPedagogica.id).label('total_intervencoes')
        ).join(
            User, Aluno.user_id == User.id
        ).join(
            Turma, Aluno.turma_id == Turma.id
        ).join(
            PEI, Aluno.id == PEI.aluno_id
        ).outerjoin(
            IntervencaoPedagogica, PEI.id == IntervencaoPedagogica.pei_id
        ).filter(
            PEI.ativo == True
        )

        # Apply school filter
        if escola_id:
            query = query.filter(Turma.escola_id == escola_id)

        alunos_pei = query.group_by(
            Aluno.id, User.nome_completo, Turma.serie, PEI.id, PEI.data_inicio
        ).all()

        total_alunos_pei = len(alunos_pei)

        # Distribuição por série
        serie_query = db.query(
            Turma.serie,
            func.count(Aluno.id).label('quantidade')
        ).join(
            Aluno, Turma.id == Aluno.turma_id
        ).join(
            PEI, Aluno.id == PEI.aluno_id
        ).filter(
            PEI.ativo == True
        )

        if escola_id:
            serie_query = serie_query.filter(Turma.escola_id == escola_id)

        alunos_por_serie = serie_query.group_by(Turma.serie).all()

        # Tipos de necessidades (placeholder - would come from Aluno.descricao_necessidades)
        tipos_necessidades = [
            {"tipo": "Deficiência Intelectual", "quantidade": max(1, total_alunos_pei // 3)},
            {"tipo": "Transtorno do Espectro Autista", "quantidade": max(1, total_alunos_pei // 4)},
            {"tipo": "Deficiência Física", "quantidade": max(1, total_alunos_pei // 5)},
        ]

        return {
            "total_alunos_pei": total_alunos_pei,
            "alunos_por_serie": [
                {"serie": r.serie, "quantidade": r.quantidade}
                for r in alunos_por_serie
            ],
            "tipos_necessidades": tipos_necessidades,
            "progresso_medio": 75.0  # Placeholder - would calculate actual progress from IntervencaoPedagogica
        }

