# 📚 Referência da API - IncluApp

## Autenticação

Todos os endpoints protegidos requerem um token JWT no header:
```
Authorization: Bearer <seu-token>
```

---

## 🔐 Autenticação

### Registrar Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "senha": "senha123",
  "nome_completo": "Nome Completo",
  "telefone": "11999999999",
  "tipo_usuario": "gestor" | "professor" | "responsavel" | "aluno"
}
```

**Resposta (201):**
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "nome_completo": "Nome Completo",
  "telefone": "11999999999",
  "tipo_usuario": "gestor",
  "ativo": true,
  "criado_em": "2024-01-01T10:00:00"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=usuario@example.com&password=senha123
```

**Resposta (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 👤 Usuários

### Obter Perfil Atual
```http
GET /api/users/me
Authorization: Bearer <token>
```

### Atualizar Perfil
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome_completo": "Novo Nome",
  "telefone": "11988888888",
  "senha": "nova_senha" (opcional)
}
```

### Cadastrar Aluno
```http
POST /api/users/alunos
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 5,
  "responsavel_id": 3,
  "turma_id": 1,
  "matricula": "ALU001",
  "data_nascimento": "2010-05-15",
  "necessidades_especiais": true,
  "descricao_necessidades": "TDAH",
  "pei_ativo": false
}
```

### Listar Alunos
```http
GET /api/users/alunos?skip=0&limit=100&turma_id=1
Authorization: Bearer <token>
```

---

## 📝 PEI (Plano Educacional Individualizado)

### Criar PEI
```http
POST /api/pei/
Authorization: Bearer <token>
Content-Type: application/json

{
  "aluno_id": 1,
  "data_inicio": "2024-01-01",
  "data_fim": "2024-12-31",
  "objetivos": "Desenvolver concentração...",
  "adaptacoes_curriculares": "Tempo adicional...",
  "estrategias_ensino": "Uso de recursos visuais...",
  "recursos_necessarios": "Material adaptado...",
  "criterios_avaliacao": "Avaliação contínua..."
}
```

### Buscar PEI do Aluno
```http
GET /api/pei/aluno/{aluno_id}
Authorization: Bearer <token>
```

### Registrar Intervenção
```http
POST /api/pei/{pei_id}/intervencoes
Authorization: Bearer <token>
Content-Type: application/json

{
  "pei_id": 1,
  "professor_id": 2,
  "data_intervencao": "2024-01-15",
  "tipo_intervencao": "Individual",
  "descricao": "Atividade de reforço...",
  "resultados_observados": "Melhora na concentração",
  "proximos_passos": "Continuar com atividades..."
}
```

---

## 💬 Mensagens

### Enviar Mensagem
```http
POST /api/mensagens/
Authorization: Bearer <token>
Content-Type: application/json

{
  "destinatario_id": 3,
  "assunto": "Reunião de pais",
  "conteudo": "Convocamos para reunião...",
  "tipo_midia": "texto" | "audio" | "video" | "imagem",
  "midia_url": "https://..." (opcional)
}
```

### Enviar Broadcast
```http
POST /api/mensagens/broadcast
Authorization: Bearer <token>
Content-Type: application/json

{
  "destinatarios_ids": [3, 4, 5],
  "assunto": "Aviso Geral",
  "conteudo": "Comunicado para todos...",
  "tipo_midia": "texto"
}
```

### Listar Mensagens Recebidas
```http
GET /api/mensagens/?skip=0&limit=50&apenas_nao_lidas=false
Authorization: Bearer <token>
```

### Confirmar Leitura
```http
POST /api/mensagens/{mensagem_id}/confirmar-leitura
Authorization: Bearer <token>
```

### Contador de Não Lidas
```http
GET /api/mensagens/stats/nao-lidas
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "nao_lidas": 5
}
```

---

## 🔔 Notificações

### Listar Notificações
```http
GET /api/notificacoes/?skip=0&limit=50&apenas_nao_lidas=false
Authorization: Bearer <token>
```

### Criar Notificação
```http
POST /api/notificacoes/
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": 3,
  "titulo": "Nova Atividade",
  "mensagem": "Foi criada uma nova atividade...",
  "tipo": "aviso" | "lembrete" | "alerta" | "informacao",
  "link_referencia": "/atividades/123"
}
```

### Marcar como Lida
```http
PUT /api/notificacoes/{notificacao_id}/ler
Authorization: Bearer <token>
```

### Contador de Não Lidas
```http
GET /api/notificacoes/nao-lidas/count
Authorization: Bearer <token>
```

---

## 📅 Eventos

### Criar Evento
```http
POST /api/eventos/
Authorization: Bearer <token>
Content-Type: application/json

{
  "turma_id": 1,
  "titulo": "Reunião de Pais",
  "descricao": "Reunião para discussão...",
  "tipo": "reuniao" | "festa" | "apresentacao" | "palestra" | "excursao" | "outro",
  "data_evento": "2024-03-15",
  "hora_inicio": "19:00:00",
  "hora_fim": "21:00:00",
  "local": "Auditório",
  "publico_alvo": "Pais e responsáveis",
  "requer_confirmacao": 1
}
```

### Listar Eventos
```http
GET /api/eventos/?skip=0&limit=100&turma_id=1&data_inicio=2024-01-01&data_fim=2024-12-31
Authorization: Bearer <token>
```

---

## 📚 Atividades

### Criar Atividade
```http
POST /api/atividades/
Authorization: Bearer <token>
Content-Type: application/json

{
  "turma_id": 1,
  "disciplina_id": 2,
  "professor_id": 3,
  "titulo": "Lista de Exercícios",
  "descricao": "Resolver exercícios 1 a 10...",
  "tipo": "Tarefa de casa",
  "data_entrega": "2024-02-01",
  "pontuacao_maxima": 10,
  "anexo_url": "https://..."
}
```

### Listar Atividades
```http
GET /api/atividades/?skip=0&limit=100&turma_id=1&disciplina_id=2
Authorization: Bearer <token>
```

### Registrar Entrega
```http
POST /api/atividades/{atividade_id}/entrega
Authorization: Bearer <token>
Content-Type: application/json

{
  "atividade_id": 1,
  "aluno_id": 5,
  "observacoes": "Atividade concluída",
  "anexo_url": "https://...",
  "concluida": true
}
```

---

## 🏫 Disciplinas

### Criar Disciplina
```http
POST /api/disciplinas/
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Matemática",
  "codigo": "MAT001",
  "descricao": "Disciplina de matemática",
  "carga_horaria": 80
}
```

### Listar Disciplinas
```http
GET /api/disciplinas/?skip=0&limit=100
Authorization: Bearer <token>
```

---

## 🎓 Turmas

### Criar Turma
```http
POST /api/turmas/
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "7º Ano A",
  "codigo": "7A2024",
  "ano_letivo": 2024,
  "serie": "7º ano",
  "turno": "matutino" | "vespertino" | "noturno",
  "capacidade": 30
}
```

### Listar Alunos da Turma
```http
GET /api/turmas/{turma_id}/alunos
Authorization: Bearer <token>
```

---

## 📊 Avaliações

### Criar Avaliação
```http
POST /api/avaliacoes/
Authorization: Bearer <token>
Content-Type: application/json

{
  "aluno_id": 5,
  "disciplina_id": 2,
  "professor_id": 3,
  "titulo": "Prova Bimestral",
  "tipo": "Prova",
  "nota": 8.5,
  "peso": 2.0,
  "data_avaliacao": "2024-03-20",
  "observacoes": "Bom desempenho"
}
```

### Listar Avaliações do Aluno
```http
GET /api/avaliacoes/aluno/{aluno_id}?disciplina_id=2
Authorization: Bearer <token>
```

---

## 📈 Métricas

### Registrar Métrica
```http
POST /api/metricas/registrar
Authorization: Bearer <token>
Content-Type: application/json

{
  "usuario_id": 3,
  "acao": "visualizar_mensagem",
  "categoria": "comunicacao",
  "referencia_id": 123,
  "referencia_tipo": "mensagem",
  "tempo_sessao": 45.5,
  "dispositivo": "mobile",
  "navegador": "Chrome"
}
```

### Engajamento de Responsáveis
```http
GET /api/metricas/engajamento/responsaveis?dias=30
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "total_responsaveis": 50,
  "responsaveis_ativos": 42,
  "taxa_engajamento": 84.0,
  "periodo_dias": 30
}
```

### Tempo Médio de Resposta
```http
GET /api/metricas/tempo-resposta/media?dias=30
Authorization: Bearer <token>
```

### Uso por Perfil
```http
GET /api/metricas/uso-por-perfil?dias=30
Authorization: Bearer <token>
```

---

## 📑 Relatórios

### Engajamento Geral
```http
GET /api/relatorios/engajamento-geral?dias=30
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "periodo_dias": 30,
  "usuarios_ativos": 45,
  "total_usuarios": 52,
  "taxa_ativacao": 86.54,
  "total_acoes": 1250,
  "mensagens_enviadas": 320,
  "eventos_criados": 15
}
```

### Desempenho de Alunos
```http
GET /api/relatorios/desempenho-alunos?turma_id=1
Authorization: Bearer <token>
```

### Estatísticas de Comunicação
```http
GET /api/relatorios/comunicacao?dias=30
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "periodo_dias": 30,
  "total_enviadas": 320,
  "total_lidas": 280,
  "taxa_leitura": 87.5,
  "tempo_medio_resposta_horas": 4.2
}
```

### Participação em Eventos
```http
GET /api/relatorios/eventos/participacao?dias=30
Authorization: Bearer <token>
```

### Taxa de Conclusão de Atividades
```http
GET /api/relatorios/atividades/conclusao?dias=30&turma_id=1
Authorization: Bearer <token>
```

### Acompanhamento de PEIs
```http
GET /api/relatorios/pei/acompanhamento
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "total_alunos_com_pei": 8,
  "alunos": [
    {
      "aluno_id": 5,
      "nome": "Pedro Oliveira",
      "pei_id": 2,
      "data_inicio_pei": "2024-01-15",
      "total_intervencoes": 12
    }
  ]
}
```

---

## 🔍 Health Check

### Verificar Status da API
```http
GET /health
```

**Resposta:**
```json
{
  "status": "healthy"
}
```

---

## 🚨 Códigos de Status HTTP

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `204 No Content` - Requisição bem-sucedida sem conteúdo de resposta
- `400 Bad Request` - Dados inválidos
- `401 Unauthorized` - Não autenticado
- `403 Forbidden` - Sem permissão
- `404 Not Found` - Recurso não encontrado
- `422 Unprocessable Entity` - Erro de validação
- `500 Internal Server Error` - Erro no servidor

---

## 📝 Notas Importantes

1. **Datas**: Use formato ISO 8601 (`YYYY-MM-DD`)
2. **Horários**: Use formato 24h (`HH:MM:SS`)
3. **Paginação**: Use `skip` e `limit` para controlar resultados
4. **Filtros**: Parâmetros de query opcionais para filtrar resultados
5. **Permissões**: Alguns endpoints requerem tipos específicos de usuário

---

## 🔗 Links Úteis

- Documentação Interativa (Swagger): http://localhost:8000/docs
- Documentação Alternativa (ReDoc): http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

