import {
  mockUsers,
  mockStats,
  MockQuizSession,
  activeSessions,
} from './mockData';

// Simulador de delay de rede (para tornar mais realista)
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API Client
export const mockApiClient = {
  // POST /auth/login
  login: async (username, password) => {
    await delay(500);

    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      throw {
        response: {
          status: 401,
          data: { message: 'Credenciais inválidas' },
        },
      };
    }

    return {
      data: { token: user.token },
    };
  },

  // GET /stats
  getStats: async () => {
    await delay(400);
    return { data: mockStats };
  },

  // GET /quiz/start?topic=X
  startQuiz: async (topic) => {
    await delay(600);

    // Criar ou recuperar sessão do quiz
    let session = activeSessions.get(topic);
    if (!session || session.currentIndex >= session.questions.length) {
      session = new MockQuizSession(topic);
      activeSessions.set(topic, session);
    }

    const question = session.getCurrentQuestion();

    if (!question) {
      throw {
        response: {
          status: 404,
          data: { message: 'Não há mais perguntas disponíveis para este tópico' },
        },
      };
    }

    return { data: question };
  },

  // POST /quiz/submit
  submitQuiz: async (questionId, answer, topic) => {
    await delay(500);

    const session = activeSessions.get(topic);

    if (!session) {
      throw {
        response: {
          status: 400,
          data: { message: 'Sessão de quiz não encontrada. Inicie um novo quiz.' },
        },
      };
    }

    const result = session.submitAnswer(questionId, answer);

    if (result.error) {
      throw {
        response: {
          status: 400,
          data: { message: result.error },
        },
      };
    }

    return { data: result };
  },
};

// Função auxiliar para resetar todas as sessões (útil para testes)
export const resetAllSessions = () => {
  activeSessions.clear();
};
