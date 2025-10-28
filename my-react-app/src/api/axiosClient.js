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

export default apiClient;
