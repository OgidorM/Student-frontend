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

  // GET /quiz/start?topic=X - MODIFICADO para retornar múltiplas perguntas
  startQuiz: async (topic) => {
    await delay(600);

    const session = new MockQuizSession(topic);
    activeSessions.set(topic, session);

    // Retornar TODAS as perguntas do quiz de uma vez
    const allQuestions = session.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    if (allQuestions.length === 0) {
      throw {
        response: {
          status: 404,
          data: { message: 'Não há perguntas disponíveis para este tópico' },
        },
      };
    }

    return {
      data: {
        questions: allQuestions,
        topic: topic,
      }
    };
  },

  // POST /quiz/submit - MODIFICADO para receber todas as respostas de uma vez
  submitQuiz: async (topic, userAnswers) => {
    await delay(8000); // Simular processamento da IA (8 segundos)

    const session = activeSessions.get(topic);

    if (!session) {
      throw {
        response: {
          status: 400,
          data: { message: 'Sessão de quiz não encontrada. Inicie um novo quiz.' },
        },
      };
    }

    // Processar todas as respostas
    const results = session.questions.map((question) => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer: userAnswer || null,
        correctAnswer: question.correctAnswer,
        correct: isCorrect,
        explanation: !isCorrect ? question.explanation : null,
        suggestedCid: !isCorrect ? question.suggestedCid : null,
      };
    });

    // Calcular estatísticas
    const correctCount = results.filter((r) => r.correct).length;
    const totalCount = results.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return {
      data: {
        results,
        score: correctCount,
        total: totalCount,
        percentage,
      }
    };
  },
};

// Função auxiliar para resetar todas as sessões (útil para testes)
export const resetAllSessions = () => {
  activeSessions.clear();
};
