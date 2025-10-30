import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissoesApi } from '../../api/axiosClient.js';
import { mockApiClient } from '../../api/mockApiClient.js';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import { HiArrowLeft, HiCheckCircle, HiXCircle, HiLightningBolt, HiInformationCircle } from 'react-icons/hi';
import './SubmissaoDetail.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const SubmissaoDetail = () => {
  const { submissaoId } = useParams();
  const navigate = useNavigate();

  const [submissao, setSubmissao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubmissaoDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissaoId]);

  const fetchSubmissaoDetail = async () => {
    setLoading(true);
    setError('');

    try {
      const response = useMock
        ? await mockApiClient.getSubmissaoDetail(submissaoId)
        : await submissoesApi.getById(submissaoId);

      console.log('📦 Submissão detalhada recebida:', response.data);

      // ✅ CORREÇÃO: Verificar RespostaDadas (PLURAL) não RespostaDada (SINGULAR)
      const respostaDadas = response.data?.RespostaDadas || response.data?.respostaDadas || response.data?.RespostaDada || [];

      console.log('🔍 Estrutura da submissão:', {
        id: response.data?.id,
        pontuacao: response.data?.pontuacao,
        temQuizz: !!response.data?.Quizz,
        temRespostaDadas: respostaDadas.length > 0,
        numRespostas: respostaDadas.length
      });

      // Log detalhado das respostas
      if (respostaDadas.length > 0) {
        console.log('📋 Respostas encontradas:', respostaDadas.length);
        respostaDadas.forEach((r, i) => {
          console.log(`Resposta ${i + 1}:`, {
            id: r.id,
            correta_na_submissao: r.correta_na_submissao,
            temPergunta: !!r.Pergunta,
            temResposta: !!r.Resposta,
            pergunta: r.Pergunta?.corpo?.substring(0, 50) + '...',
            resposta: r.Resposta?.corpo
          });
        });
      } else {
        console.warn('⚠️ Nenhuma RespostaDada encontrada na submissão!');
      }

      // ✅ CORREÇÃO: Normalizar o nome para RespostaDada (singular) para o resto do código
      if (respostaDadas.length > 0 && !response.data.RespostaDada) {
        response.data.RespostaDada = respostaDadas;
      }

      setSubmissao(response.data);
    } catch (err) {
      console.error('❌ Erro ao buscar submissão:', err);
      console.error('❌ Detalhes:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.error || 'Falha ao carregar detalhes da submissão');
    } finally {
      setLoading(false);
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

  const calculateStats = () => {
    if (!submissao?.RespostaDada) return { total: 0, corretas: 0, erradas: 0 };

    const total = submissao.RespostaDada.length;
    const corretas = submissao.RespostaDada.filter(r => r.correta_na_submissao).length;
    const erradas = total - corretas;

    return { total, corretas, erradas };
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="submissao-detail-main">
          <div className="loading-state">
            <HiLightningBolt className="loading-icon" />
            <p>A carregar detalhes da submissão...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submissao) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="submissao-detail-main">
          <div className="error-state">
            <p className="error-message">{error || 'Submissão não encontrada'}</p>
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              <HiArrowLeft /> Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  // Formatar pontuação de forma segura
  const formatPontuacao = (pontuacao) => {
    if (pontuacao === null || pontuacao === undefined) return '0.00';
    const num = Number(pontuacao);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="submissao-detail-main">
        {/* Header */}
        <div className="submissao-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <HiArrowLeft /> Voltar
          </button>

          <div className="submissao-info">
            <h1 className="submissao-title">{submissao.Quizz?.nome || 'Quiz'}</h1>
            <p className="submissao-date">{formatDate(submissao.datahora)}</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="stats-card">
          <div className="stat-item">
            <div className="stat-label">Pontuação Final</div>
            <div className="stat-value score">{formatPontuacao(submissao.pontuacao)}%</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Respostas Corretas</div>
            <div className="stat-value correct">{stats.corretas}/{stats.total}</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-label">Respostas Erradas</div>
            <div className="stat-value incorrect">{stats.erradas}/{stats.total}</div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="questions-review">
          <h2 className="section-title">Revisão das Respostas</h2>

          <div className="questions-list">
            {submissao.RespostaDada?.map((respostaDada, index) => (
              <div
                key={respostaDada.id}
                className={`question-review-card ${respostaDada.correta_na_submissao ? 'correct' : 'incorrect'}`}
              >
                <div className="question-header">
                  <div className="question-number">Pergunta {index + 1}</div>
                  <div className={`question-status ${respostaDada.correta_na_submissao ? 'correct' : 'incorrect'}`}>
                    {respostaDada.correta_na_submissao ? (
                      <>
                        <HiCheckCircle /> Correta
                      </>
                    ) : (
                      <>
                        <HiXCircle /> Incorreta
                      </>
                    )}
                  </div>
                </div>

                {respostaDada.Pergunta?.assunto && (
                  <div className="question-subject">
                    <strong>Assunto:</strong> {respostaDada.Pergunta.assunto}
                  </div>
                )}

                <div className="question-body">
                  {respostaDada.Pergunta?.corpo}
                </div>

                <div className="answer-section">
                  <div className={`user-answer ${respostaDada.correta_na_submissao ? 'correct' : 'incorrect'}`}>
                    <strong>A sua resposta:</strong> {respostaDada.Resposta?.corpo || 'Não disponível'}
                  </div>

                  {!respostaDada.correta_na_submissao && (
                    <>
                      {/* 🔍 DEBUG: Log para verificar estrutura */}
                      {console.log('🔍 DEBUG Resposta', index + 1, ':', {
                        temPergunta: !!respostaDada.Pergunta,
                        temRespostaArray: !!respostaDada.Pergunta?.Resposta,
                        numRespostas: respostaDada.Pergunta?.Resposta?.length || 0,
                        respostas: respostaDada.Pergunta?.Resposta,
                        respostaEscolhida: respostaDada.Resposta?.corpo
                      })}

                      {/* Mostrar a resposta correta se existir nas respostas da pergunta */}
                      {respostaDada.Pergunta?.Resposta && Array.isArray(respostaDada.Pergunta.Resposta) && respostaDada.Pergunta.Resposta.length > 0 ? (
                        (() => {
                          const respostaCorreta = respostaDada.Pergunta.Resposta.find(r => r.correta === true);
                          console.log('✅ Resposta correta encontrada:', respostaCorreta);

                          if (respostaCorreta) {
                            return (
                              <div className="correct-answer">
                                <strong>Resposta correta:</strong>
                                <span className="correct-text">
                                  {respostaCorreta.corpo}
                                </span>
                              </div>
                            );
                          } else {
                            console.warn('⚠️ Nenhuma resposta marcada como correta');
                            return (
                              <div className="correct-answer">
                                <strong>⚠️ Resposta correta não disponível</strong>
                              </div>
                            );
                          }
                        })()
                      ) : (
                        <div className="correct-answer">
                          <strong>⚠️ Respostas não carregadas do servidor</strong>
                          <div style={{ fontSize: '0.85em', color: '#666', marginTop: '5px' }}>
                            {respostaDada.Pergunta?.Resposta
                              ? `Tipo: ${typeof respostaDada.Pergunta.Resposta}, É array: ${Array.isArray(respostaDada.Pergunta.Resposta)}`
                              : 'Pergunta.Resposta é null/undefined'}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {respostaDada.Pergunta?.explicacao && !respostaDada.correta_na_submissao && (
                  <div className="explanation-box">
                    <div className="explanation-header">
                      <HiInformationCircle /> Explicação
                    </div>
                    <div className="explanation-text">
                      {respostaDada.Pergunta.explicacao}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Voltar ao Dashboard
          </button>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Ver Outros Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissaoDetail;
