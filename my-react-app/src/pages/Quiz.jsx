import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { mockApiClient } from '../api/mockApiClient';
import IPFSDownload from '../components/IPFSDownload';
import AwaitingAI from '../components/AwaitingAI';
import Sidebar from '../components/Sidebar';
import './Quiz.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const Quiz = () => {
  const { topic } = useParams();
  const navigate = useNavigate();

  // Estados do quiz
  const [status, setStatus] = useState('loading'); // 'loading', 'answering', 'submitting', 'results'
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    startQuiz();
  }, [topic]);

  const startQuiz = async () => {
    setStatus('loading');
    setError('');

    try {
      let response;

      if (useMock) {
        response = await mockApiClient.startQuiz(topic);
      } else {
        response = await apiClient.get(`/quiz/start?topic=${topic}`);
      }

      setQuestions(response.data.questions);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setStatus('answering');
    } catch (err) {
      console.error('Erro ao iniciar quiz:', err);
      setError(err.response?.data?.message || 'Falha ao carregar o quiz');
      setStatus('error');
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAllAnswers = async () => {
    // Verificar se todas as perguntas foram respondidas
    const unansweredCount = questions.filter(q => !userAnswers[q.id]).length;

    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `Tem ${unansweredCount} pergunta${unansweredCount > 1 ? 's' : ''} por responder. Deseja submeter mesmo assim?`
      );
      if (!confirmSubmit) return;
    }

    setStatus('submitting');

    try {
      let response;

      if (useMock) {
        response = await mockApiClient.submitQuiz(topic, userAnswers);
      } else {
        response = await apiClient.post('/quiz/submit', {
          topic,
          answers: userAnswers,
        });
      }

      setQuizResults(response.data);
      setStatus('results');
    } catch (err) {
      console.error('Erro ao submeter respostas:', err);
      setError('Falha ao submeter respostas');
      setStatus('answering');
    }
  };

  const backToDashboard = () => {
    navigate('/dashboard');
  };

  const restartQuiz = () => {
    startQuiz();
  };

  // Renderizar loading
  if (status === 'loading') {
    return (
      <div className="quiz-layout">
        <Sidebar />
        <div className="quiz-main">
          <div className="quiz-loading-modern">
            <div className="spinner-large"></div>
            <h2>Carregando o quiz...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar erro
  if (status === 'error') {
    return (
      <div className="quiz-layout">
        <Sidebar />
        <div className="quiz-main">
          <div className="quiz-error-modern">
            <div className="error-icon-large">⚠️</div>
            <h2>Erro</h2>
            <p>{error}</p>
            <button onClick={backToDashboard} className="back-button-modern">
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar componente de espera (AwaitingAI)
  if (status === 'submitting') {
    return <AwaitingAI />;
  }

  // Renderizar resultados
  if (status === 'results' && quizResults) {
    return (
      <div className="quiz-layout">
        <Sidebar />
        <div className="quiz-main">
          <div className="results-container">
            <header className="results-header">
              <button onClick={backToDashboard} className="back-icon-btn">
                📚
              </button>
              <h1>Resultados do Quiz: {topic}</h1>
            </header>

            <div className="results-summary">
              <div className="score-card-large">
                <div className="score-circle-large">
                  <div className="score-number-large">{quizResults.score}</div>
                  <div className="score-total-large">/ {quizResults.total}</div>
                </div>
                <div className="score-details">
                  <div className="score-percentage-large">{quizResults.percentage}%</div>
                  <div className="score-label">de acerto</div>
                </div>
              </div>
            </div>

            <div className="results-list">
              <h2>Revisão das Respostas</h2>
              {quizResults.results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`result-item ${result.correct ? 'correct' : 'incorrect'}`}
                >
                  <div className="result-header">
                    <span className="question-number">Questão {index + 1}</span>
                    <span className={`result-badge ${result.correct ? 'correct' : 'incorrect'}`}>
                      {result.correct ? '✅ Correto' : '❌ Incorreto'}
                    </span>
                  </div>

                  <div className="result-question">
                    <h3>{result.question}</h3>
                  </div>

                  <div className="result-answers">
                    <div className="answer-row">
                      <strong>Sua resposta:</strong>
                      <span className={result.correct ? 'correct-text' : 'incorrect-text'}>
                        {result.userAnswer || '(Não respondida)'}
                      </span>
                    </div>
                    {!result.correct && (
                      <div className="answer-row">
                        <strong>Resposta correta:</strong>
                        <span className="correct-text">{result.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  {!result.correct && result.explanation && (
                    <div className="explanation-section">
                      <h4>💡 Explicação</h4>
                      <p>{result.explanation}</p>
                    </div>
                  )}

                  {!result.correct && result.suggestedCid && (
                    <div className="material-section">
                      <h4>📚 Material Recomendado</h4>
                      <p>Para aprender mais sobre este tópico:</p>
                      <IPFSDownload
                        cid={result.suggestedCid}
                        label="Download Material de Estudo"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button onClick={restartQuiz} className="restart-btn">
                🔄 Tentar Novamente
              </button>
              <button onClick={backToDashboard} className="dashboard-btn">
                🏠 Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar quiz (modo de resposta)
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="quiz-layout">
      <Sidebar />

      <div className="quiz-main">
        <header className="quiz-header-modern">
          <button onClick={backToDashboard} className="back-icon-btn">
            📚
          </button>
          <div className="quiz-breadcrumb">
            <span>Curso</span>
            <span className="separator">/</span>
            <span>{topic}</span>
            <span className="separator">/</span>
            <span className="current">Quiz</span>
          </div>
        </header>

        <div className="quiz-content-wrapper">
          <div className="quiz-question-area">
            <div className="quiz-card-modern">
              {/* Progress Bar */}
              <div className="quiz-progress-bar">
                <div className="progress-info">
                  <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
                  <span className="answered-count">
                    {answeredCount}/{questions.length} respondidas
                  </span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h2 className="question-heading">{currentQuestion.question}</h2>

              <div className="answers-grid-modern">
                {currentQuestion.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const isSelected = userAnswers[currentQuestion.id] === option;

                  return (
                    <button
                      key={index}
                      className={`answer-btn-modern ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                    >
                      <div className="answer-letter">{letter}</div>
                      <div className="answer-text">{option}</div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="quiz-navigation">
                <button
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="nav-btn prev-btn"
                >
                  ← Anterior
                </button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="nav-btn next-btn"
                  >
                    Próxima →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitAllAnswers}
                    className={`submit-all-btn ${allAnswered ? 'ready' : ''}`}
                  >
                    {allAnswered ? '✓ Submeter Todas as Respostas' : '⚠ Submeter Respostas'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar com lista de questões */}
          <aside className="quiz-sidebar-modern">
            <div className="progress-card">
              <h3>Quiz {topic}</h3>
              <div className="questions-overview">
                <p className="overview-text">
                  {answeredCount} de {questions.length} questões respondidas
                </p>
                <div className="questions-grid-nav">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      className={`question-nav-btn ${
                        idx === currentQuestionIndex ? 'active' : ''
                      } ${userAnswers[q.id] ? 'answered' : ''}`}
                      onClick={() => goToQuestion(idx)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmitAllAnswers}
                className="sidebar-submit-btn"
                disabled={answeredCount === 0}
              >
                Submeter Quiz ({answeredCount}/{questions.length})
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
