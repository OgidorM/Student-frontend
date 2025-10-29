import React, { useState, useEffect, useRef } from 'react';
import './AwaitingAI.css';

const AwaitingAI = () => {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameStateRef = useRef({
    bird: { x: 50, y: 200, velocity: 0, radius: 15 },
    pipes: [],
    frame: 0,
    gameOver: false
  });

  const GRAVITY = 0.5;
  const JUMP_STRENGTH = -8;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 150;
  const PIPE_SPEED = 2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 500;

    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameStarted) {
          setGameStarted(true);
          resetGame();
        } else if (!gameStateRef.current.gameOver) {
          gameStateRef.current.bird.velocity = JUMP_STRENGTH;
        } else {
          resetGame();
        }
      }
    };

    const handleClick = () => {
      if (!gameStarted) {
        setGameStarted(true);
        resetGame();
      } else if (!gameStateRef.current.gameOver) {
        gameStateRef.current.bird.velocity = JUMP_STRENGTH;
      } else {
        resetGame();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    canvas.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gameStarted]);

  const resetGame = () => {
    gameStateRef.current = {
      bird: { x: 50, y: 200, velocity: 0, radius: 15 },
      pipes: [],
      frame: 0,
      gameOver: false
    };
    setScore(0);
    setGameStarted(true);
  };

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const gameLoop = () => {
      const state = gameStateRef.current;

      if (!state.gameOver) {
        state.frame++;

        // Update bird
        state.bird.velocity += GRAVITY;
        state.bird.y += state.bird.velocity;

        // Generate pipes
        if (state.frame % 90 === 0) {
          const minHeight = 50;
          const maxHeight = canvas.height - PIPE_GAP - 50;
          const height = Math.random() * (maxHeight - minHeight) + minHeight;
          state.pipes.push({ x: canvas.width, topHeight: height });
        }

        // Update pipes
        state.pipes.forEach((pipe, index) => {
          pipe.x -= PIPE_SPEED;

          // Check if bird passed the pipe
          if (pipe.x + PIPE_WIDTH === state.bird.x) {
            setScore(prev => {
              const newScore = prev + 1;
              setHighScore(current => Math.max(current, newScore));
              return newScore;
            });
          }

          // Collision detection
          if (
            state.bird.x + state.bird.radius > pipe.x &&
            state.bird.x - state.bird.radius < pipe.x + PIPE_WIDTH
          ) {
            if (
              state.bird.y - state.bird.radius < pipe.topHeight ||
              state.bird.y + state.bird.radius > pipe.topHeight + PIPE_GAP
            ) {
              state.gameOver = true;
            }
          }
        });

        // Remove off-screen pipes
        state.pipes = state.pipes.filter(pipe => pipe.x > -PIPE_WIDTH);

        // Check if bird hit the ground or ceiling
        if (state.bird.y + state.bird.radius > canvas.height || state.bird.y - state.bird.radius < 0) {
          state.gameOver = true;
        }
      }

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = '#70c5ce';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw pipes
      ctx.fillStyle = '#5cb85c';
      state.pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.strokeStyle = '#4cae4c';
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height);
        ctx.strokeRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, canvas.height);
      });

      // Draw bird
      ctx.fillStyle = '#f0ad4e';
      ctx.beginPath();
      ctx.arc(state.bird.x, state.bird.y, state.bird.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ec971f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(state.bird.x + 5, state.bird.y - 3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(state.bird.x + 6, state.bird.y - 3, 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw beak
      ctx.fillStyle = '#ff6347';
      ctx.beginPath();
      ctx.moveTo(state.bird.x + state.bird.radius, state.bird.y);
      ctx.lineTo(state.bird.x + state.bird.radius + 8, state.bird.y);
      ctx.lineTo(state.bird.x + state.bird.radius, state.bird.y + 5);
      ctx.closePath();
      ctx.fill();

      // Draw game over text
      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Click ou Space para reiniciar', canvas.width / 2, canvas.height / 2 + 50);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStarted, score]);

  return (
    <div className="awaiting-ai-container">
      <div className="awaiting-content">
        <div className="loading-header">
          <div className="spinner"></div>
          <h2>Aguardando resposta da IA...</h2>
          <p>Enquanto espera, jogue um pouco!</p>
        </div>

        <div className="game-container">
          <div className="game-info">
            <div className="score-display">
              <span className="label">Pontuação:</span>
              <span className="value">{score}</span>
            </div>
            <div className="score-display">
              <span className="label">Recorde:</span>
              <span className="value">{highScore}</span>
            </div>
          </div>

          <canvas ref={canvasRef} className="game-canvas"></canvas>

          {!gameStarted && (
            <div className="game-instructions">
              <p>🎮 Clique ou pressione ESPAÇO para começar</p>
              <p>🐦 Mantenha o pássaro voando!</p>
            </div>
          )}
        </div>

        <div className="loading-footer">
          <p className="tip">💡 Dica: A IA pode demorar alguns segundos para processar sua solicitação.</p>
        </div>
      </div>
    </div>
  );
};

export default AwaitingAI;

