# 🚀 Guia de Deploy - IncluApp

## Deploy com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Passos para Deploy

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd kazumi
```

2. **Configure as variáveis de ambiente:**

Edite o `docker-compose.yml` e altere as variáveis sensíveis:
- `SECRET_KEY`: Gere uma chave forte
- `POSTGRES_PASSWORD`: Use uma senha segura
- `CORS_ORIGINS`: Configure as origens permitidas

3. **Execute com Docker Compose:**
```bash
docker-compose up -d
```

4. **Verifique os logs:**
```bash
docker-compose logs -f api
```

5. **Acesse a API:**
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs

### Parar os containers:
```bash
docker-compose down
```

### Parar e remover volumes:
```bash
docker-compose down -v
```

---

## Deploy Manual (Servidor Linux)

### 1. Preparar o Servidor

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar Python e PostgreSQL
sudo apt install python3.11 python3.11-venv python3-pip postgresql postgresql-contrib nginx -y
```

### 2. Configurar PostgreSQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE incluapp;
CREATE USER incluapp_user WITH PASSWORD 'senha_segura_aqui';
ALTER ROLE incluapp_user SET client_encoding TO 'utf8';
ALTER ROLE incluapp_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE incluapp_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE incluapp TO incluapp_user;
\q
```

### 3. Configurar a Aplicação

```bash
# Clonar repositório
cd /var/www
sudo git clone <repository-url> incluapp
cd incluapp

# Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
pip install gunicorn
```

### 4. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
sudo nano .env
```

Adicione:
```env
DATABASE_URL=postgresql://incluapp_user:senha_segura_aqui@localhost:5432/incluapp
SECRET_KEY=gere-uma-chave-muito-segura-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://seudominio.com
ENVIRONMENT=production
```

### 5. Executar Migrações

```bash
source venv/bin/activate
alembic upgrade head
```

### 6. Criar Serviço Systemd

```bash
sudo nano /etc/systemd/system/incluapp.service
```

Conteúdo:
```ini
[Unit]
Description=IncluApp FastAPI Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/incluapp
Environment="PATH=/var/www/incluapp/venv/bin"
ExecStart=/var/www/incluapp/venv/bin/gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000 --workers 4

[Install]
WantedBy=multi-user.target
```

### 7. Iniciar o Serviço

```bash
sudo systemctl daemon-reload
sudo systemctl start incluapp
sudo systemctl enable incluapp
sudo systemctl status incluapp
```

### 8. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/incluapp
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Habilitar site
sudo ln -s /etc/nginx/sites-available/incluapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Configurar SSL com Certbot (Opcional mas Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seudominio.com
```

---

## Deploy na Nuvem (Render, Railway, etc.)

### Render.com

1. Conecte seu repositório GitHub
2. Configure o serviço:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Configure as variáveis de ambiente no painel
4. Deploy automático!

### Railway.app

1. Conecte seu repositório
2. Adicione PostgreSQL como serviço
3. Configure variáveis de ambiente
4. Deploy automático!

### Heroku

```bash
# Login no Heroku
heroku login

# Criar app
heroku create incluapp-api

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis
heroku config:set SECRET_KEY=sua-chave-secreta
heroku config:set ENVIRONMENT=production

# Deploy
git push heroku main

# Executar migrações
heroku run alembic upgrade head
```

---

## Monitoramento e Logs

### Ver logs em tempo real:
```bash
# Docker
docker-compose logs -f api

# Systemd
sudo journalctl -u incluapp -f

# Heroku
heroku logs --tail
```

### Verificar saúde da API:
```bash
curl http://localhost:8000/health
```

---

## Backup do Banco de Dados

### Criar backup:
```bash
pg_dump -U incluapp_user incluapp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup:
```bash
psql -U incluapp_user incluapp < backup_20240101_120000.sql
```

---

## Segurança - Checklist

- [ ] Alterar `SECRET_KEY` para valor forte e único
- [ ] Usar senhas fortes para o banco de dados
- [ ] Configurar HTTPS (SSL/TLS)
- [ ] Configurar CORS corretamente
- [ ] Não expor `.env` no repositório
- [ ] Manter dependências atualizadas
- [ ] Configurar rate limiting (se necessário)
- [ ] Configurar backup automático do banco
- [ ] Monitorar logs de erro
- [ ] Usar variáveis de ambiente em produção

---

## Troubleshooting

### Erro de conexão com banco:
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U incluapp_user -h localhost -d incluapp
```

### Erro de permissão:
```bash
# Ajustar permissões
sudo chown -R www-data:www-data /var/www/incluapp
```

### API não inicia:
```bash
# Verificar logs
sudo journalctl -u incluapp -n 50
```

---

## Atualizações

```bash
# Parar serviço
sudo systemctl stop incluapp

# Atualizar código
cd /var/www/incluapp
git pull origin main

# Ativar ambiente virtual
source venv/bin/activate

# Atualizar dependências
pip install -r requirements.txt

# Executar novas migrações
alembic upgrade head

# Reiniciar serviço
sudo systemctl start incluapp
```

