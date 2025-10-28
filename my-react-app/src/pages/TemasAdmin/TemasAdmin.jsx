import { useState, useEffect } from 'react';
import { mockApiClient } from '../../api/mockApiClient.js';
import apiClient from '../../api/axiosClient.js';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';
import { HiPlus, HiPencil, HiTrash, HiCheck, HiX } from 'react-icons/hi';
import './TemasAdmin.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const TemasAdmin = () => {
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', descricao: '' });

  useEffect(() => {
    fetchTemas();
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
    <div className="dashboard-layout">
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

