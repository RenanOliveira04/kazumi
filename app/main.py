from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    auth,
    users,
    pei,
    mensagens,
    notificacoes,
    eventos,
    atividades,
    disciplinas,
    turmas,
    escolas,
    avaliacoes,
    metricas,
    relatorios,
    upload,
)

app = FastAPI(
    title="IncluApp API",
    description="API do IncluApp - Sistema de comunicação escola-família com foco em inclusão educacional",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão dos routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(pei.router)
app.include_router(mensagens.router)
app.include_router(notificacoes.router)
app.include_router(eventos.router)
app.include_router(atividades.router)
app.include_router(disciplinas.router)
app.include_router(turmas.router)
app.include_router(escolas.router)
app.include_router(avaliacoes.router)
app.include_router(metricas.router)
app.include_router(relatorios.router)
app.include_router(upload.router)


@app.get("/")
def read_root():
    """Endpoint raiz da API"""
    return {"message": "Bem-vindo ao IncluApp API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health_check():
    """Endpoint de health check"""
    return {"status": "healthy"}
