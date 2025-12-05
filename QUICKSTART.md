# 🚀 Início Rápido - Kazumi Backend

Este guia irá te ajudar a colocar o Kazumi funcionando em poucos minutos!

## ⚡ Instalação Rápida (5 minutos)

### Pré-requisitos
- Python 3.9+
- PostgreSQL 12+

### Passo a Passo

1. **Clone e entre no diretório:**
```bash
git clone <repository-url>
cd kazumi
```

2. **Crie e ative o ambiente virtual:**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure o banco de dados:**

Crie o banco no PostgreSQL:
```sql
CREATE DATABASE incluapp;
```

Copie o arquivo de exemplo e configure:
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Edite o `.env` e ajuste a linha do banco:
```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/incluapp
SECRET_KEY=qualquer-chave-secreta-para-desenvolvimento
```

5. **Execute as migrações:**
```bash
alembic upgrade head
```

6. **Popule o banco com dados de exemplo (opcional):**
```bash
python scripts/seed_data.py
```

7. **Inicie o servidor:**
```bash
uvicorn app.main:app --reload
```

🎉 **Pronto!** Acesse:
- API: http://localhost:8000
- Documentação: http://localhost:8000/docs

---

## 🧪 Testando a API

### 1. Criar um Gestor (primeiro usuário)

```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gestor@escola.com",
    "senha": "gestor123",
    "nome_completo": "Maria Silva",
    "telefone": "11999999999",
    "tipo_usuario": "gestor"
  }'
```

### 2. Fazer Login

```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=gestor@escola.com&password=gestor123"
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Copie o `access_token` para usar nos próximos comandos!**

### 3. Acessar seu Perfil

```bash
curl -X GET "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Criar uma Disciplina

```bash
curl -X POST "http://localhost:8000/api/disciplinas/" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Matemática",
    "codigo": "MAT001",
    "descricao": "Disciplina de Matemática",
    "carga_horaria": 80
  }'
```

### 5. Criar uma Turma

```bash
curl -X POST "http://localhost:8000/api/turmas/" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "7º Ano A",
    "codigo": "7A2024",
    "ano_letivo": 2024,
    "serie": "7º ano",
    "turno": "matutino",
    "capacidade": 30
  }'
```

---

## 📖 Próximos Passos

### Usando os Dados de Exemplo

Se você executou o script `seed_data.py`, já tem estes usuários prontos:

| Tipo | Email | Senha |
|------|-------|-------|
| Gestor | gestor@escola.com | gestor123 |
| Professor | professor@escola.com | prof123 |
| Responsável | responsavel@email.com | resp123 |
| Aluno | aluno@escola.com | aluno123 |

### Explorando a Documentação Interativa

Acesse http://localhost:8000/docs para:
- Ver todos os endpoints disponíveis
- Testar a API diretamente no navegador
- Ver exemplos de requisição/resposta
- Autenticar e testar com seu token

### Fluxo Típico de Uso

1. **Gestor cria a estrutura:**
   - Cadastra disciplinas
   - Cria turmas
   - Cadastra professores
   - Cadastra responsáveis
   - Cadastra alunos

2. **Professor gerencia conteúdo:**
   - Cria atividades para as turmas
   - Lança avaliações
   - Cria eventos
   - Envia mensagens para responsáveis
   - Cria e gerencia PEIs para alunos com necessidades especiais

3. **Responsável acompanha:**
   - Recebe mensagens da escola
   - Visualiza atividades do(s) filho(s)
   - Vê avaliações e notas
   - Confirma presença em eventos
   - Acompanha o PEI (se houver)

4. **Aluno acessa:**
   - Vê suas atividades
   - Registra entregas
   - Visualiza suas notas

5. **Gestor monitora:**
   - Acessa relatórios de engajamento
   - Vê estatísticas de comunicação
   - Acompanha desempenho das turmas
   - Monitora PEIs ativos

---

## 🎯 Casos de Uso Principais

### 1. Comunicação Escola-Família

```bash
# Professor envia mensagem para responsável
POST /api/mensagens/
{
  "destinatario_id": 3,
  "assunto": "Reunião de Pais",
  "conteudo": "Convocamos para reunião dia 15/03"
}

# Responsável confirma leitura
POST /api/mensagens/{id}/confirmar-leitura
```

### 2. Gestão de Alunos com Necessidades Especiais

```bash
# Criar PEI para o aluno
POST /api/pei/
{
  "aluno_id": 5,
  "data_inicio": "2024-01-15",
  "objetivos": "Desenvolver habilidades...",
  "adaptacoes_curriculares": "Tempo adicional..."
}

# Registrar intervenção pedagógica
POST /api/pei/{pei_id}/intervencoes
{
  "data_intervencao": "2024-02-10",
  "tipo_intervencao": "Individual",
  "descricao": "Atividade de reforço..."
}
```

### 3. Atividades e Avaliações

```bash
# Professor cria atividade
POST /api/atividades/
{
  "turma_id": 1,
  "disciplina_id": 2,
  "titulo": "Lista de Exercícios",
  "data_entrega": "2024-03-01"
}

# Aluno registra entrega
POST /api/atividades/{id}/entrega
{
  "aluno_id": 5,
  "concluida": true
}
```

### 4. Relatórios para Gestão

```bash
# Ver engajamento de responsáveis
GET /api/relatorios/engajamento-geral?dias=30

# Estatísticas de comunicação
GET /api/relatorios/comunicacao?dias=30

# Acompanhamento de PEIs
GET /api/relatorios/pei/acompanhamento
```

---

## 🐳 Usando Docker (Alternativa)

Se preferir usar Docker:

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Executar migrações
docker-compose exec api alembic upgrade head

# Parar serviços
docker-compose down
```

---

## ❓ Problemas Comuns

### Erro de conexão com o banco
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solução:** Verifique se o PostgreSQL está rodando e as credenciais no `.env` estão corretas.

### Erro "alembic: command not found"
**Solução:** Certifique-se de ter ativado o ambiente virtual:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Porta 8000 já em uso
**Solução:** Use outra porta:
```bash
uvicorn app.main:app --reload --port 8001
```

---

## 📚 Documentação Completa

- [README.md](README.md) - Visão geral e instalação
- [API_REFERENCE.md](API_REFERENCE.md) - Referência completa da API
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guia de deploy em produção

---

## 🤝 Ajuda

Se encontrar problemas:
1. Verifique os logs: olhe no terminal onde o servidor está rodando
2. Consulte a documentação em http://localhost:8000/docs
3. Abra uma issue no repositório

---

**Bom desenvolvimento! 🚀**

