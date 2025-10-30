import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { temasApi, quizzesApi } from '../../api/axiosClient.js';
import { mockApiClient } from '../../api/mockApiClient.js';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import AwaitingAI from '../../components/AwaitingAI.jsx';
import { HiSparkles, HiStar, HiChevronRight, HiArrowLeft, HiLightningBolt } from 'react-icons/hi';
import './TemaDetail.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const TemaDetail = () => {
  const { temaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tema, setTema] = useState(null);
  const [quizzesDesteTema, setQuizzesDesteTema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [showAwaitingAI, setShowAwaitingAI] = useState(false);
  const [quizGenerationStartTime, setQuizGenerationStartTime] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Iniciando busca de dados...');
      console.log('📋 TemaId:', temaId);
      console.log('🔧 Usando Mock:', useMock);

      // Busca do tema
      console.log('📡 Buscando tema...');
      const temaResponse = useMock
        ? await mockApiClient.getTema(temaId)
        : await temasApi.getTema(temaId);

      console.log('✅ Tema recebido:', temaResponse.data);
      setTema(temaResponse.data);

      // Busca TODOS os quizzes da base de dados
      console.log('📡 Buscando quizzes...');
      const quizzesResponse = useMock
        ? await mockApiClient.getTemas() // mock retorna temas, ajustar depois
        : await quizzesApi.getAll();

      console.log('✅ Quizzes recebidos:', quizzesResponse.data);
      console.log('📊 Total de quizzes:', quizzesResponse.data?.length || 0);

      // FILTRAR quizzes pelo tema_id
      if (!Array.isArray(quizzesResponse.data)) {
        console.error('❌ Quizzes não é um array:', quizzesResponse.data);
        setQuizzesDesteTema([]);
        return;
      }

      const quizzesDoTema = quizzesResponse.data.filter(quiz => {
        const match = quiz.tema_id === parseInt(temaId);

        console.log('🔎 Quiz', quiz.id, ':', {
          nome: quiz.nome,
          tema_id: quiz.tema_id,
          temaIdEsperado: parseInt(temaId),
          match
        });

        return match && quiz.ativo !== false;
      });

      console.log('✅ Quizzes filtrados:', quizzesDoTema.length, 'de', quizzesResponse.data.length);
      console.log('📋 Quizzes do tema:', quizzesDoTema);

      setQuizzesDesteTema(quizzesDoTema);
    } catch (err) {
      console.error('❌ ERRO ao buscar dados:', err);
      console.error('❌ Erro completo:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });

      const errorMessage = err.response?.data?.error
        || err.response?.data?.message
        || err.message
        || 'Falha ao carregar dados do tema';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setError('Utilizador não autenticado');
      setLoading(false);
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temaId, user?.id]);

  const handleGerarNovoQuiz = async () => {
    setGeneratingQuiz(true);
    setShowAwaitingAI(true);
    setQuizGenerationStartTime(Date.now());
    setError('');

    try {
      const response = useMock
        ? await mockApiClient.gerarQuiz(user.id, temaId)
        : await quizzesApi.gerar({
            utilizador_id: user.id,
            tema_id: parseInt(temaId)
          });

      // Backend retorna 201 com { quizz_id }
      const novoQuizzId = response.data.quizz_id;

      // Calcular quanto tempo passou desde o início
      const elapsedTime = Date.now() - quizGenerationStartTime;
      const minimumDisplayTime = 60000; // 1 minuto em milissegundos
      const remainingTime = Math.max(0, minimumDisplayTime - elapsedTime);

      // Aguardar o tempo restante para completar 1 minuto
      setTimeout(() => {
        setShowAwaitingAI(false);
        setGeneratingQuiz(false);
        // Navegar para o ecrã do quiz
        navigate(`/quiz/iniciar/${novoQuizzId}`);
      }, remainingTime);

    } catch (err) {
      console.error('Erro ao gerar quiz:', err);
      setError(err.response?.data?.message || 'Falha ao gerar novo quiz');
      setGeneratingQuiz(false);
      setShowAwaitingAI(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="tema-detail-main">
          <div className="loading-state">
            <HiLightningBolt className="loading-icon" />
            <p>A carregar informações do tema...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !tema) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="tema-detail-main">
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              <HiArrowLeft /> Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se estiver a gerar quiz, mostrar AwaitingAI
  if (showAwaitingAI) {
    return <AwaitingAI />;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="tema-detail-main">
        {/* Header */}
        <div className="tema-detail-header">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <HiArrowLeft /> Voltar
          </button>

          <div className="tema-info">
            <h1 className="tema-title">{tema?.nome || 'Tema'}</h1>
            <p className="tema-description">{tema?.descricao || ''}</p>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Seção: Gerar Novo Quiz */}
        <div className="new-quiz-section">
          <div className="new-quiz-card">
            <div className="new-quiz-icon">
              <HiSparkles />
            </div>
            <div className="new-quiz-content">
              <h2>Iniciar um Novo Desafio</h2>
              <p>Gere um novo quiz com IA personalizado para este tema e teste os seus conhecimentos</p>
            </div>
            <button
              onClick={handleGerarNovoQuiz}
              disabled={generatingQuiz}
              className="generate-quiz-btn"
            >
              {generatingQuiz ? (
                <>
                  <HiLightningBolt className="spin" /> A Gerar...
                </>
              ) : (
                <>
                  <HiSparkles /> Gerar Novo Quiz com IA
                </>
              )}
            </button>
          </div>
        </div>

        {/* Seção: Quizzes Salvos */}
        <div className="saved-quizzes-section">
          <h2 className="section-title">Quizzes Disponíveis de {tema?.nome}</h2>

          {quizzesDesteTema.length === 0 ? (
            <div className="empty-state">
              <HiStar className="empty-icon" />
              <p>Ainda não há quizzes disponíveis para este tema.</p>
              <p className="empty-hint">Aguarde novos quizzes ou contacte o administrador!</p>
            </div>
          ) : (
            <div className="quizzes-grid">
              {quizzesDesteTema.map((quiz) => (
                <div
                  key={quiz.id}
                  className="quiz-card"
                  onClick={() => navigate(`/quiz/iniciar/${quiz.id}`)}
                >
                  <div className="quiz-card-header">
                    <h3 className="quiz-name">{quiz.nome || 'Quiz sem nome'}</h3>
                    <HiChevronRight className="card-arrow" />
                  </div>

                  <div className="quiz-card-info">
                    <div className="quiz-info-item">
                      <HiStar className="info-icon" />
                      <span className="info-label">Quiz ID:</span>
                      <span className="info-value">#{quiz.id}</span>
                    </div>

                    <div className="quiz-info-item">
                      <HiLightningBolt className="info-icon" />
                      <span className="info-label">Status:</span>
                      <span className="info-value">{quiz.ativo ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>

                  <div className="quiz-card-footer">
                    <span className="review-text">Clique para iniciar</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemaDetail;
