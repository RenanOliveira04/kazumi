from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Aluno, Professor, Responsavel, GestorEscolar, TipoUsuario
from app.schemas import (
    UserResponse,
    UserUpdate,
    AlunoCreate,
    AlunoUpdate,
    AlunoResponse,
    ProfessorCreate,
    ProfessorResponse,
    ResponsavelCreate,
    ResponsavelResponse,
    GestorCreate,
    GestorResponse,
)
from app.utils.dependencies import get_current_active_user, require_role
from app.utils.security import get_password_hash

router = APIRouter(prefix="/api/users", tags=["Usuários"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
):
    """Retorna o perfil do usuário autenticado"""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Atualiza o perfil do usuário autenticado"""
    if user_update.nome_completo is not None:
        current_user.nome_completo = user_update.nome_completo
    if user_update.telefone is not None:
        current_user.telefone = user_update.telefone
    if user_update.senha is not None:
        current_user.senha_hash = get_password_hash(user_update.senha)

    db.commit()
    db.refresh(current_user)
    return current_user


# --- Endpoints de Alunos ---


@router.post(
    "/alunos", response_model=AlunoResponse, status_code=status.HTTP_201_CREATED
)
async def create_aluno(
    aluno_data: AlunoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR, TipoUsuario.RESPONSAVEL)
    ),
):
    """Cadastra um novo aluno"""
    # Verifica se a matrícula já existe
    existing_aluno = (
        db.query(Aluno).filter(Aluno.matricula == aluno_data.matricula).first()
    )
    if existing_aluno:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Matrícula já cadastrada"
        )

    # Se o usuário é responsável, automaticamente vincula o aluno a ele
    if current_user.tipo_usuario == TipoUsuario.RESPONSAVEL:
        responsavel = (
            db.query(Responsavel).filter(Responsavel.user_id == current_user.id).first()
        )
        if not responsavel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Perfil de responsável não encontrado",
            )
        aluno_data.responsavel_id = responsavel.id

    db_aluno = Aluno(**aluno_data.model_dump())
    db.add(db_aluno)
    db.commit()
    db.refresh(db_aluno)

    return db_aluno


@router.get("/alunos/{aluno_id}", response_model=AlunoResponse)
async def get_aluno(
    aluno_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retorna os detalhes de um aluno"""
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado"
        )

    # Verifica permissões: responsável só pode ver seus próprios alunos
    if current_user.tipo_usuario == TipoUsuario.RESPONSAVEL:
        responsavel = (
            db.query(Responsavel).filter(Responsavel.user_id == current_user.id).first()
        )
        if not responsavel or aluno.responsavel_id != responsavel.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar este aluno",
            )

    return aluno


@router.put("/alunos/{aluno_id}", response_model=AlunoResponse)
async def update_aluno(
    aluno_id: int,
    aluno_update: AlunoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR)
    ),
):
    """Atualiza os dados de um aluno"""
    aluno = db.query(Aluno).filter(Aluno.id == aluno_id).first()
    if not aluno:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Aluno não encontrado"
        )

    update_data = aluno_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(aluno, field, value)

    db.commit()
    db.refresh(aluno)
    return aluno


@router.get("/alunos", response_model=List[AlunoResponse])
async def list_alunos(
    skip: int = 0,
    limit: int = 100,
    turma_id: int = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR)
    ),
):
    """Lista todos os alunos"""
    query = db.query(Aluno)

    if turma_id:
        query = query.filter(Aluno.turma_id == turma_id)

    alunos = query.offset(skip).limit(limit).all()
    return alunos


# --- Endpoints de Professores ---


@router.post(
    "/professores",
    response_model=ProfessorResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_professor(
    professor_data: ProfessorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Cadastra um novo professor"""
    db_professor = Professor(**professor_data.model_dump())
    db.add(db_professor)
    db.commit()
    db.refresh(db_professor)
    return db_professor


@router.get("/professores", response_model=list[ProfessorResponse])
async def list_professores(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(TipoUsuario.GESTOR, TipoUsuario.PROFESSOR)
    ),
):
    """Lista todos os professores cadastrados"""
    professores = db.query(Professor).all()
    return professores


@router.get("/professores/{professor_id}", response_model=ProfessorResponse)
async def get_professor(
    professor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retorna os detalhes de um professor"""
    professor = db.query(Professor).filter(Professor.id == professor_id).first()
    if not professor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Professor não encontrado"
        )
    return professor


# --- Endpoints de Responsáveis ---


@router.post(
    "/responsaveis",
    response_model=ResponsavelResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_responsavel(
    responsavel_data: ResponsavelCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Cadastra um novo responsável"""
    db_responsavel = Responsavel(**responsavel_data.model_dump())
    db.add(db_responsavel)
    db.commit()
    db.refresh(db_responsavel)
    return db_responsavel


@router.get("/responsaveis/{responsavel_id}", response_model=ResponsavelResponse)
async def get_responsavel(
    responsavel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retorna os detalhes de um responsável"""
    responsavel = db.query(Responsavel).filter(Responsavel.id == responsavel_id).first()
    if not responsavel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Responsável não encontrado"
        )
    return responsavel


# --- Endpoints de Gestores ---


@router.post(
    "/gestores", response_model=GestorResponse, status_code=status.HTTP_201_CREATED
)
async def create_gestor(
    gestor_data: GestorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(TipoUsuario.GESTOR)),
):
    """Cadastra um novo gestor escolar"""
    db_gestor = GestorEscolar(**gestor_data.model_dump())
    db.add(db_gestor)
    db.commit()
    db.refresh(db_gestor)
    return db_gestor
