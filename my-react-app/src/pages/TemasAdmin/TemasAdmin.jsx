import { useState, useEffect, useRef } from 'react';
import { mockApiClient } from '../../api/mockApiClient.js';
import apiClient from '../../api/axiosClient.js';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX, HiArrowLeft } from 'react-icons/hi';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import './TemasAdmin.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const TemasAdmin = () => {
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  const bubblesRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemas();
  }, []);

  useEffect(() => {
    const bubbles = bubblesRef.current;

    // Animate each bubble from right to left
    bubbles.forEach((bubble) => {
      if (bubble) {
        // Random properties for each bubble
        const randomY = Math.random() * window.innerHeight;
        const randomScale = 0.5 + Math.random();
        const randomDelay = Math.random() * 2;
        const randomDuration = 4 + Math.random() * 3;

        // Set initial position at right side
        gsap.set(bubble, {
          x: window.innerWidth + 200,
          y: randomY,
          scale: randomScale,
          opacity: 0.7,
        });

        // Move from right to left
        gsap.to(bubble, {
          x: -300,
          duration: randomDuration,
          delay: randomDelay,
          ease: "none",
          repeat: -1,
          repeatDelay: Math.random() * 2,
        });

        // Floating motion up and down
        gsap.to(bubble, {
          y: `+=${Math.random() * 200 - 100}`,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: randomDelay,
        });

        // Pulse opacity
        gsap.to(bubble, {
          opacity: 0.3 + Math.random() * 0.4,
          duration: 1.5 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });

    // Cleanup
    return () => {
      gsap.killTweensOf(bubbles);
    };
  }, []);

  const fetchTemas = async () => {
    try {
      setLoading(true);
      let response;
      if (useMock) {
        response = await mockApiClient.getTemas();
      } else {
        response = await apiClient.get('/temas');
      }
      setTemas(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar temas:', err);
      setError('Falha ao carregar temas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (useMock) {
        await mockApiClient.createTema(formData);
      } else {
        await apiClient.post('/temas', formData);
      }
      setFormData({ nome: '', descricao: '' });
      setShowCreateForm(false);
      fetchTemas();
    } catch (err) {
      console.error('Erro ao criar tema:', err);
      alert('Erro ao criar tema: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdate = async (id) => {
    const tema = temas.find(t => t.id === id);
    try {
      if (useMock) {
        await mockApiClient.updateTema(id, tema);
      } else {
        await apiClient.put(`/temas/${id}`, tema);
      }
      setEditingId(null);
      fetchTemas();
    } catch (err) {
      console.error('Erro ao atualizar tema:', err);
      alert('Erro ao atualizar tema: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este tema?')) return;

    try {
      if (useMock) {
        await mockApiClient.deleteTema(id);
      } else {
        await apiClient.delete(`/temas/${id}`);
      }
      fetchTemas();
    } catch (err) {
      console.error('Erro ao excluir tema:', err);
      alert('Erro ao excluir tema: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (id) => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    fetchTemas(); // Recarregar para desfazer mudanças
  };

  const updateTemaField = (id, field, value) => {
    setTemas(temas.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  return (
    <div className="temas-admin-layout">
      {/* Animated Bubbles Background */}
      <div className="temas-animated-bubbles-background">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="temas-bubble"
            ref={(el) => (bubblesRef.current[i] = el)}
          />
        ))}
      </div>

      <Sidebar />

      <div className="temas-admin-main">
        <header className="admin-header">
          <h1>Gestão de Temas</h1>
          <button
            className="btn-create"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <HiPlus /> Novo Tema
          </button>
          <button
            className="btn-back"
            onClick={() => navigate(-1)}
          >
            <HiArrowLeft /> Voltar
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Formulário de Criação */}
        {showCreateForm && (
          <div className="create-form-card">
            <h2>Criar Novo Tema</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nome do Tema</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                  maxLength={100}
                  placeholder="Ex: Programação"
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                  placeholder="Breve descrição do tema..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  <HiCheck /> Criar
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateForm(false)}
                >
                  <HiX /> Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Temas */}
        <div className="temas-list">
          {loading && <p>Carregando temas...</p>}

          {!loading && temas.length === 0 && (
            <p className="empty-state">Nenhum tema cadastrado.</p>
          )}

          {!loading && temas.map((tema) => (
            <div key={tema.id} className="tema-card">
              {editingId === tema.id ? (
                // Modo de Edição
                <div className="tema-edit-mode">
                  <div className="form-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      value={tema.nome}
                      onChange={(e) => updateTemaField(tema.id, 'nome', e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  <div className="form-group">
                    <label>Descrição</label>
                    <textarea
                      value={tema.descricao}
                      onChange={(e) => updateTemaField(tema.id, 'descricao', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="tema-actions">
                    <button
                      className="btn-save"
                      onClick={() => handleUpdate(tema.id)}
                    >
                      <HiCheck /> Salvar
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={handleCancelEdit}
                    >
                      <HiX /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo de Visualização
                <div className="tema-view-mode">
                  <div className="tema-info">
                    <h3>{tema.nome}</h3>
                    <p>{tema.descricao}</p>
                    <small className="tema-meta">
                      Criado em: {new Date(tema.criacao).toLocaleDateString('pt-PT')}
                      {' • '}
                      Status: {tema.ativo ? 'Ativo' : 'Inativo'}
                    </small>
                  </div>
                  <div className="tema-actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(tema.id)}
                    >
                      <HiPencil /> Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(tema.id)}
                    >
                      <HiTrash /> Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemasAdmin;
