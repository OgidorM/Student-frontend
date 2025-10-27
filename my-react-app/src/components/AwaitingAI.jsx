import { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import './AwaitingAI.css';

const AwaitingAI = () => {
  const [score, setScore] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [birdY, setBirdY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef(null);
  const velocityRef = useRef(0);
  const birdYRef = useRef(250);

  const messages = [
    "🤖 A nossa IA está a analisar as suas respostas...",
    "☁️ A chamar o LLM Server na nuvem para comparações personalizadas...",
    "📚 A gerar explicações personalizadas para cada resposta...",
    "🔍 A buscar documentos relevantes no IPFS...",
    "✨ Quase pronto! A finalizar os resultados...",
  ];

  // Constantes de física do jogo
  const GRAVITY = 0.5;
  const JUMP_STRENGTH = -9;
  const MAX_FALL_SPEED = 12;
  const GAME_HEIGHT = 500;
  const BIRD_SIZE = 40;

  // Alternar mensagens a cada 4 segundos
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(messageInterval);
  }, []);

  // Mecânica do jogo Flappy Bird - CORRIGIDA
  useEffect(() => {
    if (!gameStarted) return;

    gameLoopRef.current = setInterval(() => {
      // Atualizar velocidade com gravidade (limite de queda máxima)
      velocityRef.current = Math.min(velocityRef.current + GRAVITY, MAX_FALL_SPEED);

      // Atualizar posição do pássaro
      birdYRef.current += velocityRef.current;

      // Limites da tela
      if (birdYRef.current > GAME_HEIGHT - BIRD_SIZE) {
        birdYRef.current = GAME_HEIGHT - BIRD_SIZE;
        velocityRef.current = 0;
      }
      if (birdYRef.current < 0) {
        birdYRef.current = 0;
        velocityRef.current = 0;
      }

      setBirdY(birdYRef.current);
      setVelocity(velocityRef.current);

      // Mover obstáculos
      setObstacles((prev) => {
        const updated = prev.map((obs) => ({
          ...obs,
          x: obs.x - 3,
        }));

        // Verificar pontuação - CORRIGIDO: apenas quando o pássaro passa completamente pelo obstáculo
        const withScoring = updated.map((obs) => {
          const birdLeft = 100;
          const birdRight = 140;

          // O pássaro passou pelo obstáculo se o lado direito do pássaro ultrapassou o lado direito do obstáculo
          if (!obs.scored && birdRight > obs.x + 60) {
            setScore((s) => s + 1);
            return { ...obs, scored: true };
          }
          return obs;
        });

        // Remover obstáculos fora da tela
        const filtered = withScoring.filter((obs) => obs.x > -60);

        // Adicionar novos obstáculos
        if (filtered.length === 0 || filtered[filtered.length - 1].x < 400) {
          const gap = 180;
          const minHeight = 80;
          const maxHeight = 280;
          const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

          filtered.push({
            x: 600,
            topHeight,
            gap,
            scored: false,
          });
        }

        // Verificar colisões
        filtered.forEach((obs) => {
          const birdLeft = 100;
          const birdRight = 140;
          const birdTop = birdYRef.current;
          const birdBottom = birdYRef.current + BIRD_SIZE;

          if (birdRight > obs.x && birdLeft < obs.x + 60) {
            if (birdTop < obs.topHeight || birdBottom > obs.topHeight + obs.gap) {
              // Colisão! Reset
              birdYRef.current = 250;
              velocityRef.current = 0;
              setBirdY(250);
              setVelocity(0);
              setObstacles([]);
              setScore(0);
            }
          }
        });

        return filtered;
      });
    }, 20);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted]);

  const handleJump = () => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    velocityRef.current = JUMP_STRENGTH;
    setVelocity(JUMP_STRENGTH);
  };

  return (
    <div className="awaiting-layout">
      <Sidebar />

      <div className="awaiting-main">
        <div className="awaiting-content">
          {/* Mensagem Dinâmica - com altura fixa para evitar CLS */}
          <div className="message-box">
            <div className="message-text">
              {messages[messageIndex]}
            </div>
          </div>

          {/* Mini Game */}
          <div className="game-container">
            <div className="game-header">
              <h3>🎮 Enquanto espera, jogue!</h3>
              <div className="game-score">Pontuação: {score}</div>
            </div>

            <div
              className="game-canvas"
              onClick={handleJump}
              onKeyDown={(e) => e.key === ' ' && handleJump()}
              tabIndex={0}
            >
              {/* Bird */}
              <div
                className="bird"
                style={{
                  top: `${birdY}px`,
                  transform: `rotate(${Math.min(velocity * 3, 45)}deg)`
                }}
              >
                🐦
              </div>

              {/* Obstacles */}
              {obstacles.map((obs, idx) => (
                <div key={idx}>
                  <div
                    className="obstacle obstacle-top"
                    style={{
                      left: `${obs.x}px`,
                      height: `${obs.topHeight}px`
                    }}
                  />
                  <div
                    className="obstacle obstacle-bottom"
                    style={{
                      left: `${obs.x}px`,
                      top: `${obs.topHeight + obs.gap}px`,
                      height: `${GAME_HEIGHT - obs.topHeight - obs.gap}px`
                    }}
                  />
                </div>
              ))}

              {/* Instruções */}
              {!gameStarted && (
                <div className="game-instructions">
                  Clique para começar e saltar!
                </div>
              )}
            </div>

            <div className="game-tip">
              💡 Dica: Clique ou pressione Espaço para saltar
            </div>
          </div>

          {/* Loading Spinner */}
          <div className="processing-indicator">
            <div className="spinner-ai"></div>
            <p>A processar as suas respostas... Por favor aguarde.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwaitingAI;

