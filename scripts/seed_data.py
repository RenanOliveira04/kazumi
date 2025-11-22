"""
Script para popular o banco de dados com dados de exemplo
Execute: python scripts/seed_data.py
"""
import sys
import os
from datetime import date, datetime, timedelta

# Adiciona o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import (
    User, TipoUsuario, Professor, Responsavel, Aluno, GestorEscolar,
    Disciplina, Turma, Turno, NivelLiteraciaDigital
)
from app.utils.security import get_password_hash


def seed_database():
    """Popula o banco com dados de exemplo"""
    db = SessionLocal()
    
    try:
        # Limpar dados existentes (cuidado em produção!)
        print("Limpando dados existentes...")
        
        # Criar usuários
        print("Criando usuários...")
        
        # Gestor
        gestor_user = User(
            email="gestor@escola.com",
            senha_hash=get_password_hash("gestor123"),
            nome_completo="Maria Silva",
            telefone="11999999999",
            tipo_usuario=TipoUsuario.GESTOR,
            ativo=True
        )
        db.add(gestor_user)
        db.flush()
        
        gestor = GestorEscolar(
            user_id=gestor_user.id,
            matricula="GEST001",
            cargo="Diretora",
            departamento="Administração"
        )
        db.add(gestor)
        
        # Professor
        professor_user = User(
            email="professor@escola.com",
            senha_hash=get_password_hash("prof123"),
            nome_completo="João Santos",
            telefone="11988888888",
            tipo_usuario=TipoUsuario.PROFESSOR,
            ativo=True
        )
        db.add(professor_user)
        db.flush()
        
        professor = Professor(
            user_id=professor_user.id,
            matricula="PROF001",
            formacao="Licenciatura em Matemática",
            especializacao="Educação Inclusiva"
        )
        db.add(professor)
        
        # Responsável
        responsavel_user = User(
            email="responsavel@email.com",
            senha_hash=get_password_hash("resp123"),
            nome_completo="Ana Oliveira",
            telefone="11977777777",
            tipo_usuario=TipoUsuario.RESPONSAVEL,
            ativo=True
        )
        db.add(responsavel_user)
        db.flush()
        
        responsavel = Responsavel(
            user_id=responsavel_user.id,
            cpf="12345678901",
            parentesco="Mãe",
            literacia_digital=NivelLiteraciaDigital.MEDIO,
            preferencia_audio=True,
            preferencia_video=False
        )
        db.add(responsavel)
        db.flush()
        
        # Disciplinas
        print("Criando disciplinas...")
        matematica = Disciplina(
            nome="Matemática",
            codigo="MAT001",
            descricao="Disciplina de Matemática",
            carga_horaria=80
        )
        portugues = Disciplina(
            nome="Português",
            codigo="PORT001",
            descricao="Disciplina de Língua Portuguesa",
            carga_horaria=80
        )
        db.add_all([matematica, portugues])
        db.flush()
        
        # Turma
        print("Criando turmas...")
        turma = Turma(
            nome="7º Ano A",
            codigo="7A2024",
            ano_letivo=2024,
            serie="7º ano",
            turno=Turno.MATUTINO,
            capacidade=30
        )
        db.add(turma)
        db.flush()
        
        # Aluno
        print("Criando alunos...")
        aluno_user = User(
            email="aluno@escola.com",
            senha_hash=get_password_hash("aluno123"),
            nome_completo="Pedro Oliveira",
            telefone="11966666666",
            tipo_usuario=TipoUsuario.ALUNO,
            ativo=True
        )
        db.add(aluno_user)
        db.flush()
        
        aluno = Aluno(
            user_id=aluno_user.id,
            responsavel_id=responsavel.id,
            turma_id=turma.id,
            matricula="ALU001",
            data_nascimento=date(2010, 5, 15),
            necessidades_especiais=True,
            descricao_necessidades="TDAH - Necessita de tempo adicional para atividades",
            pei_ativo=False
        )
        db.add(aluno)
        
        # Associar professor às disciplinas e turma
        professor.disciplinas.append(matematica)
        professor.turmas.append(turma)
        
        db.commit()
        print("\n✅ Banco de dados populado com sucesso!")
        print("\nCredenciais criadas:")
        print("Gestor: gestor@escola.com / gestor123")
        print("Professor: professor@escola.com / prof123")
        print("Responsável: responsavel@email.com / resp123")
        print("Aluno: aluno@escola.com / aluno123")
        
    except Exception as e:
        print(f"\n❌ Erro ao popular banco de dados: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Iniciando seed do banco de dados...")
    seed_database()

