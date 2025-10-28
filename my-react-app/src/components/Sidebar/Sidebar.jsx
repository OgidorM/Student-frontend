import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {HiHome, HiMenu, HiOutlineLogin, HiPuzzle, HiX} from "react-icons/hi";
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const sidebarRef = useRef(null);

    const menuItems = [
        { id: 'home', label: 'Home', path: '/dashboard', icon: <HiHome/> },
        { id: 'courses', label: 'Games', path: '/games', icon: <HiPuzzle /> },
    ];

    const isActive = (path) => location.pathname === path || location.pathname.startsWith('/quiz');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // publish sidebar width to a CSS variable so other components (Dashboard) can center dynamically
    useEffect(() => {
        const el = sidebarRef.current;
        if (el) return;

        const setCssVar = () => {
            const w = el.offsetWidth || (isCollapsed ? 255 : 70);
            document.documentElement.style.setProperty('--sidebar-current-width', `${w}px`);
            // publish a dashboard-side-padding so dashboard can add extra offset when sidebar is closed
            // when collapsed, increase the side padding so content gains breathing room
            const paddingWhenOpen = 40; // px
            const paddingWhenCollapsed = 24; // px (changeable)
            const dashboardPadding = isCollapsed ? paddingWhenOpen: paddingWhenCollapsed;
            document.documentElement.style.setProperty('--dashboard-side-padding', `${dashboardPadding}px`);
        };

        // set initially
        setCssVar();

        // recalculate on window resize
        const handleResize = () => {
            setCssVar();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isCollapsed]);

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} ref={sidebarRef}>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isCollapsed ? <HiMenu size={20} /> : <HiX size={20} />}
            </button>

            <div className="sidebar-logo">
                {/* use public/ asset path so Vite can resolve it at runtime */}
                <img src="/pla.png" alt="Logo" />
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        title={isCollapsed ? item.label : ''}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-bottom">
                <button
                    className="sidebar-item logout-item"
                    onClick={handleLogout}
                    title={isCollapsed ? 'Sair' : ''}
                >
                    <span className="sidebar-icon"><HiOutlineLogin /></span>
                    <span className="sidebar-label">Leave</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;