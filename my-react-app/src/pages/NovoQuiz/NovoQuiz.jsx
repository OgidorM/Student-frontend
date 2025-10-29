import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { quizzesApi, submissoesApi } from '../../api/axiosClient.js';
import { mockApiClient } from '../../api/mockApiClient.js';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import { HiArrowLeft, HiLightningBolt, HiCheckCircle, HiClock } from 'react-icons/hi';
import './NovoQuiz.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const NovoQuiz = () => {
  const { quizzId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estado para as respostas do utilizador
  const [respostasUtilizador, setRespostasUtilizador] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ID da submissão criada quando o quiz é carregado
  const [submissaoId, setSubmissaoId] = useState(null);

  useEffect(() => {
    fetchQuizFull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzId]);

  const fetchQuizFull = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Buscando quiz completo...');
      console.log('📋 QuizzId:', quizzId);
      console.log('🔧 Usando Mock:', useMock);

      const response = useMock
        ? await mockApiClient.getQuizFull(quizzId)
        : await quizzesApi.getFull(quizzId);

      console.log('✅ Quiz completo recebido:', response.data);
      console.log('📊 Estrutura do quiz:', {
        id: response.data?.id,
        nome: response.data?.nome,
        temPergunta: !!response.data?.Pergunta,
        numPerguntas: response.data?.Pergunta?.length || 0
      });

      // Validar se tem perguntas
      if (!response.data?.Pergunta || response.data.Pergunta.length === 0) {
        console.error('❌ Quiz não tem perguntas!');
        setError('Este quiz ainda não tem perguntas. Contacte o administrador.');
        setLoading(false);
        return;
      }

      setQuiz(response.data);

      // NÃO CRIAR A SUBMISSÃO AQUI - criar apenas quando submeter o quiz

    } catch (err) {
      console.error('❌ Erro ao buscar quiz:', err);
      console.error('❌ Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });

      const errorMessage = err.response?.data?.error
        || err.response?.data?.message
        || err.message
        || 'Falha ao carregar o quiz';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (perguntaId, respostaId) => {
    setRespostasUtilizador(prev => ({
      ...prev,
      [perguntaId]: respostaId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.Pergunta.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Verificar se todas as perguntas foram respondidas
    const totalPerguntas = quiz.Pergunta.length;
    const totalRespondidas = Object.keys(respostasUtilizador).length;

    if (totalRespondidas < totalPerguntas) {
      const confirmSubmit = window.confirm(
        `Respondeu a ${totalRespondidas} de ${totalPerguntas} perguntas. Deseja submeter mesmo assim?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('📤 Iniciando processo de submissão...');
      console.log('📋 Submissão ID:', submissaoId);

      // Verificar se a submissão foi criada
      let currentSubmissaoId = submissaoId;

      if (!currentSubmissaoId) {
        console.log('⚠️ Submissão não foi criada anteriormente. Criando agora...');
        const createPayload = {
          utilizador_id: user.id,
          quizz_id: parseInt(quizzId)
        };

        const createResponse = useMock
          ? await mockApiClient.createSubmissao(createPayload)
          : await submissoesApi.create(createPayload);

        currentSubmissaoId = createResponse.data.id;
        console.log('✅ Submissão criada com ID:', currentSubmissaoId);
        setSubmissaoId(currentSubmissaoId);
      }

      // ETAPA 1: Guardar as respostas
      console.log('🔧 ETAPA 1: Guardando respostas...');
      console.log('📝 Respostas do utilizador:', respostasUtilizador);

      const respostasFormatadas = Object.entries(respostasUtilizador).map(([perguntaId, respostaId]) => ({
        pergunta_id: parseInt(perguntaId),
        resposta_id: parseInt(respostaId)
      }));

      console.log('📦 Payload de respostas formatadas:', respostasFormatadas);

      const respostasPayload = {
        respostas: respostasFormatadas
      };

      console.log('📤 Enviando respostas para POST /submissoes/' + currentSubmissaoId + '/respostas');
      console.log('📦 Payload completo:', respostasPayload);

      const respostasResponse = useMock
        ? await mockApiClient.guardarRespostas(currentSubmissaoId, respostasPayload)
        : await submissoesApi.guardarRespostas(currentSubmissaoId, respostasPayload);

      console.log('✅ Respostas guardadas:', respostasResponse.data);

      // ETAPA 2: Finalizar a submissão (o backend calcula a pontuação, verifica respostas corretas, cria dificuldades, etc)
      console.log('🔧 ETAPA 2: Finalizando submissão e calculando pontuação...');
      console.log('📤 Enviando para PUT /submissoes/' + currentSubmissaoId + '/finalizar');

      const finalizarResponse = useMock
        ? await mockApiClient.finalizarSubmissao(currentSubmissaoId)
        : await submissoesApi.finalizarSubmissao(currentSubmissaoId);

      console.log('✅ Submissão finalizada:', finalizarResponse.data);
      console.log('📊 Pontuação:', finalizarResponse.data.pontuacao);
      console.log('✔️ Certas:', finalizarResponse.data.certas);
      console.log('❌ Erradas:', finalizarResponse.data.erradas);

      // Navegar para a página de detalhes da submissão
      navigate(`/submissao/${currentSubmissaoId}`);
    } catch (err) {
      console.error('❌ Erro ao submeter quiz:', err);
      console.error('❌ Detalhes do erro:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
        requestData: err.config?.data
      });

      const errorMessage = err.response?.data?.error
        || err.response?.data?.message
        || err.message
        || 'Falha ao submeter o quiz';

      setError('Erro ao guardar respostas: ' + errorMessage);
      setSubmitting(false);
    }
  };

  const getProgress = () => {
    const total = quiz?.Pergunta?.length || 0;
    const respondidas = Object.keys(respostasUtilizador).length;
    return { total, respondidas, percentagem: total > 0 ? (respondidas / total) * 100 : 0 };
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="novo-quiz-main">
          <div className="loading-state">
            <HiLightningBolt className="loading-icon" />
            <p>A carregar o quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="novo-quiz-main">
          <div className="error-state">
            <p className="error-message">{error || 'Quiz não encontrado'}</p>
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              <HiArrowLeft /> Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.Pergunta[currentQuestionIndex];
  const progress = getProgress();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="novo-quiz-main">
        {/* Header */}
        <div className="quiz-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <HiArrowLeft /> Voltar
          </button>

          <div className="quiz-info">
            <h1 className="quiz-title">{quiz.nome}</h1>
            <p className="quiz-theme">Tema: {quiz.Tema?.nome}</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-text">
              Questão {currentQuestionIndex + 1} de {quiz.Pergunta.length}
            </span>
            <span className="progress-answered">
              {progress.respondidas}/{progress.total} respondidas
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.percentagem}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <div className="question-number">Questão {currentQuestionIndex + 1}</div>
            {currentQuestion.assunto && (
              <div className="question-subject">
                <HiCheckCircle /> {currentQuestion.assunto}
              </div>
            )}
          </div>

          <div className="question-body">
            {currentQuestion.corpo}
          </div>

          <div className="answers-list">
            {currentQuestion.Resposta?.map((resposta) => (
              <div
                key={resposta.id}
                className={`answer-option ${
                  respostasUtilizador[currentQuestion.id] === resposta.id ? 'selected' : ''
                }`}
                onClick={() => handleSelectAnswer(currentQuestion.id, resposta.id)}
              >
                <div className="answer-radio">
                  {respostasUtilizador[currentQuestion.id] === resposta.id && (
                    <div className="answer-radio-selected"></div>
                  )}
                </div>
                <div className="answer-text">{resposta.corpo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="quiz-navigation">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="nav-btn nav-btn-prev"
          >
            ← Anterior
          </button>

          <div className="question-indicators">
            {quiz.Pergunta.map((_, index) => (
              <button
                key={index}
                className={`question-indicator ${
                  index === currentQuestionIndex ? 'active' : ''
                } ${respostasUtilizador[quiz.Pergunta[index].id] ? 'answered' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex < quiz.Pergunta.length - 1 ? (
            <button
              onClick={handleNextQuestion}
              className="nav-btn nav-btn-next"
            >
              Próxima →
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="nav-btn nav-btn-submit"
            >
              {submitting ? (
                <>
                  <HiClock className="spin" /> A Submeter...
                </>
              ) : (
                <>
                  <HiCheckCircle /> Submeter Quiz
                </>
              )}
            </button>
          )}
        </div>

        {/* Submit Button (Always visible at bottom) */}
        {progress.respondidas === progress.total && (
          <div className="final-submit-section">
            <div className="final-submit-info">
              <HiCheckCircle className="check-icon" />
              <div>
                <h3>Todas as perguntas respondidas!</h3>
                <p>Está pronto para submeter o quiz e ver os seus resultados.</p>
              </div>
            </div>
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="final-submit-btn"
            >
              {submitting ? 'A Submeter...' : 'Submeter Quiz'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NovoQuiz;

