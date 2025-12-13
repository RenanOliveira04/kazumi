from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User, Professor, Responsavel, GestorEscolar, TipoUsuario
from app.schemas import UserCreate, UserResponse, Token
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["Autenticação"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registra um novo usuário"""
    # Verifica se o email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado"
        )

    # Cria o novo usuário
    db_user = User(
        email=user_data.email,
        senha_hash=get_password_hash(user_data.senha),
        nome_completo=user_data.nome_completo,
        telefone=user_data.telefone,
        tipo_usuario=user_data.tipo_usuario,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Cria o registro específico do tipo de usuário
    try:
        if db_user.tipo_usuario == TipoUsuario.PROFESSOR:
            # Cria registro de professor com matrícula automática
            professor = Professor(
                user_id=db_user.id,
                matricula=f"PROF{db_user.id:05d}",  # Ex: PROF00001
            )
            db.add(professor)
            db.commit()
        elif db_user.tipo_usuario == TipoUsuario.RESPONSAVEL:
            # Cria registro de responsável
            responsavel = Responsavel(user_id=db_user.id)
            db.add(responsavel)
            db.commit()
        elif db_user.tipo_usuario == TipoUsuario.GESTOR:
            # Cria registro de gestor escolar
            gestor = GestorEscolar(user_id=db_user.id)
            db.add(gestor)
            db.commit()
    except Exception as e:
        # Se houver erro ao criar o registro específico, faz rollback do usuário também
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar perfil de {user_data.tipo_usuario.value}: {str(e)}",
        )

    return db_user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    """Realiza o login e retorna um token JWT"""
    # Busca o usuário pelo email (username no form_data é o email)
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário inativo"
        )

    # Cria o token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires,
    )

    return {"access_token": access_token, "token_type": "bearer"}
