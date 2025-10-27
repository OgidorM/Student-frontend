import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Início', path: '/dashboard', icon: '🏠' },
    { id: 'courses', label: 'Cursos', path: '/dashboard', icon: '📚' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith('/quiz');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="https://placehold.co/150x23/59AAF6/white?text=P2P+Learning" alt="Logo" />
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-item logout-item" onClick={handleLogout}>
          <span className="sidebar-icon">🚪</span>
          <span className="sidebar-label">Sair</span>
        </button>
        <div className="sidebar-footer">©2025 P2P Learning</div>
      </div>
    </div>
  );
};

export default Sidebar;