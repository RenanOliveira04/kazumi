# 🏗️ Arquitetura do Sistema Kazumi - AWS

## 📊 Visão Geral

O sistema Kazumi é uma aplicação web full-stack implantada na AWS, utilizando EC2 para hospedagem e S3 para armazenamento de arquivos. A arquitetura é containerizada com Docker para facilitar o deploy e a escalabilidade.

---

## 🎯 Diagrama de Arquitetura AWS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INTERNET / USUÁRIOS                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS/HTTP
                                 │
                    ┌────────────▼────────────┐
                    │    Route 53 (Opcional)  │
                    │    DNS: kazumi.com.br   │
                    └────────────┬────────────┘
                                 │
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                          AWS EC2 INSTANCE                                │
│                    ec2-3-137-179-33.us-east-2                           │
│                         (us-east-2 - Ohio)                              │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    DOCKER COMPOSE                                │   │
│  │                                                                  │   │
│  │  ┌───────────────────────────────────────────────────────┐     │   │
│  │  │         NGINX Container (Port 80)                      │     │   │
│  │  │  ┌──────────────────────────────────────────────┐     │     │   │
│  │  │  │  • Serve Frontend (React SPA)                │     │     │   │
│  │  │  │  • Reverse Proxy para API                    │     │     │   │
│  │  │  │  • CORS Headers                              │     │     │   │
│  │  │  │  • Cache de Assets Estáticos                 │     │     │   │
│  │  │  └──────────────────────────────────────────────┘     │     │   │
│  │  └───────────────────────┬───────────────────────────────┘     │   │
│  │                          │ Proxy /api → :8000                  │   │
│  │  ┌───────────────────────▼───────────────────────────────┐     │   │
│  │  │      FastAPI Backend Container (Port 8000)            │     │   │
│  │  │  ┌──────────────────────────────────────────────┐     │     │   │
│  │  │  │  • REST API Endpoints                        │     │     │   │
│  │  │  │  • Autenticação JWT                          │     │     │   │
│  │  │  │  • Business Logic                            │     │     │   │
│  │  │  │  • Upload de Arquivos → S3                   │◄────┼─────┼───┼────┐
│  │  │  │  • CORS Configurado                          │     │     │   │    │
│  │  │  └──────────────┬───────────────────────────────┘     │     │   │    │
│  │  └─────────────────┼───────────────────────────────────┘     │   │    │
│  │                    │                                          │   │    │
│  │  ┌─────────────────▼───────────────────────────────────┐     │   │    │
│  │  │      PostgreSQL Container (Port 5432)               │     │   │    │
│  │  │  ┌──────────────────────────────────────────────┐   │     │   │    │
│  │  │  │  • Banco de Dados Relacional                │   │     │   │    │
│  │  │  │  • Armazena: Usuários, Alunos, PEI,         │   │     │   │    │
│  │  │  │    Mensagens, Eventos, etc.                 │   │     │   │    │
│  │  │  │  • Volume Persistente                       │   │     │   │    │
│  │  │  └──────────────────────────────────────────────┘   │     │   │    │
│  │  └─────────────────────────────────────────────────────┘     │   │    │
│  │                                                               │   │    │
│  └───────────────────────────────────────────────────────────────┘   │    │
│                                                                       │    │
│  Security Group:                                                      │    │
│    • Port 22  (SSH)                                                   │    │
│    • Port 80  (HTTP)                                                  │    │
│    • Port 443 (HTTPS - com SSL)                                       │    │
│    • Port 8000 (API - dev/test)                                       │    │
│    • Port 8080 (Frontend - dev/test)                                  │    │
└───────────────────────────────────────────────────────────────────────┘    │
                                                                              │
                          S3 Upload/Download via boto3                       │
                                                                              │
┌─────────────────────────────────────────────────────────────────────┐     │
│                        AWS S3 BUCKET                                 │     │
│                      kazumi-storage                                  │◄────┘
│                      (us-east-2)                                     │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  profile-pictures/                                          │    │
│  │    └── user_123/                                            │    │
│  │         ├── abc123.jpg  (público)                           │    │
│  │         └── def456.png                                      │    │
│  │                                                             │    │
│  │  student-documents/                                         │    │
│  │    └── student_456/                                         │    │
│  │         ├── relatorio.pdf  (privado)                        │    │
│  │         └── laudo.pdf                                       │    │
│  │                                                             │    │
│  │  educational-materials/                                     │    │
│  │    ├── guia-inclusao.pdf  (público)                         │    │
│  │    ├── video-tutorial.mp4                                   │    │
│  │    └── apresentacao.pptx                                    │    │
│  │                                                             │    │
│  │  backups/                                                   │    │
│  │    ├── db-backup-20231205.sql                              │    │
│  │    └── db-backup-20231204.sql                              │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Configurações:                                                      │
│    • CORS: Permite acesso do EC2                                     │
│    • Bucket Policy: Leitura pública para alguns diretórios           │
│    • IAM User: kazumi-app-user (credenciais no .env)                 │
│    • Encryption: Server-side encryption (SSE-S3)                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

### 1. Acesso de Usuário (Navegação)

```
┌──────────┐       HTTP        ┌──────────┐      Proxy       ┌──────────┐
│          │ ──────────────────>│          │ ───────────────> │          │
│ Navegador│                    │  NGINX   │                  │  FastAPI │
│          │ <──────────────────│  :80     │ <────────────────│  :8000   │
└──────────┘     HTML/JS/CSS    └──────────┘    JSON/API      └──────────┘
                                      ▲
                                      │
                                      │ Static Files
                                      │
                               React Build
                              (dist folder)
```

### 2. Upload de Arquivo

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│ Frontend │ ─────POST────────>│  FastAPI │                  │   S3     │
│ (React)  │  /upload/profile- │ Backend  │ ───boto3.put───> │  Bucket  │
│          │       picture     │          │                  │          │
└──────────┘                  └──────────┘                  └──────────┘
                                    │
                                    │ Save URL
                                    ▼
                              ┌──────────┐
                              │PostgreSQL│
                              │   DB     │
                              └──────────┘

Passos:
1. Usuário seleciona foto no frontend
2. Frontend envia para API com Authorization Bearer token
3. API valida: tipo de arquivo, tamanho, permissões
4. API faz upload para S3 usando boto3
5. S3 retorna URL pública
6. API salva URL no banco de dados
7. API retorna URL para frontend
```

### 3. Leitura de Arquivo

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│ Frontend │ ────GET URL───────>│PostgreSQL│                  │   S3     │
│ (React)  │ (via API)         │    DB    │                  │  Bucket  │
│          │                   └──────────┘                  │          │
│          │                                                 │          │
│  <img>   │ ──────HTTP GET──────────────────────────────────> │          │
│  src=url │                  Acesso Direto                │          │
└──────────┘ <────Imagem────────────────────────────────────┘          │
                                                            └──────────┘

Passos:
1. Frontend busca metadados (incluindo URL S3) via API
2. Browser faz requisição HTTP direta para S3
3. S3 retorna arquivo (se público) ou 403 (se privado)
4. Arquivos privados: backend gera URL assinada (presigned URL)
```

---

## 🔐 Segurança

### IAM (Identity and Access Management)

```
┌─────────────────────────────────────────┐
│        IAM User: kazumi-app-user        │
│                                         │
│  Credentials:                           │
│  • Access Key ID                        │
│  • Secret Access Key                    │
│                                         │
│  Attached Policy: KazumiS3Access        │
│  ┌─────────────────────────────────┐   │
│  │ Permissions:                    │   │
│  │  • s3:PutObject                 │   │
│  │  • s3:GetObject                 │   │
│  │  • s3:DeleteObject              │   │
│  │  • s3:ListBucket                │   │
│  │                                 │   │
│  │ Resources:                      │   │
│  │  • arn:aws:s3:::kazumi-storage  │   │
│  │  • arn:aws:s3:::kazumi-storage/*│   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Camadas de Segurança

1. **Network Layer**

   - Security Groups no EC2
   - Apenas portas necessárias abertas
   - SSH restrito a IPs específicos (recomendado)

2. **Application Layer**

   - JWT para autenticação
   - CORS configurado
   - Validação de tipos de arquivo
   - Limites de tamanho de arquivo

3. **Data Layer**

   - PostgreSQL isolado em container privado
   - S3 com políticas de acesso granulares
   - Credenciais em .env (não commitadas)

4. **File Storage Layer**
   - IAM policies restritivas
   - Bucket policies para controle de acesso
   - Encryption at rest no S3

---

## 📦 Componentes e Tecnologias

### Frontend (Container 1)

```
┌────────────────────────────────┐
│   NGINX + React                │
│                                │
│ • React 18                     │
│ • Vite (Build Tool)            │
│ • TypeScript                   │
│ • Tailwind CSS                 │
│ • Shadcn/ui Components         │
│ • React Router                 │
│ • Axios (HTTP Client)          │
│                                │
│ Build: Multi-stage Dockerfile  │
│ Port: 80                       │
└────────────────────────────────┘
```

### Backend (Container 2)

```
┌────────────────────────────────┐
│   FastAPI + Python             │
│                                │
│ • FastAPI                      │
│ • SQLAlchemy (ORM)             │
│ • Alembic (Migrations)         │
│ • Pydantic (Validation)        │
│ • JWT Authentication           │
│ • boto3 (AWS SDK)              │
│ • python-multipart (Upload)    │
│                                │
│ Port: 8000                     │
└────────────────────────────────┘
```

### Database (Container 3)

```
┌────────────────────────────────┐
│   PostgreSQL 15                │
│                                │
│ • Relational Database          │
│ • Persistent Volume            │
│ • Automatic Backups            │
│                                │
│ Port: 5432 (internal)          │
└────────────────────────────────┘
```

### File Storage (S3)

```
┌────────────────────────────────┐
│   AWS S3 Bucket                │
│                                │
│ • Object Storage               │
│ • 99.999999999% Durability     │
│ • CDN-ready                    │
│ • Lifecycle Policies           │
│ • Versioning (opcional)        │
│                                │
│ Region: us-east-2              │
└────────────────────────────────┘
```

---

## 🌊 Fluxo Completo de Requisição

### Exemplo: Usuário Faz Upload de Foto de Perfil

```
1. ┌─────────┐
   │ Browser │ Usuário clica em "Upload de Foto"
   └────┬────┘
        │
        ▼
2. Frontend valida arquivo (tipo, tamanho)
   file.type === 'image/jpeg' ✓
   file.size < 5MB ✓
        │
        ▼
3. Frontend envia POST para API
   POST /upload/profile-picture
   Headers: {
     Authorization: "Bearer eyJ0eXAi..."
     Content-Type: "multipart/form-data"
   }
   Body: FormData com arquivo
        │
        ▼
4. ┌──────────┐
   │  NGINX   │ Recebe requisição na porta 80
   └────┬─────┘
        │
        │ Proxy para backend
        ▼
5. ┌──────────┐
   │ FastAPI  │ Backend recebe requisição
   └────┬─────┘
        │
        ├─> Verifica JWT token ✓
        ├─> Valida permissões ✓
        ├─> Valida tipo de arquivo ✓
        ├─> Valida tamanho ✓
        │
        ▼
6. Backend prepara upload para S3
   • Gera nome único: uuid4() + extensão
   • Define path: profile-pictures/user_123/abc.jpg
   • Define metadata: content-type, ACL
        │
        ▼
7. ┌──────────┐
   │boto3 SDK │ s3_client.upload_fileobj()
   └────┬─────┘
        │
        │ HTTPS
        ▼
8. ┌──────────┐
   │   AWS    │ S3 armazena arquivo
   │    S3    │ Retorna URL pública
   └────┬─────┘
        │
        │ URL: https://kazumi-storage.s3...
        ▼
9. ┌──────────┐
   │FastAPI   │ Salva URL no banco de dados
   │          │ UPDATE users SET photo_url = '...'
   └────┬─────┘
        │
        ▼
10.Backend retorna resposta
   {
     "success": true,
     "url": "https://kazumi-storage.s3...",
     "message": "Foto enviada com sucesso!"
   }
        │
        ▼
11.┌─────────┐
   │Frontend │ Atualiza UI com nova foto
   │ React   │ <img src={url} />
   └─────────┘
```

---

## 💰 Estimativa de Custos AWS (Mensal)

### EC2

```
Tipo de Instância: t2.medium (recomendado)
• vCPUs: 2
• RAM: 4 GB
• Custo: ~$33/mês (us-east-2)
• Storage (EBS): 30GB = ~$3/mês

Alternativa econômica: t2.micro (free tier)
• vCPUs: 1
• RAM: 1 GB
• Custo: $0 (primeiro ano) ou ~$8.50/mês
```

### S3

```
Armazenamento: 50 GB
• Standard Storage: $1.15/mês
• PUT Requests: ~5000 = $0.03/mês
• GET Requests: ~50000 = $0.02/mês

Transfer OUT (para internet):
• Primeiros 100GB: Grátis
• Depois: $0.09/GB
```

### Total Estimado

```
Cenário Mínimo (t2.micro):  ~$10-15/mês
Cenário Recomendado (t2.medium): ~$40-50/mês
```

---

## 🚀 Escalabilidade Futura

### Horizontal Scaling

```
┌─────────────┐
│ Load Balancer│
│   (ALB)      │
└──────┬───────┘
       │
       ├──────> EC2 Instance 1
       ├──────> EC2 Instance 2
       └──────> EC2 Instance 3
           │
           └──────> RDS PostgreSQL
                    (Managed DB)
```

### Melhorias Possíveis

1. **CloudFront CDN** - Cache de assets estáticos
2. **RDS** - PostgreSQL gerenciado
3. **ElastiCache** - Cache Redis/Memcached
4. **Auto Scaling Group** - Escala automática
5. **ECS/EKS** - Orquestração de containers
6. **S3 + CloudFront** - Distribuição global de arquivos

---

## 📊 Monitoramento

### CloudWatch (AWS)

- Métricas de EC2 (CPU, RAM, Network)
- Métricas de S3 (Storage, Requests)
- Logs de aplicação
- Alarmes configuráveis

### Application Logs

```bash
# Ver logs em tempo real no EC2
docker-compose logs -f

# Logs específicos
docker-compose logs frontend
docker-compose logs api
docker-compose logs db
```

---

## 🔄 CI/CD Pipeline (Futuro)

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  GitHub  │────>│  GitHub  │────>│  Docker  │────>│   EC2    │
│   Push   │     │ Actions  │     │   Build  │     │  Deploy  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                       │
                       ├─> Run Tests
                       ├─> Build Images
                       ├─> Push to Registry
                       └─> Deploy to Production
```

---

## 📚 Referências Técnicas

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Docker Documentation](https://docs.docker.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

---

**Última atualização**: Dezembro 2024
**Versão da Arquitetura**: 1.0
**Ambiente**: Produção (us-east-2)
