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

// Armazenamento temporário de submissões (simula banco de dados)
let submissoesStorage = {};

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

  // ===== SUBMISSÕES E HISTÓRICO =====

  // GET /submissoes/history/:utilizadorId - Retorna todas as submissões do utilizador
  getSubmissoes: async (utilizadorId) => {
    await delay(400);

    // Mock de submissões com quizzes associados
    const mockSubmissoes = [
      {
        id: 1,
        utilizador_id: utilizadorId,
        quizz_id: 1,
        pontuacao: 85,
        datahora: '2025-10-20T14:30:00Z',
        Quizz: {
          id: 1,
          nome: 'Quiz de Matemática Básica',
          tema_id: 1,
          nivel_dificuldade: 2,
        }
      },
      {
        id: 2,
        utilizador_id: utilizadorId,
        quizz_id: 2,
        pontuacao: 92,
        datahora: '2025-10-22T10:15:00Z',
        Quizz: {
          id: 2,
          nome: 'Quiz Avançado de Física',
          tema_id: 2,
          nivel_dificuldade: 3,
        }
      },
      {
        id: 3,
        utilizador_id: utilizadorId,
        quizz_id: 3,
        pontuacao: 78,
        datahora: '2025-10-25T16:45:00Z',
        Quizz: {
          id: 3,
          nome: 'Quiz de Matemática Intermédio',
          tema_id: 1,
          nivel_dificuldade: 2,
        }
      },
      {
        id: 4,
        utilizador_id: utilizadorId,
        quizz_id: 4,
        pontuacao: 95,
        datahora: '2025-10-26T09:20:00Z',
        Quizz: {
          id: 4,
          nome: 'Quiz de Álgebra Avançada',
          tema_id: 1,
          nivel_dificuldade: 3,
        }
      },
      {
        id: 5,
        utilizador_id: utilizadorId,
        quizz_id: 5,
        pontuacao: 88,
        datahora: '2025-10-27T15:10:00Z',
        Quizz: {
          id: 5,
          nome: 'Quiz de Química Orgânica',
          tema_id: 3,
          nivel_dificuldade: 2,
        }
      },
      {
        id: 6,
        utilizador_id: utilizadorId,
        quizz_id: 6,
        pontuacao: 70,
        datahora: '2025-10-28T11:45:00Z',
        Quizz: {
          id: 6,
          nome: 'Quiz de Mecânica Quântica',
          tema_id: 2,
          nivel_dificuldade: 4,
        }
      },
    ];

    return {
      data: mockSubmissoes,
    };
  },

  // POST /quizzes/gerar - Gera um novo quiz com IA
  gerarQuiz: async (utilizadorId, temaId) => {
    await delay(1500); // Simular processamento de IA

    const tema = temasStorage.find(t => t.id === parseInt(temaId));

    if (!tema) {
      throw {
        response: {
          status: 404,
          data: { message: 'Tema não encontrado.' },
        },
      };
    }

    // Simular criação de novo quiz
    const novoQuizzId = Math.floor(Math.random() * 10000) + 100;

    return {
      status: 201,
      data: {
        quizz_id: novoQuizzId,
        message: 'Quiz gerado com sucesso',
      },
    };
  },

  // GET /quizzes/:id/full - Obtém quiz completo com perguntas e respostas
  getQuizFull: async (quizzId) => {
    await delay(500);

    // Mock de quiz completo
    const mockQuizFull = {
      id: parseInt(quizzId),
      nome: `Quiz Completo #${quizzId}`,
      tema_id: 1,
      ativo: true,
      Tema: {
        id: 1,
        nome: 'Matemática'
      },
      Pergunta: [
        {
          id: 1,
          quizz_id: parseInt(quizzId),
          assunto: 'Álgebra',
          corpo: 'Qual é o valor de x na equação 2x + 5 = 15?',
          explicacao: 'Para resolver: 2x = 15 - 5, então 2x = 10, logo x = 5',
          Resposta: [
            { id: 1, pergunta_id: 1, corpo: '5', correta: true },
            { id: 2, pergunta_id: 1, corpo: '10', correta: false },
            { id: 3, pergunta_id: 1, corpo: '7', correta: false },
            { id: 4, pergunta_id: 1, corpo: '3', correta: false },
          ]
        },
        {
          id: 2,
          quizz_id: parseInt(quizzId),
          assunto: 'Geometria',
          corpo: 'Qual é a área de um círculo com raio 3?',
          explicacao: 'A = πr². Com r=3, temos A = π × 9 ≈ 28.27',
          Resposta: [
            { id: 5, pergunta_id: 2, corpo: '28.27', correta: true },
            { id: 6, pergunta_id: 2, corpo: '18.85', correta: false },
            { id: 7, pergunta_id: 2, corpo: '9.42', correta: false },
            { id: 8, pergunta_id: 2, corpo: '12.56', correta: false },
          ]
        },
        {
          id: 3,
          quizz_id: parseInt(quizzId),
          assunto: 'Aritmética',
          corpo: 'Quanto é 15% de 200?',
          explicacao: '15% = 0.15, então 0.15 × 200 = 30',
          Resposta: [
            { id: 9, pergunta_id: 3, corpo: '30', correta: true },
            { id: 10, pergunta_id: 3, corpo: '25', correta: false },
            { id: 11, pergunta_id: 3, corpo: '35', correta: false },
            { id: 12, pergunta_id: 3, corpo: '20', correta: false },
          ]
        }
      ]
    };

    return {
      data: mockQuizFull,
    };
  },

  // GET /submissoes/:id - Obtém detalhes completos de uma submissão
  getSubmissaoDetail: async (submissaoId) => {
    await delay(400);

    const submissao = submissoesStorage[submissaoId];

    if (!submissao) {
      // Se não encontrar no storage, retornar dados mock estáticos
      console.warn('⚠️ Mock: Submissão não encontrada no storage, retornando dados estáticos');

      const mockSubmissaoDetail = {
        id: parseInt(submissaoId),
        utilizador_id: 2,
        quizz_id: 1,
        pontuacao: 66.67,
        datahora: '2025-10-25T16:45:00Z',
        Quizz: {
          id: 1,
          nome: 'Quiz de Matemática Básica'
        },
        RespostaDada: [
          {
            id: 1,
            submissao_id: parseInt(submissaoId),
            pergunta_id: 1,
            resposta_id: 1,
            correta_na_submissao: true,
            Pergunta: {
              id: 1,
              corpo: 'Qual é o valor de x na equação 2x + 5 = 15?',
              assunto: 'Álgebra',
              explicacao: 'Para resolver: 2x = 15 - 5, então 2x = 10, logo x = 5'
            },
            Resposta: {
              id: 1,
              corpo: '5',
              correta: true
            }
          },
          {
            id: 2,
            submissao_id: parseInt(submissaoId),
            pergunta_id: 2,
            resposta_id: 6,
            correta_na_submissao: false,
            Pergunta: {
              id: 2,
              corpo: 'Qual é a área de um círculo com raio 3?',
              assunto: 'Geometria',
              explicacao: 'A = πr². Com r=3, temos A = π × 9 ≈ 28.27'
            },
            Resposta: {
              id: 6,
              corpo: '18.85',
              correta: false
            }
          },
          {
            id: 3,
            submissao_id: parseInt(submissaoId),
            pergunta_id: 3,
            resposta_id: 9,
            correta_na_submissao: true,
            Pergunta: {
              id: 3,
              corpo: 'Quanto é 15% de 200?',
              assunto: 'Aritmética',
              explicacao: '15% = 0.15, então 0.15 × 200 = 30'
            },
            Resposta: {
              id: 9,
              corpo: '30',
              correta: true
            }
          }
        ]
      };

      return {
        data: mockSubmissaoDetail,
      };
    }

    // Construir RespostaDada a partir das respostas validadas
    const RespostaDada = submissao.respostasValidadas?.map((rv, index) => ({
      id: index + 1,
      submissao_id: parseInt(submissaoId),
      pergunta_id: rv.pergunta_id,
      resposta_id: rv.resposta_id,
      correta_na_submissao: rv.correta_na_submissao,
      Pergunta: {
        id: rv.pergunta.id,
        corpo: rv.pergunta.corpo,
        assunto: rv.pergunta.assunto,
        explicacao: rv.pergunta.explicacao
      },
      Resposta: {
        id: rv.resposta.id,
        corpo: rv.resposta.corpo,
        correta: rv.resposta.correta
      }
    })) || [];

    const submissaoDetalhada = {
      id: submissao.id,
      utilizador_id: submissao.utilizador_id,
      quizz_id: submissao.quizz_id,
      pontuacao: submissao.pontuacao,
      datahora: submissao.datahora,
      Quizz: submissao.Quizz,
      RespostaDada
    };

    console.log('✅ Mock: Retornando submissão detalhada:', submissaoDetalhada);

    return {
      data: submissaoDetalhada,
    };
  },

  // POST /submissoes - Cria uma nova submissão
  createSubmissao: async (data) => {
    await delay(300);

    const novaSubmissao = {
      id: Math.floor(Math.random() * 10000) + 100,
      utilizador_id: data.utilizador_id,
      quizz_id: data.quizz_id,
      pontuacao: null,
      datahora: new Date().toISOString(),
      respostas: [], // Array para guardar as respostas
    };

    // Guardar no storage
    submissoesStorage[novaSubmissao.id] = novaSubmissao;

    console.log('✅ Mock: Submissão criada e guardada:', novaSubmissao);

    return {
      status: 201,
      data: novaSubmissao,
    };
  },

  // POST /submissoes/:id/respostas - Guarda as respostas de uma submissão
  guardarRespostas: async (submissaoId, data) => {
    await delay(400);

    const submissao = submissoesStorage[submissaoId];

    if (!submissao) {
      throw {
        response: {
          status: 404,
          data: { error: 'Submissão não encontrada' },
        },
      };
    }

    // Guardar as respostas na submissão
    submissao.respostas = data.respostas || [];
    submissoesStorage[submissaoId] = submissao;

    console.log('✅ Mock: Respostas guardadas na submissão', submissaoId, ':', data.respostas);

    return {
      status: 201,
      data: { message: 'Respostas guardadas com sucesso' },
    };
  },

  // PUT /submissoes/:id/finalizar - Finaliza a submissão e calcula pontuação
  finalizarSubmissao: async (submissaoId) => {
    await delay(500);

    const submissao = submissoesStorage[submissaoId];

    if (!submissao) {
      throw {
        response: {
          status: 404,
          data: { error: 'Submissão não encontrada' },
        },
      };
    }

    // Buscar o quiz para obter as perguntas e respostas corretas
    const quizResponse = await mockApiClient.getQuizFull(submissao.quizz_id);
    const quiz = quizResponse.data;

    // Calcular certas e erradas
    const respostasComValidacao = submissao.respostas.map(resposta => {
      const pergunta = quiz.Pergunta.find(p => p.id === resposta.pergunta_id);
      const respostaSelecionada = pergunta?.Resposta?.find(r => r.id === resposta.resposta_id);
      const correta = respostaSelecionada?.correta || false;

      return {
        ...resposta,
        correta_na_submissao: correta,
        pergunta: pergunta,
        resposta: respostaSelecionada
      };
    });

    const total = respostasComValidacao.length;
    const certas = respostasComValidacao.filter(r => r.correta_na_submissao).length;
    const erradas = total - certas;
    const pontuacao = total > 0 ? (certas / total) * 100 : 0;

    // Atualizar a submissão com a pontuação e respostas validadas
    submissao.pontuacao = pontuacao;
    submissao.respostasValidadas = respostasComValidacao;
    submissao.Quizz = { id: quiz.id, nome: quiz.nome };
    submissoesStorage[submissaoId] = submissao;

    console.log('✅ Mock: Submissão finalizada:', {
      id: submissaoId,
      pontuacao,
      certas,
      erradas,
      total
    });

    return {
      status: 200,
      data: {
        message: 'Submissão finalizada com sucesso',
        pontuacao: pontuacao.toFixed(2),
        total,
        certas,
        erradas,
      },
    };
  },

  // Função auxiliar para resetar todas as sessões (útil para testes)
  resetAllSessions: () => {
    activeSessions.clear();
  },
};
