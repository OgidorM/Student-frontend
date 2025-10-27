import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { mockApiClient } from '../api/mockApiClient';
import IPFSDownload from '../components/IPFSDownload';
import Sidebar from '../components/Sidebar';
import './Quiz.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const Quiz = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState('loading');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    startQuiz();
  }, [topic]);

  const startQuiz = async () => {
    setQuizState('loading');
    setError('');

    try {
      let response;

      if (useMock) {
        response = await mockApiClient.startQuiz(topic);
      } else {
        response = await apiClient.get(`/quiz/start?topic=${topic}`);
      }

      setCurrentQuestion(response.data);
      setQuizState('question');
      setQuestionCount(1);
    } catch (err) {
      console.error('Erro ao iniciar quiz:', err);
      setError(err.response?.data?.message || 'Falha ao carregar o quiz');
      setQuizState('error');
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) {
      alert('Por favor, selecione uma resposta');
      return;
    }

    setQuizState('loading');

    try {
      let response;

      if (useMock) {
        response = await mockApiClient.submitQuiz(
          currentQuestion.id,
          selectedAnswer,
          topic
        );
      } else {
        response = await apiClient.post('/quiz/submit', {
          questionId: currentQuestion.id,
          answer: selectedAnswer,
          topic: topic,
        });
      }

      const result = response.data;
      setFeedback(result);

      if (result.correct) {
        setScore(score + 1);
      }

      setQuizState('feedback');
    } catch (err) {
      console.error('Erro ao submeter resposta:', err);
      setError('Falha ao submeter resposta');
      setQuizState('question');
    }
  };

  const nextQuestion = async () => {
    setSelectedAnswer('');
    setFeedback(null);

    if (feedback?.quizCompleted) {
      setQuizState('completed');
      return;
    }

    setQuizState('loading');

    try {
      let response;

      if (useMock) {
        response = await mockApiClient.startQuiz(topic);
      } else {
        response = await apiClient.get(`/quiz/start?topic=${topic}`);
      }

      setCurrentQuestion(response.data);
      setQuizState('question');
      setQuestionCount(questionCount + 1);
    } catch (err) {
      console.error('Erro ao carregar próxima pergunta:', err);
      setError('Falha ao carregar próxima pergunta');
      setQuizState('error');
    }
  };

  const backToDashboard = () => {
    navigate('/dashboard');
  };

  if (quizState === 'loading') {
    return (
      <div className="quiz-layout">
        <Sidebar />
        <div className="quiz-main">
          <div className="quiz-loading-modern">
            <div className="spinner-large"></div>
            <h2>Carregando...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'error') {
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

  if (quizState === 'completed') {
    return (
      <div className="quiz-layout">
        <Sidebar />
        <div className="quiz-main">
          <div className="quiz-completed-modern">
            <div className="completion-icon">🎉</div>
            <h1>Quiz Completo!</h1>
            <div className="final-score-modern">
              <div className="score-circle">
                <div className="score-number">{score}</div>
                <div className="score-total">/ {questionCount}</div>
              </div>
              <div className="score-percentage">
                {Math.round((score / questionCount) * 100)}% de acerto
              </div>
            </div>
            <button onClick={backToDashboard} className="back-button-modern">
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-layout">
      <Sidebar />

      <div className="quiz-main">
        {/* Header */}
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
          {/* Main Content */}
          <div className="quiz-question-area">
            <div className="quiz-card-modern">
              {quizState === 'question' && currentQuestion && (
                <>
                  <h2 className="question-heading">{currentQuestion.question}</h2>

                  <div className="answers-grid-modern">
                    {currentQuestion.options?.map((option, index) => {
                      const letter = String.fromCharCode(65 + index);
                      return (
                        <button
                          key={index}
                          className={`answer-btn-modern ${selectedAnswer === option ? 'selected' : ''}`}
                          onClick={() => setSelectedAnswer(option)}
                        >
                          <div className="answer-letter">{letter}</div>
                          <div className="answer-text">{option}</div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={submitAnswer}
                    className="submit-btn-modern"
                    disabled={!selectedAnswer}
                  >
                    Seguinte
                  </button>
                </>
              )}

              {quizState === 'feedback' && feedback && (
                <div className="feedback-container-modern">
                  <div className={`feedback-header ${feedback.correct ? 'correct' : 'incorrect'}`}>
                    <span className="feedback-emoji">
                      {feedback.correct ? '✅' : '❌'}
                    </span>
                    <h2>{feedback.correct ? 'Correto!' : 'Incorreto'}</h2>
                  </div>

                  {!feedback.correct && feedback.explanation && (
                    <div className="explanation-card">
                      <h3>💡 Explicação</h3>
                      <p>{feedback.explanation}</p>
                    </div>
                  )}

                  {!feedback.correct && feedback.suggestedCid && (
                    <div className="material-card">
                      <h3>📚 Material Recomendado</h3>
                      <p>Para aprender mais sobre este tópico:</p>
                      <IPFSDownload
                        cid={feedback.suggestedCid}
                        label="Download Material de Estudo"
                      />
                    </div>
                  )}

                  <button onClick={nextQuestion} className="next-btn-modern">
                    {feedback.quizCompleted ? 'Ver Resultado Final' : 'Próxima Pergunta →'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Progress */}
          <aside className="quiz-sidebar-modern">
            <div className="progress-card">
              <h3>Quiz {topic}</h3>
              <div className="timer">⏱️ 16:35</div>
              <div className="questions-list">
                <div className="question-item active">
                  <div className="q-number">1</div>
                  <div className="q-text">{currentQuestion?.question?.substring(0, 50)}...</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
