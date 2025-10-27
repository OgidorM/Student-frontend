import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosClient';
import { mockApiClient } from '../api/mockApiClient';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const topics = [
    { id: 'math', name: 'Matemática', icon: '📐', color: '#667eea', description: 'Aprende conceitos fundamentais de matemática e álgebra.' },
    { id: 'physics', name: 'Física', icon: '⚛️', color: '#764ba2', description: 'Explora as leis da física e mecânica.' },
    { id: 'chemistry', name: 'Química', icon: '🧪', color: '#f093fb', description: 'Descobre reações químicas e compostos.' },
    { id: 'biology', name: 'Biologia', icon: '🧬', color: '#4facfe', description: 'Estuda organismos vivos e ecossistemas.' },
    { id: 'history', name: 'História', icon: '📚', color: '#43e97b', description: 'Viaja através dos eventos históricos.' },
    { id: 'geography', name: 'Geografia', icon: '🌍', color: '#fa709a', description: 'Explora o mundo e suas características.' },
  ];

  useEffect(() => {
    fetchStats();
    setFilteredTopics(topics);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery]);

  const fetchStats = async () => {
    try {
      let response;
      if (useMock) {
        response = await mockApiClient.getStats();
      } else {
        response = await apiClient.get('/stats');
      }
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Falha ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startQuiz = (topic) => {
    navigate(`/quiz/${topic}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // A pesquisa já é feita automaticamente pelo useEffect
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia!';
    if (hour < 18) return 'Boa tarde!';
    return 'Boa noite!';
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-top-bar">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Pesquisar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

          <div className="user-section">
            <div className="user-info">
              <div className="user-greeting">{getCurrentGreeting()}</div>
              <div className="user-name">Estudante P2P</div>
            </div>
            <img
              src="https://placehold.co/60x60/59AAF6/white?text=U"
              alt="User"
              className="user-avatar"
            />
          </div>
        </header>

        {/* Hero Banner */}
        <div className="hero-banner">
          <div className="hero-content">
            <div className="hero-breadcrumb">
              <span className="breadcrumb-item muted">Formações</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item">Novos Rumos</span>
            </div>
            <h1 className="hero-title">Abre os Teus Horizontes</h1>
            <p className="hero-description">
              Vê os cursos criados pelos nossos funcionários mais experientes e aprende
              linguagens de programação com outros funcionários
            </p>
          </div>
          <div className="hero-image">
            <img src="https://placehold.co/741x236/59AAF6/white?text=Learning" alt="Hero" />
          </div>
        </div>

        {/* Mock Indicator */}
        {useMock && (
          <div className="mock-indicator-bar">
            🧪 <strong>Modo de Teste Ativo</strong> - Usando dados simulados
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <div className="search-results-info">
            {filteredTopics.length > 0 ? (
              <p>Encontrados <strong>{filteredTopics.length}</strong> resultado{filteredTopics.length !== 1 ? 's' : ''} para "{searchQuery}"</p>
            ) : (
              <p>Nenhum resultado encontrado para "<strong>{searchQuery}</strong>"</p>
            )}
          </div>
        )}

        {/* Topics Section */}
        <section className="content-section">
          <h2 className="section-title">
            {searchQuery ? 'Resultados da Pesquisa' : 'Escolha um Tópico'}
          </h2>
          {filteredTopics.length > 0 ? (
            <div className="topics-grid">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="topic-card-modern"
                  onClick={() => startQuiz(topic.id)}
                >
                  <div className="topic-icon-wrapper" style={{ background: topic.color }}>
                    <span className="topic-icon-large">{topic.icon}</span>
                  </div>
                  <h3 className="topic-title">{topic.name}</h3>
                  <p className="topic-description">{topic.description}</p>
                  <div className="topic-footer">
                    <span className="topic-author">
                      <span className="author-label">By</span>
                      <span className="author-name">Sistema P2P</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>Nenhum curso encontrado</h3>
              <p>Tente pesquisar com outras palavras-chave</p>
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                Limpar pesquisa
              </button>
            </div>
          )}
        </section>

        {/* Stats Cards */}
        {stats && !searchQuery && (
          <section className="content-section">
            <h2 className="section-title">Suas Estatísticas</h2>
            <div className="stats-grid-modern">
              <div className="stat-card-modern">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.quizzesCompleted || 0}</div>
                  <div className="stat-label">Quizzes Completados</div>
                </div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.accuracy || 0}%</div>
                  <div className="stat-label">Taxa de Acerto</div>
                </div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">📥</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.materialsAccessed || 0}</div>
                  <div className="stat-label">Materiais Acessados</div>
                </div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalPoints || 0}</div>
                  <div className="stat-label">Pontos Totais</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
