from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.models import MetricaEngajamento, User, TipoUsuario, Mensagem


class MetricsService:
    """Serviço para processamento de métricas de engajamento"""
    
    @staticmethod
    def registrar_metrica(
        db: Session,
        usuario_id: int,
        acao: str,
        categoria: str = None,
        referencia_id: int = None,
        referencia_tipo: str = None,
        tempo_sessao: float = None,
        dispositivo: str = None,
        navegador: str = None
    ):
        """Registra uma métrica de engajamento"""
        metrica = MetricaEngajamento(
            usuario_id=usuario_id,
            acao=acao,
            categoria=categoria,
            referencia_id=referencia_id,
            referencia_tipo=referencia_tipo,
            tempo_sessao=tempo_sessao,
            dispositivo=dispositivo,
            navegador=navegador
        )
        db.add(metrica)
        db.commit()
        return metrica
    
    @staticmethod
    def get_engajamento_responsaveis(db: Session, dias: int = 30):
        """Calcula taxa de engajamento dos responsáveis"""
        data_inicio = datetime.utcnow() - timedelta(days=dias)
        
        # Total de responsáveis
        total_responsaveis = db.query(User).filter(
            User.tipo_usuario == TipoUsuario.RESPONSAVEL,
            User.ativo == True
        ).count()
        
        # Responsáveis ativos (com pelo menos 1 ação no período)
        responsaveis_ativos = db.query(func.count(func.distinct(MetricaEngajamento.usuario_id))).join(
            User, MetricaEngajamento.usuario_id == User.id
        ).filter(
            User.tipo_usuario == TipoUsuario.RESPONSAVEL,
            MetricaEngajamento.timestamp >= data_inicio
        ).scalar()
        
        taxa_engajamento = (responsaveis_ativos / total_responsaveis * 100) if total_responsaveis > 0 else 0
        
        return {
            "total_responsaveis": total_responsaveis,
            "responsaveis_ativos": responsaveis_ativos,
            "taxa_engajamento": round(taxa_engajamento, 2),
            "periodo_dias": dias
        }
    
    @staticmethod
    def get_tempo_resposta_medio(db: Session, dias: int = 30):
        """Calcula tempo médio de resposta a mensagens"""
        data_inicio = datetime.utcnow() - timedelta(days=dias)
        
        # Mensagens lidas no período
        mensagens_lidas = db.query(Mensagem).filter(
            Mensagem.confirmacao_leitura == True,
            Mensagem.lida_em.isnot(None),
            Mensagem.lida_em >= data_inicio
        ).all()
        
        if not mensagens_lidas:
            return {
                "tempo_medio_horas": 0,
                "total_mensagens_analisadas": 0,
                "periodo_dias": dias
            }
        
        # Calcula diferença em horas
        tempos_resposta = []
        for msg in mensagens_lidas:
            delta = msg.lida_em - msg.enviada_em
            horas = delta.total_seconds() / 3600
            tempos_resposta.append(horas)
        
        tempo_medio = sum(tempos_resposta) / len(tempos_resposta)
        
        return {
            "tempo_medio_horas": round(tempo_medio, 2),
            "total_mensagens_analisadas": len(mensagens_lidas),
            "periodo_dias": dias
        }
    
    @staticmethod
    def get_uso_por_perfil(db: Session, dias: int = 30):
        """Estatísticas de uso por tipo de usuário"""
        data_inicio = datetime.utcnow() - timedelta(days=dias)
        
        resultados = db.query(
            User.tipo_usuario,
            func.count(MetricaEngajamento.id).label('total_acoes'),
            func.count(func.distinct(MetricaEngajamento.usuario_id)).label('usuarios_unicos')
        ).join(
            MetricaEngajamento, User.id == MetricaEngajamento.usuario_id
        ).filter(
            MetricaEngajamento.timestamp >= data_inicio
        ).group_by(
            User.tipo_usuario
        ).all()
        
        return [
            {
                "tipo_usuario": r.tipo_usuario,
                "total_acoes": r.total_acoes,
                "usuarios_unicos": r.usuarios_unicos
            }
            for r in resultados
        ]
    
    @staticmethod
    def get_acoes_mais_comuns(db: Session, dias: int = 30, limit: int = 10):
        """Retorna as ações mais comuns no período"""
        data_inicio = datetime.utcnow() - timedelta(days=dias)
        
        resultados = db.query(
            MetricaEngajamento.acao,
            MetricaEngajamento.categoria,
            func.count(MetricaEngajamento.id).label('quantidade')
        ).filter(
            MetricaEngajamento.timestamp >= data_inicio
        ).group_by(
            MetricaEngajamento.acao,
            MetricaEngajamento.categoria
        ).order_by(
            desc('quantidade')
        ).limit(limit).all()
        
        return [
            {
                "acao": r.acao,
                "categoria": r.categoria,
                "quantidade": r.quantidade
            }
            for r in resultados
        ]

