import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosClient';
import { mockApiClient } from '../api/mockApiClient';
import './Login.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;

      if (useMock) {
        response = await mockApiClient.login(username, password);
      } else {
        response = await apiClient.post('/auth/login', {
          username,
          password,
        });
      }

      const { token } = response.data;

      if (token) {
        login(token);
        navigate('/dashboard');
      } else {
        setError('Token não recebido do servidor');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container-modern">
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-icon">🎓</div>
            <h1 className="brand-name">P2P Learning</h1>
          </div>

          <div className="login-hero">
            <h2 className="hero-heading">Bem-vindo de volta!</h2>
            <p className="hero-text">
              Acesse sua conta e continue aprendendo com a comunidade P2P
            </p>
          </div>

          <div className="login-illustration">
            <img
              src="https://placehold.co/400x300/59AAF6/white?text=Learning+Together"
              alt="Learning"
            />
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            {useMock && (
              <div className="mock-notice-modern">
                <span className="mock-icon">🧪</span>
                <div>
                  <strong>Modo de Teste</strong>
                  <p>Use: <code>aluno1</code> / <code>senha123</code></p>
                </div>
              </div>
            )}

            <h2 className="form-title">Iniciar Sessão</h2>
            <p className="form-subtitle">Entre com suas credenciais</p>

            <form onSubmit={handleSubmit} className="login-form-modern">
              <div className="form-group-modern">
                <label htmlFor="username">Nome de Utilizador</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Digite seu username"
                  className="input-modern"
                />
              </div>

              <div className="form-group-modern">
                <label htmlFor="password">Palavra-passe</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Digite sua password"
                  className="input-modern"
                />
              </div>

              {error && (
                <div className="error-message-modern">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="login-button-modern"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>Novo na plataforma? <a href="#">Criar conta</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
