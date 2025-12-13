import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  tipo: "reuniao" | "festa" | "apresentacao" | "palestra" | "excursao" | "outro";
  data_evento: string;
  hora_inicio?: string;
  hora_fim?: string;
  local?: string;
  publico_alvo?: string;
  requer_confirmacao: number;
}

export interface Mensagem {
  id: number;
  remetente_id: number;
  destinatario_id: number;
  assunto: string;
  conteudo: string;
  tipo_midia: "texto" | "audio" | "video" | "imagem";
  midia_url?: string;
  enviada_em: string;
  lida_em?: string;
  confirmacao_leitura: boolean;
  remetente?: {
    nome_completo: string;
    tipo_usuario: string;
  };
}

export interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  criada_em: string;
  link_referencia?: string;
}

export interface Aluno {
  id: number;
  user_id: number;
  matricula: string;
  data_nascimento?: string;
  necessidades_especiais:  boolean;
  descricao_necessidades?: string;
  pei_ativo: boolean;
  turma_id?: number | null;
  user?: {
    nome_completo: string;
    email: string;
  };
  turma?: {
    nome: string;
    serie: string;
  };
}

export interface AlunoCreate {
  user_id: number;
  matricula: string;
  data_nascimento?: string;
  necessidades_especiais?: boolean;
  descricao_necessidades?: string;
  pei_ativo?: boolean;
  responsavel_id?: number;
  turma_id?: number;
}

export interface PEI {
  id: number;
  aluno_id: number;
  objetivos: string;
  adaptacoes_curriculares?: string;
  estrategias_ensino?: string;
  recursos_necessarios?: string;
  criterios_avaliacao?: string;
  observacoes?: string;
  ativo: boolean;
  data_inicio: string;
  data_fim?: string;
  criado_em: string;
  atualizado_em?: string;
}

export interface IntervencaoPedagogica {
  id: number;
  pei_id: number;
  data_intervencao: string;
  tipo_intervencao?: string;
  descricao: string;
  resultados_observados?: string;
  proximos_passos?: string;
  criado_em: string;
}

export const eventosApi = {
  list: () => api.get<Evento[]>('/api/eventos'),
  get: (id: number) => api.get<Evento>(`/api/eventos/${id}`),
  create: (data: Partial<Evento>) => api.post<Evento>('/api/eventos', data),
};

export const mensagensApi = {
  listInbox: () => api.get<Mensagem[]>('/api/mensagens'),
  listSent: () => api.get<Mensagem[]>('/api/mensagens/enviadas'),
  send: (data: Partial<Mensagem>) => api.post<Mensagem>('/api/mensagens', data),
  markAsRead: (id: number) => api.post<Mensagem>(`/api/mensagens/${id}/confirmar-leitura`),
};

export const notificacoesApi = {
  list: () => api.get<Notificacao[]>('/api/notificacoes'),
  markAsRead: (id: number) => api.post(`/api/notificacoes/${id}/marcar-lida`),
  getUnreadCount: () => api.get<{ count: number }>('/api/notificacoes/nao-lidas/count'),
};

export const alunosApi = {
  list: () => api.get<Aluno[]>('/api/alunos'),
  get: (id: number) => api.get<Aluno>(`/api/alunos/${id}`),
  create: (data: AlunoCreate) => api.post<Aluno>('/api/alunos', data),
  update: (id: number, data: Partial<AlunoCreate>) => api.put<Aluno>(`/api/alunos/${id}`, data),
};

export const peiApi = {
  getByAluno: (alunoId: number) => api.get<PEI>(`/api/peis/aluno/${alunoId}`),
  getIntervencoes: (peiId: number) => api.get<IntervencaoPedagogica[]>(`/api/peis/${peiId}/intervencoes`),
};

// Turmas (Classes)
export interface Turma {
  id: number;
  nome: string;
  codigo: string;
  serie: string;
  turno: string;
  ano_letivo: number;
  escola_id?: number;
  sala?: string;
  vagas?: number;
  criado_em: string;
  escola?: Escola;
}

export interface TurmaCreate {
  nome: string;
  codigo: string;
  serie: string;
  turno: string;
  ano_letivo: number;
  escola_id?: number;
  sala?: string;
  vagas?: number;
}

export const turmasApi = {
  list: (anoLetivo?: number) => api.get<Turma[]>('/api/turmas', { params: { ano_letivo: anoLetivo } }),
  get: (id: number) => api.get<Turma>(`/api/turmas/${id}`),
  create: (data: TurmaCreate) => api.post<Turma>('/api/turmas', data),
  update: (id: number, data: Partial<TurmaCreate>) => api.put<Turma>(`/api/turmas/${id}`, data),
  delete: (id: number) => api.delete(`/api/turmas/${id}`),
  getAlunos: (id: number) => api.get<Aluno[]>(`/api/turmas/${id}/alunos`),
  getProfessores: (id: number) => api.get(`/api/turmas/${id}/professores`),
  addProfessor: (turmaId: number, professorId: number) => api.post(`/api/turmas/${turmaId}/professores/${professorId}`),
  removeProfessor: (turmaId: number, professorId: number) => api.delete(`/api/turmas/${turmaId}/professores/${professorId}`),
  getResponsaveis: (id: number) => api.get(`/api/turmas/${id}/responsaveis`),
};

// Professores (Teachers)
export const professoresApi = {
  list: () => api.get<Professor[]>('/api/users/professores'),
  get: (id: number) => api.get<Professor>(`/api/users/professores/${id}`),
};

// Professores (Teachers)
export interface Professor {
  id: number;
  user_id: number;
  matricula: string;
  formacao?: string;
  especializacao?: string;
  user?: {
    nome_completo: string;
    email: string;
  };
}

// Atividades (Activities)
export interface Atividade {
  id: number;
  titulo: string;
  descricao: string;
  tipo_atividade?: string;
  disciplina_id?: number;
  turma_id?: number;
  professor_id?: number;
  data_criacao: string;
  data_entrega?: string;
  pontuacao_maxima?: number;
}

export interface AtividadeCreate {
  titulo: string;
  descricao: string;
  tipo_atividade?: string;
  disciplina_id?: number;
  turma_id?: number;
  professor_id?: number;
  data_entrega?: string;
  pontuacao_maxima?: number;
}

export const atividadesApi = {
  list: (turmaId?: number, disciplinaId?: number) => 
    api.get<Atividade[]>('/api/atividades', { 
      params: { turma_id: turmaId, disciplina_id: disciplinaId } 
    }),
  get: (id: number) => api.get<Atividade>(`/api/atividades/${id}`),
  create: (data: AtividadeCreate) => api.post<Atividade>('/api/atividades', data),
  update: (id: number, data: Partial<AtividadeCreate>) => api.put<Atividade>(`/api/atividades/${id}`, data),
};

// Escolas (Schools)
export interface Escola {
  id: number;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  criado_em: string;
  atualizado_em?: string;
}

export interface EscolaCreate {
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

export const escolasApi = {
  list: () => api.get<Escola[]>('/api/escolas'),
  get: (id: number) => api.get<Escola>(`/api/escolas/${id}`),
  create: (data: EscolaCreate) => api.post<Escola>('/api/escolas', data),
  update: (id: number, data: Partial<EscolaCreate>) => api.put<Escola>(`/api/escolas/${id}`, data),
  delete: (id: number) => api.delete(`/api/escolas/${id}`),
  getTurmas: (id: number) => api.get<Turma[]>(`/api/escolas/${id}/turmas`),
};


// Relatórios (Reports)
export interface RelatorioEngajamento {
  periodo_dias: number;
  usuarios_ativos: number;
  total_usuarios: number;
  taxa_ativacao: number;
  total_acoes: number;
  mensagens_enviadas: number;
  eventos_criados: number;
}

export interface RelatorioDesempenho {
  turma_id: number;
  turma_nome: string;
  total_alunos: number;
  alunos_com_pei: number;
  taxa_entrega_atividades: number;
  media_geral: number;
  frequencia_media: number;
}

export interface RelatorioPEI {
  total_alunos_pei: number;
  alunos_por_serie: Array<{
    serie: string;
    quantidade: number;
  }>;
  tipos_necessidades: Array<{
    tipo: string;
    quantidade: number;
  }>;
  progresso_medio: number;
}

export const relatoriosApi = {
  getEngajamentoGeral: (dias?: number, escolaId?: number) => api.get<RelatorioEngajamento>('/api/relatorios/engajamento-geral', { params: { dias, escola_id: escolaId } }),
  getDesempenhoAlunos: (escolaId?: number, turmaId?: number) => api.get<RelatorioDesempenho[]>('/api/relatorios/desempenho-alunos', { params: { escola_id: escolaId, turma_id: turmaId } }),
  getComunicacaoStats: (dias?: number) => api.get('/api/relatorios/comunicacao', { params: { dias } }),
  getAtividadesConclusao: (dias?: number, turmaId?: number) => api.get('/api/relatorios/atividades/conclusao', { params: { dias, turma_id: turmaId } }),
  getPEIAcompanhamento: (escolaId?: number) => api.get<RelatorioPEI>('/api/relatorios/pei/acompanhamento', { params: { escola_id: escolaId } }),
};

export default api;
