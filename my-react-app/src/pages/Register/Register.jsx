import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient.js';
import { mockApiClient } from '../../api/mockApiClient.js';
import { gsap } from 'gsap';
import { HiBeaker, HiExclamation, HiCheckCircle } from 'react-icons/hi';
import './Register.css';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const Register = () => {
    const [nome, setNome] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [datanascimento, setDatanascimento] = useState('');
    const [tipo, setTipo] = useState('Aluno'); // Default tipo with capital letter
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const containerRef = useRef(null);
    const bubblesRef = useRef([]);
    const buttonRef = useRef(null);

    useEffect(() => {
        const bubbles = bubblesRef.current;

        // Animate each bubble from right to left
        bubbles.forEach((bubble) => {
            if (bubble) {
                const randomY = Math.random() * window.innerHeight;
                const randomScale = 0.5 + Math.random() * 1;
                const randomDelay = Math.random() * 2;
                const randomDuration = 4 + Math.random() * 3;

                gsap.set(bubble, {
                    x: window.innerWidth + 200,
                    y: randomY,
                    scale: randomScale,
                    opacity: 0.7,
                });

                gsap.to(bubble, {
                    x: -300,
                    duration: randomDuration,
                    delay: randomDelay,
                    ease: "none",
                    repeat: -1,
                    repeatDelay: Math.random() * 2,
                });

                gsap.to(bubble, {
                    y: `+=${Math.random() * 200 - 100}`,
                    duration: 2 + Math.random() * 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    delay: randomDelay,
                });

                gsap.to(bubble, {
                    opacity: 0.3 + Math.random() * 0.4,
                    duration: 1.5 + Math.random() * 1,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            }
        });

        if (containerRef.current) {
            gsap.set(containerRef.current, {
                scale: 0.98,
                y: 10,
            });

            gsap.to(containerRef.current, {
                scale: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                delay: 0.2,
            });
        }

        if (buttonRef.current) {
            gsap.to(buttonRef.current, {
                scale: 1.02,
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });

            gsap.to(buttonRef.current, {
                boxShadow: "0 15px 35px rgba(58, 125, 232, 0.5)",
                duration: 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
            });
        }

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
        setSuccess('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('As palavras-passe não coincidem');
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError('A palavra-passe deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            if (useMock) {
                // Mock registration
                await mockApiClient.register(nome, password);
            } else {
                await apiClient.post('/auth/register', {
                    nome,
                    password,
                    tipo,
                    datanascimento: datanascimento || undefined
                });
            }

            setSuccess('Conta criada com sucesso! Redirecionando para login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Erro no registo:', err);
            setError(err.response?.data?.error || 'Falha no registo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="animated-bubbles-background">
                {[...Array(40)].map((_, i) => (
                    <div
                        key={i}
                        className="bubble"
                        ref={(el) => (bubblesRef.current[i] = el)}
                    />
                ))}
            </div>
            <div className="register-container-modern" ref={containerRef}>
                <div className="register-left">
                    <div className="register-hero">
                        <h2 className="hero-heading">Junte-se a nós!</h2>
                        <p className="hero-text">
                            Crie sua conta e comece a aprender com a melhor plataforma P2P
                        </p>
                    </div>

                    <div className="register-illustration">
                        <img
                            src="plabranco.png"
                            alt="Learning"
                        />
                    </div>
                </div>

                <div className="register-right">
                    <div className="register-form-wrapper">
                        {useMock && (
                            <div className="mock-notice-modern">
                                <HiBeaker className="mock-icon" />
                                <div>
                                    <strong>Modo de Teste</strong>
                                    <p>Registos são simulados neste modo</p>
                                </div>
                            </div>
                        )}

                        <h2 className="form-title">Criar Conta</h2>
                        <p className="form-subtitle">Preencha os dados abaixo</p>

                        <form onSubmit={handleSubmit} className="register-form-modern">
                            <div className="form-group-modern">
                                <label htmlFor="nome">Nome de Utilizador</label>
                                <input
                                    type="text"
                                    id="nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    required
                                    disabled={loading}
                                    placeholder="Digite seu nome de utilizador"
                                    className="input-modern"
                                />
                            </div>

                            <div className="form-group-modern">
                                <label htmlFor="tipo">Tipo de Utilizador</label>
                                <select
                                    id="tipo"
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="input-modern select-modern"
                                >
                                    <option value="Aluno">Aluno</option>
                                    <option value="Professor">Professor</option>
                                </select>
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

                            <div className="form-group-modern">
                                <label htmlFor="confirmPassword">Confirmar Palavra-passe</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    placeholder="Confirme sua password"
                                    className="input-modern"
                                />
                            </div>

                            <div className="form-group-modern">
                                <label htmlFor="datanascimento">Data de Nascimento (Opcional)</label>
                                <input
                                    type="date"
                                    id="datanascimento"
                                    value={datanascimento}
                                    onChange={(e) => setDatanascimento(e.target.value)}
                                    disabled={loading}
                                    className="input-modern"
                                />
                            </div>

                            {error && (
                                <div className="error-message-modern">
                                    <HiExclamation className="error-icon" />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="success-message-modern">
                                    <HiCheckCircle className="success-icon" />
                                    {success}
                                </div>
                            )}

                            <button
                                ref={buttonRef}
                                type="submit"
                                disabled={loading}
                                className="register-button-modern"
                                onMouseEnter={handleButtonHover}
                                onMouseLeave={handleButtonLeave}
                                onClick={handleButtonClick}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Registando...
                                    </>
                                ) : (
                                    'Criar Conta'
                                )}
                            </button>
                        </form>

                        <div className="register-footer">
                            <p>Já tem uma conta? <a href="/login">Iniciar sessão</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
