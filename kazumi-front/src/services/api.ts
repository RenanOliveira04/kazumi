import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
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
  necessidades_especiais: boolean;
  descricao_necessidades?: string;
  pei_ativo: boolean;
  user?: {
    nome_completo: string;
    email: string;
  };
  turma?: {
    nome: string;
    serie: string;
  };
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
  list: () => api.get<Evento[]>('/eventos'),
  get: (id: number) => api.get<Evento>(`/eventos/${id}`),
};

export const mensagensApi = {
  listInbox: () => api.get<Mensagem[]>('/mensagens'),
  listSent: () => api.get<Mensagem[]>('/mensagens/enviadas'),
  send: (data: Partial<Mensagem>) => api.post<Mensagem>('/mensagens', data),
  markAsRead: (id: number) => api.post<Mensagem>(`/mensagens/${id}/confirmar-leitura`),
};

export const notificacoesApi = {
  list: () => api.get<Notificacao[]>('/notificacoes'),
  markAsRead: (id: number) => api.post(`/notificacoes/${id}/marcar-lida`),
  getUnreadCount: () => api.get<{ count: number }>('/notificacoes/nao-lidas/count'),
};

export const alunosApi = {
  list: () => api.get<Aluno[]>('/alunos'),
  get: (id: number) => api.get<Aluno>(`/alunos/${id}`),
};

export const peiApi = {
  getByAluno: (alunoId: number) => api.get<PEI>(`/peis/aluno/${alunoId}`),
  getIntervencoes: (peiId: number) => api.get<IntervencaoPedagogica[]>(`/peis/${peiId}/intervencoes`),
};

export default api;
