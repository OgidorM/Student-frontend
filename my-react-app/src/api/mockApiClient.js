import {
  mockUsers,
  mockStats,
  mockTemas,
  MockQuizSession,
  activeSessions,
} from './mockData';

// Simulador de delay de rede (para tornar mais realista)
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Armazenamento temporário de temas (simula banco de dados)
let temasStorage = [...mockTemas];

// Mock API Client
export const mockApiClient = {
  // POST /auth/login
  login: async (nome, password) => {
    await delay(500);

    const user = mockUsers.find(
      (u) => u.username === nome && u.password === password
    );

    if (!user) {
      throw {
        response: {
          status: 401,
          data: { error: 'Credenciais inválidas.' },
        },
      };
    }

    // Return user data matching API structure
    return {
      status: 200,
      data: {
        message: 'Login bem-sucedido.',
        user: {
          nome: user.username,
          id: user.id,
          tipo: 'Aluno'
        }
      },
    };
  },

  // POST /auth/register
  register: async (nome, password) => {
    await delay(500);

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.username === nome);

    if (existingUser) {
      throw {
        response: {
          status: 409,
          data: { error: 'Nome de utilizador já existente.' },
        },
      };
    }

    // Simulate successful registration
    return {
      status: 201,
      data: {
        message: 'Utilizador criado com sucesso.',
        user: { nome, id: Date.now() }
      },
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

  // ===== GESTÃO DE TEMAS =====

  // GET /temas - Lista todos os temas disponíveis
  getTemas: async () => {
    await delay(400);
    return {
      data: temasStorage.filter(tema => tema.ativo)
    };
  },

  // GET /temas/{id} - Obtém detalhes de um tema específico
  getTema: async (id) => {
    await delay(300);
    const tema = temasStorage.find(t => t.id === parseInt(id));

    if (!tema) {
      throw {
        response: {
          status: 404,
          data: { error: 'Tema não encontrado.' },
        },
      };
    }

    return { data: tema };
  },

  // POST /temas - Cria um novo tema
  createTema: async (temaData) => {
    await delay(500);

    if (!temaData.nome || !temaData.descricao) {
      throw {
        response: {
          status: 400,
          data: { error: 'Nome e descrição são obrigatórios.' },
        },
      };
    }

    const novoTema = {
      id: Math.max(...temasStorage.map(t => t.id), 0) + 1,
      nome: temaData.nome,
      descricao: temaData.descricao,
      criacao: new Date().toISOString(),
      ativo: true,
    };

    temasStorage.push(novoTema);

    return {
      status: 201,
      data: novoTema,
    };
  },

  // PUT /temas/{id} - Atualiza um tema existente
  updateTema: async (id, temaData) => {
    await delay(500);

    const index = temasStorage.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: { error: 'Tema não encontrado.' },
        },
      };
    }

    const temaAtualizado = {
      ...temasStorage[index],
      ...(temaData.nome && { nome: temaData.nome }),
      ...(temaData.descricao && { descricao: temaData.descricao }),
    };

    temasStorage[index] = temaAtualizado;

    return {
      status: 200,
      data: temaAtualizado,
    };
  },

  // DELETE /temas/{id} - Exclui (marca como inativo) um tema
  deleteTema: async (id) => {
    await delay(500);

    const index = temasStorage.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
      throw {
        response: {
          status: 404,
          data: { error: 'Tema não encontrado.' },
        },
      };
    }

    // Marca como inativo ao invés de remover
    temasStorage[index].ativo = false;

    return {
      status: 200,
      data: { message: 'Tema excluído com sucesso' },
    };
  },

  // Função auxiliar para resetar todas as sessões (útil para testes)
  resetAllSessions: () => {
    activeSessions.clear();
  },
};
