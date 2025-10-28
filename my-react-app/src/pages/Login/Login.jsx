import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import apiClient from '../../api/axiosClient.js';
import { mockApiClient } from '../../api/mockApiClient.js';
import { gsap } from 'gsap';
import './Login.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const containerRef = useRef(null);
    const bubblesRef = useRef([]);
    const buttonRef = useRef(null);

    useEffect(() => {
        const bubbles = bubblesRef.current;

        // Animate each bubble from right to left
        bubbles.forEach((bubble) => {
            if (bubble) {
                // Random properties for each bubble
                const randomY = Math.random() * window.innerHeight; // Random vertical position
                const randomScale = 0.5 + Math.random() * 1;
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
                    duration: 1.5 + Math.random() * 1,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }
        });

        // Container entrance animation - using TO instead of FROM to avoid visibility issues
        if (containerRef.current) {
            // Set initial state
            gsap.set(containerRef.current, {
                scale: 0.98,
                y: 10,
                opacity: 1,
            });

            // Animate to final state
            gsap.to(containerRef.current, {
                scale: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.2,
            });
        }

        // Button animation - gentle pulse effect
        if (buttonRef.current) {
            gsap.to(buttonRef.current, {
                scale: 1.02,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });

            // Add shine effect
            gsap.to(buttonRef.current, {
                boxShadow: "0 15px 35px rgba(58, 125, 232, 0.5)",
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        }

        // Cleanup
        return () => {
            gsap.killTweensOf(bubbles);
            if (containerRef.current) {
                gsap.killTweensOf(containerRef.current);
            }
            if (buttonRef.current) {
                gsap.killTweensOf(buttonRef.current);
            }
        };
    }, []);

    const handleButtonHover = () => {
        if (buttonRef.current && !loading) {
            gsap.to(buttonRef.current, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    };

    const handleButtonLeave = () => {
        if (buttonRef.current && !loading) {
            gsap.to(buttonRef.current, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
            });
        }
    };

    const handleButtonClick = () => {
        if (buttonRef.current && !loading) {
            gsap.to(buttonRef.current, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.in",
                yoyo: true,
                repeat: 1,
            });
        }
    };

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
            <div className="animated-bubbles-background">
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="bubble"
                        ref={(el) => (bubblesRef.current[i] = el)}
                    />
                ))}
            </div>
            <div className="login-container-modern" ref={containerRef}>
                <div className="login-left">
                    <div className="login-hero">
                        <h2 className="hero-heading">Bem-vindo de volta!</h2>
                        <p className="hero-text">
                            Acesse sua conta e continue aprendendo com a comunidade P2P
                        </p>
                    </div>

                    <div className="login-illustration">
                        <img
                            src="plabranco.png"
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
                                ref={buttonRef}
                                type="submit"
                                disabled={loading}
                                className="login-button-modern"
                                onMouseEnter={handleButtonHover}
                                onMouseLeave={handleButtonLeave}
                                onClick={handleButtonClick}
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