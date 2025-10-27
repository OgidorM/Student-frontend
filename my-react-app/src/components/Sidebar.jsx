import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'home', label: 'Início', path: '/dashboard', icon: '🏠' },
        { id: 'forum', label: 'Fórum', path: '/forum', icon: '💬' },
        { id: 'courses', label: 'Cursos', path: '/dashboard', icon: '📚' },
        { id: 'settings', label: 'Definições', path: '/settings', icon: '⚙️' },
    ];

    const bottomItems = [
        { id: 'about', label: 'Sobre', path: '/about', icon: 'ℹ️' },
        { id: 'help', label: 'Ajuda', path: '/help', icon: '❓' },
    ];

    const isActive = (path) => location.pathname === path;

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
                {bottomItems.map((item) => (
                    <button
                        key={item.id}
                        className="sidebar-item"
                        onClick={() => navigate(item.path)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
                <div className="sidebar-footer">©2025 P2P Learning</div>
            </div>
        </div>
    );
};

export default Sidebar;