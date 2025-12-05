# 🚀 Comandos Rápidos - Deploy no Amazon Linux

## 📋 Checklist Rápido

### 1. Preparar Arquivos no EC2

```bash
# Conectar ao EC2
ssh -i ~/.ssh/kazumi.pem ec2-user@ec2-3-137-179-33.us-east-2.compute.amazonaws.com

# Criar diretório e clonar projeto
cd ~
gh repo clone seu-usuario/kazumi
cd kazumi

# OU sincronizar via rsync do seu PC:
# rsync -avz --exclude 'node_modules' --exclude '.git' \
#   -e "ssh -i ~/.ssh/kazumi.pem" \
#   /caminho/local/kazumi/ ec2-user@ec2-3-137-179-33.us-east-2.compute.amazonaws.com:~/kazumi/
```

### 2. Configurar .env

```bash
cd ~/kazumi
nano .env
```

Cole e preencha:

```env
DATABASE_URL=postgresql://kazumi_user:kazumi_password@db:5432/kazumi
SECRET_KEY=sua-chave-secreta-aqui
CORS_ORIGINS=http://ec2-3-137-179-33.us-east-2.compute.amazonaws.com,http://3.137.179.33,http://localhost:8080
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=us-east-2
S3_BUCKET_NAME=kazumi-storage
ENVIRONMENT=production
```

Salvar: `Ctrl+O`, `Enter`, `Ctrl+X`

### 3. Build e Start

```bash
# Build das imagens
docker-compose build

# Iniciar containers
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 4. Verificar Status

```bash
# Ver containers rodando
docker-compose ps

# Ver logs específicos
docker-compose logs frontend
docker-compose logs api
docker-compose logs db

# Testar endpoints
curl http://localhost:8000/health
curl http://localhost:8080
```

### 5. Acessar do Navegador

- **Frontend**: http://ec2-3-137-179-33.us-east-2.compute.amazonaws.com:8080
- **API Docs**: http://ec2-3-137-179-33.us-east-2.compute.amazonaws.com:8000/docs

---

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Parar containers
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Reiniciar serviço específico
docker-compose restart api
docker-compose restart frontend
docker-compose restart db

# Ver uso de recursos
docker stats

# Rebuild sem cache
docker-compose build --no-cache

# Rebuild e restart
docker-compose up -d --build
```

### Logs e Debug

```bash
# Logs em tempo real
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail=100

# Logs de serviço específico
docker-compose logs -f api

# Entrar no container (debug)
docker-compose exec api bash
docker-compose exec frontend sh
docker-compose exec db psql -U kazumi_user -d kazumi
```

### Banco de Dados

```bash
# Backup
docker-compose exec db pg_dump -U kazumi_user kazumi > backup-$(date +%Y%m%d).sql

# Restaurar
cat backup.sql | docker-compose exec -T db psql -U kazumi_user kazumi

# Conectar ao PostgreSQL
docker-compose exec db psql -U kazumi_user -d kazumi

# Ver tabelas
docker-compose exec db psql -U kazumi_user -d kazumi -c "\dt"
```

### Limpeza

```bash
# Limpar containers parados
docker container prune -f

# Limpar imagens não usadas
docker image prune -a -f

# Limpar volumes não usados (CUIDADO)
docker volume prune -f

# Limpar tudo (CUIDADO: apaga tudo)
docker system prune -a --volumes -f
```

---

## 🆘 Troubleshooting

### Erro: Port already in use

```bash
# Ver o que está usando a porta
sudo netstat -tulpn | grep :8000
sudo netstat -tulpn | grep :8080

# Parar containers conflitantes
docker-compose down
```

### Erro: Cannot connect to database

```bash
# Verificar se DB está saudável
docker-compose ps
docker-compose logs db

# Restart do banco
docker-compose restart db

# Aguardar 10 segundos e testar
sleep 10
docker-compose restart api
```

### Erro: Build failed

```bash
# Limpar cache e rebuild
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Erro: Out of disk space

```bash
# Ver uso de disco
df -h

# Limpar Docker
docker system prune -a --volumes -f

# Ver tamanho de volumes
docker system df
```

---

## 📊 Monitoramento

### Verificar Saúde dos Containers

```bash
# Status detalhado
docker-compose ps

# Health checks
docker inspect kazumi_api | grep -A 5 Health
docker inspect kazumi_db | grep -A 5 Health
docker inspect kazumi_frontend | grep -A 5 Health
```

### Métricas de Performance

```bash
# Uso de CPU e RAM em tempo real
docker stats

# Uso de disco
docker system df

# Logs de tamanho
du -sh ~/kazumi
```

---

## 🔄 Atualização da Aplicação

```bash
# 1. Fazer backup do banco
docker-compose exec db pg_dump -U kazumi_user kazumi > backup-pre-update.sql

# 2. Baixar nova versão (git pull ou rsync)
git pull origin main

# 3. Rebuild e restart
docker-compose down
docker-compose up -d --build

# 4. Verificar logs
docker-compose logs -f
```

---

## ⚙️ Configurações Específicas para Amazon Linux

### Se tiver problema com BuildX

```bash
# Instalar BuildX
mkdir -p ~/.docker/cli-plugins
curl -L "https://github.com/docker/buildx/releases/download/v0.12.0/buildx-v0.12.0.linux-amd64" -o ~/.docker/cli-plugins/docker-buildx
chmod +x ~/.docker/cli-plugins/docker-buildx
docker buildx install
```

### Inicialização Automática

```bash
# Criar script de inicialização
sudo nano /etc/systemd/system/kazumi.service
```

Cole:

```ini
[Unit]
Description=Kazumi Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user/kazumi
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=ec2-user

[Install]
WantedBy=multi-user.target
```

Ativar:

```bash
sudo systemctl enable kazumi
sudo systemctl start kazumi
```

---

## ✅ Checklist Final de Deploy

- [ ] Arquivos sincronizados no EC2
- [ ] `.env` configurado com credenciais corretas
- [ ] S3 bucket criado e configurado
- [ ] Docker e Docker Compose instalados
- [ ] `docker-compose build` executado sem erros
- [ ] `docker-compose up -d` containers rodando
- [ ] Logs sem erros críticos
- [ ] Frontend acessível no navegador
- [ ] Backend /docs acessível
- [ ] Teste de upload S3 funcionando
- [ ] Health checks passando
