import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../api/axiosClient.js';
import { mockApiClient } from '../../api/mockApiClient.js';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import { HiAcademicCap, HiBeaker, HiLightningBolt, HiBookOpen, HiGlobe, HiSearch, HiCheckCircle, HiChartBar, HiDownload, HiStar, HiLogout, HiCog } from 'react-icons/hi';
import './Dashboard.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Mapeamento de ícones por nome de tema
const iconMap = {
  'Matemática': HiAcademicCap,
  'Física': HiLightningBolt,
  'Química': HiBeaker,
  'Biologia': HiBeaker,
  'História': HiBookOpen,
  'Geografia': HiGlobe,
};

// Mapeamento de cores por nome de tema
const colorMap = {
  'Matemática': '#667eea',
  'Física': '#764ba2',
  'Química': '#f093fb',
  'Biologia': '#4facfe',
  'História': '#43e97b',
  'Geografia': '#fa709a',
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Verificar se o usuário é professor (pode ser baseado em user.tipo ou role)
  const isProfessor = user?.tipo === 'Professor' || user?.role === 'professor';

  useEffect(() => {
    fetchStats();
    fetchTemas();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(temas);
    } else {
      const filtered = temas.filter(tema =>
        tema.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tema.descricao.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery, temas]);

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

  const fetchTemas = async () => {
    try {
      let response;
      if (useMock) {
        response = await mockApiClient.getTemas();
      } else {
        response = await apiClient.get('/temas');
      }

      // Mapear temas com ícones e cores
      const temasComIcones = response.data.map(tema => ({
        ...tema,
        icon: iconMap[tema.nome] || HiBookOpen,
        color: colorMap[tema.nome] || '#667eea',
      }));

      setTemas(temasComIcones);
      setFilteredTopics(temasComIcones);
    } catch (err) {
      console.error('Erro ao buscar temas:', err);
      setError('Falha ao carregar temas');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const startQuiz = (temaId) => {
    navigate(`/quiz/${temaId}`);
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
            <button type="submit" className="search-btn"><HiSearch/></button>
          </form>

          <div className="user-section">
            <div className="user-info">
              <div className="user-greeting">{getCurrentGreeting()}</div>
              <div className="user-name">{user?.nome || 'Estudante P2P'}</div>
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
            <img src="Learning-Methods.png" alt="Hero" />
          </div>
        </div>

        {/* Mock Indicator */}
        {useMock && (
          <div className="mock-indicator-bar">
            <HiBeaker /> <strong>Modo de Teste Ativo</strong> - Usando dados simulados
          </div>
        )}

        {/* Admin Access - Apenas para Professores */}
        {isProfessor && (
          <div className="admin-access-section">
            <div className="admin-access-info">
              <h3>Gestão de Temas</h3>
              <p>Crie, edite e gerencie os temas de aprendizagem disponíveis para os alunos</p>
            </div>
            <button className="admin-btn" onClick={() => navigate('/admin/temas')}>
              <HiCog /> Gerir Temas
            </button>
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

        {/* Topics Grid */}
        <div className="content-section">
          <h2 className="section-title">Tópicos de Aprendizagem</h2>

          {loading && <p>Carregando temas...</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="topics-grid">
            {filteredTopics.map((tema) => {
              const IconComponent = tema.icon;
              return (
                <div
                  key={tema.id}
                  className="topic-card"
                  onClick={() => startQuiz(tema.id)}
                  style={{ '--topic-color': tema.color }}
                >
                  <div className="topic-icon">
                    <IconComponent />
                  </div>
                  <h3 className="topic-name">{tema.nome}</h3>
                  <p className="topic-description">{tema.descricao}</p>
                  <button className="topic-btn">Começar Quiz</button>
                </div>
              );
            })}
          </div>

          {filteredTopics.length === 0 && !loading && (
            <div className="empty-state">
              <p>Nenhum tema disponível no momento.</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="stats-section">
            <h2 className="section-title">As Tuas Estatísticas</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <HiCheckCircle />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Quizzes Completos</p>
                  <p className="stat-value">{stats.quizzesCompleted}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <HiChartBar />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Precisão Média</p>
                  <p className="stat-value">{stats.accuracy}%</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <HiDownload />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Materiais Acedidos</p>
                  <p className="stat-value">{stats.materialsAccessed}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <HiStar />
                </div>
                <div className="stat-info">
                  <p className="stat-label">Pontos Totais</p>
                  <p className="stat-value">{stats.totalPoints}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
