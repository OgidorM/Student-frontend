import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API wrapper para Temas
export const temasApi = {
  // GET /temas - Lista todos os temas
  getTemas: () => apiClient.get('/temas'),

  // GET /temas/{id} - Obtém detalhes de um tema
  getTema: (id) => apiClient.get(`/temas/${id}`),

  // POST /temas - Cria um novo tema
  createTema: (temaData) => apiClient.post('/temas', temaData),

  // PUT /temas/{id} - Atualiza um tema
  updateTema: (id, temaData) => apiClient.put(`/temas/${id}`, temaData),

  // DELETE /temas/{id} - Exclui um tema
  deleteTema: (id) => apiClient.delete(`/temas/${id}`),
};

// API wrapper para Submissões
export const submissoesApi = {
  // GET /submissoes/history/:utilizadorId - Obtém histórico de submissões do utilizador
  getHistory: (utilizadorId) => apiClient.get(`/submissoes/history/${utilizadorId}`),

  // GET /submissoes/:id - Obtém detalhes de uma submissão específica
  getById: (id) => apiClient.get(`/submissoes/${id}`),

  // POST /submissoes - Cria uma nova submissão
  create: (data) => apiClient.post('/submissoes', data),

  // GET /submissoes/:id/respostas - Lista as respostas de uma submissão
  listarRespostas: (id) => apiClient.get(`/submissoes/${id}/respostas`),

  // POST /submissoes/:id/respostas - Guarda as respostas numa submissão existente
  guardarRespostas: (id, data) => apiClient.post(`/submissoes/${id}/respostas`, data),

  // PUT /submissoes/:id/finalizar - Finaliza a submissão e calcula a pontuação
  finalizarSubmissao: (id) => apiClient.put(`/submissoes/${id}/finalizar`),
};

// API wrapper para Quizzes
export const quizzesApi = {
  // GET /quizzes - Lista todos os quizzes
  getAll: () => apiClient.get('/quizzes'),

  // POST /quizzes/gerar - Gera um novo quiz com IA
  gerar: (data) => apiClient.post('/quizzes/gerar', data),

  // GET /quizzes/:id - Obtém detalhes básicos de um quiz
  getById: (id) => apiClient.get(`/quizzes/${id}`),

  // GET /quizzes/:id/full - Obtém quiz completo com perguntas e respostas (QuizzController.getFull)
  getFull: (id) => apiClient.get(`/quizzes/${id}/full`),
};

export default apiClient;
