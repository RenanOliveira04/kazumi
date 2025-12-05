# ==========================================
# Dockerfile para o Kazumi Backend (FastAPI)
# ==========================================
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Variáveis de ambiente para Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Atualizar pip para versão mais recente
RUN python -m pip install --upgrade pip

# Copiar requirements.txt primeiro (cache layer)
COPY requirements.txt .

# Instalar dependências Python do requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo o código da aplicação
COPY . .

# Expor porta 8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Comando para executar a aplicação
# 1. Roda migrações do Alembic
# 2. Inicia servidor Uvicorn
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]

