# IncluApp - Backend API

Sistema de comunicação escola-família focado em inclusão educacional, desenvolvido com FastAPI e PostgreSQL.

## 📋 Sobre o Projeto

O IncluApp é uma solução prática e acessível para conectar famílias, escolas e gestores educacionais. O sistema facilita:

- Comunicação direta entre escola e família com confirmação de leitura
- Gestão de alunos com necessidades especiais e seus PEIs (Planos Educacionais Individualizados)
- Acompanhamento de atividades, avaliações e eventos escolares
- Interface adaptada para usuários com baixa literacia digital (suporte a áudio, vídeo e linguagem clara)
- Métricas de engajamento para apoiar gestores na tomada de decisão

## 🚀 Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **PostgreSQL** - Banco de dados relacional
- **SQLAlchemy** - ORM para Python
- **Alembic** - Gerenciamento de migrações de banco de dados
- **JWT** - Autenticação baseada em tokens
- **Pydantic** - Validação de dados

## 📦 Instalação

### Pré-requisitos

- Python 3.9+
- PostgreSQL 12+

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd kazumi
```

2. **Crie um ambiente virtual:**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente:**

Copie o arquivo `.env.example` para `.env` e ajuste as configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/incluapp
SECRET_KEY=your-super-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
```

5. **Crie o banco de dados PostgreSQL:**
```bash
# Entre no PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE incluapp;
```

6. **Execute as migrações:**
```bash
alembic upgrade head
```

7. **Inicie o servidor:**
```bash
uvicorn app.main:app --reload
```

A API estará disponível em: `http://localhost:8000`

Documentação interativa: `http://localhost:8000/docs`

## 📚 Estrutura do Projeto

```
kazumi/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação FastAPI principal
│   ├── config.py            # Configurações
│   ├── database.py          # Conexão com banco de dados
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── user.py
│   │   ├── aluno.py
│   │   ├── professor.py
│   │   ├── mensagem.py
│   │   └── ...
│   ├── schemas/             # Schemas Pydantic
│   │   ├── user.py
│   │   ├── aluno.py
│   │   └── ...
│   ├── routers/             # Endpoints da API
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── mensagens.py
│   │   └── ...
│   ├── services/            # Lógica de negócio
│   │   ├── metrics.py
│   │   └── reports.py
│   └── utils/               # Utilitários
│       ├── security.py
│       └── dependencies.py
├── alembic/                 # Migrações de banco
│   └── versions/
├── requirements.txt
├── .env.example
└── README.md
```

## 🔑 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. **Registre um usuário:**
```bash
POST /api/auth/register
{
  "email": "usuario@example.com",
  "senha": "senha123",
  "nome_completo": "Nome do Usuário",
  "tipo_usuario": "gestor"
}
```

2. **Faça login:**
```bash
POST /api/auth/login
{
  "username": "usuario@example.com",
  "password": "senha123"
}
```

3. **Use o token retornado:**
```bash
Authorization: Bearer <seu-token-jwt>
```

## 📖 Principais Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login

### Usuários
- `GET /api/users/me` - Perfil do usuário autenticado
- `PUT /api/users/me` - Atualizar perfil
- `POST /api/users/alunos` - Cadastrar aluno
- `GET /api/users/alunos/{id}` - Detalhes do aluno

### Mensagens
- `POST /api/mensagens/` - Enviar mensagem
- `GET /api/mensagens/` - Listar mensagens recebidas
- `POST /api/mensagens/{id}/confirmar-leitura` - Marcar como lida
- `POST /api/mensagens/broadcast` - Enviar para múltiplos destinatários

### PEI (Plano Educacional Individualizado)
- `POST /api/pei/` - Criar PEI
- `GET /api/pei/aluno/{aluno_id}` - Buscar PEI do aluno
- `POST /api/pei/{pei_id}/intervencoes` - Registrar intervenção

### Eventos
- `POST /api/eventos/` - Criar evento escolar
- `GET /api/eventos/` - Listar eventos
- `GET /api/eventos/{id}` - Detalhes do evento

### Atividades
- `POST /api/atividades/` - Criar atividade
- `GET /api/atividades/` - Listar atividades
- `POST /api/atividades/{id}/entrega` - Registrar entrega

### Relatórios (Gestores)
- `GET /api/relatorios/engajamento-geral` - Métricas gerais
- `GET /api/relatorios/desempenho-alunos` - Desempenho por turma
- `GET /api/relatorios/comunicacao` - Estatísticas de mensagens
- `GET /api/relatorios/pei/acompanhamento` - Progresso dos PEIs

## 👥 Tipos de Usuário

O sistema possui 4 tipos de usuários com diferentes permissões:

1. **Gestor** - Acesso completo ao sistema
2. **Professor** - Gerenciar turmas, atividades, avaliações e PEIs
3. **Responsável** - Visualizar informações dos seus alunos, receber/enviar mensagens
4. **Aluno** - Visualizar suas próprias atividades e avaliações

## 📊 Modelos de Dados Principais

- **User** - Usuário base do sistema
- **Aluno** - Informações do estudante
- **Professor** - Dados do professor
- **Responsavel** - Dados do familiar/responsável
- **GestorEscolar** - Dados administrativos
- **Mensagem** - Comunicados entre usuários
- **PEI** - Plano Educacional Individualizado
- **IntervencaoPedagogica** - Registro de intervenções
- **Atividade** - Tarefas e trabalhos
- **EventoEscolar** - Eventos da escola
- **MetricaEngajamento** - Dados de uso do sistema

## 🔧 Comandos Úteis

### Criar nova migração:
```bash
alembic revision --autogenerate -m "Descrição da migração"
```

### Aplicar migrações:
```bash
alembic upgrade head
```

### Reverter última migração:
```bash
alembic downgrade -1
```

### Executar testes (quando implementados):
```bash
pytest
```

## 🌐 Ambientes

### Desenvolvimento
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Produção
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão com PostgreSQL | `postgresql://user:password@localhost:5432/incluapp` |
| `SECRET_KEY` | Chave secreta para JWT | - |
| `ALGORITHM` | Algoritmo de encriptação JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tempo de expiração do token | `30` |
| `CORS_ORIGINS` | Origens permitidas para CORS | `http://localhost:3000` |
| `ENVIRONMENT` | Ambiente de execução | `development` |

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autores

Desenvolvido para o Projeto Integrador - Uninassau

## 📞 Suporte

Para questões e suporte, entre em contato através do email do projeto ou abra uma issue no repositório.

---

**Nota:** Este é um projeto educacional desenvolvido como parte do Projeto Integrador da disciplina.

