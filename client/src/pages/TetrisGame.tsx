import React, { useEffect } from 'react';
import GameBoard from '@/components/game/GameBoard';
import InfoPanel from '@/components/game/InfoPanel';
import BackgroundMusic from '@/components/game/BackgroundMusic';
import { useTetris } from '@/hooks/use-tetris';

export default function TetrisGame() {
  const {
    gameState,
    startGame,
    pauseGame,
    restartGame,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    rotate,
    isGameActive,
    isPaused,
    gameBoard,
    nextPiece,
    currentPiece,
    currentPosition,
  } = useTetris();

  // Setup keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameActive || isPaused) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          moveLeft();
          break;
        case 'ArrowRight':
          moveRight();
          break;
        case 'ArrowDown':
          softDrop();
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          hardDrop();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameActive, isPaused, moveLeft, moveRight, softDrop, hardDrop, rotate]);

  /**
   * Обрабатывает нажатие на кнопку Start/Pause/Resume
   * 
   * Если игра не активна - запускает новую игру
   * Если игра активна и на паузе - возобновляет игру
   * Если игра активна и не на паузе - ставит на паузу
   */
  const togglePause = () => {
    if (!isGameActive) {
      // Если игра не активна, инициализируем и запускаем новую игру
      startGame();
    } else {
      // Если игра активна, переключаем состояние паузы
      if (isPaused) {
        startGame(); // Возобновляем игру после паузы
      } else {
        pauseGame(); // Ставим игру на паузу
      }
    }
  };

  return (
    <div className="text-white font-main">
      {/* Space background */}
      <div className="space-background">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      {/* Background Music */}
      <BackgroundMusic isPlaying={isGameActive} />
      
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Game Title */}
        <h1 className="font-game text-xl sm:text-3xl md:text-4xl mb-4 text-center tracking-wider tetris-title"
            style={{
              background: 'linear-gradient(to right, #00f2fe, #4facfe, #7a67ee)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 20px rgba(77, 213, 254, 0.4)',
              letterSpacing: '0.15em'
            }}
        >
          COSMIC TETRIS
        </h1>
        
        {/* Main Game Container */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6 w-full max-w-6xl">
          <GameBoard 
            gameBoard={gameBoard}
            currentPiece={currentPiece}
            currentPosition={currentPosition}
            isGameOver={gameState.isGameOver}
            isPaused={isPaused}
            restartGame={restartGame}
          />
          
          <InfoPanel 
            score={gameState.score}
            level={gameState.level}
            lines={gameState.lines}
            highScore={gameState.highScore}
            nextPiece={nextPiece}
            isGameActive={isGameActive}
            isPaused={isPaused}
            togglePause={togglePause}
            restartGame={restartGame}
            moveLeft={moveLeft}
            moveRight={moveRight}
            rotate={rotate}
            softDrop={softDrop}
            hardDrop={hardDrop}
          />
        </div>
        
        {/* Audio elements */}
        <div className="hidden">
          <audio id="move-sound" preload="auto">
            <source src="/sounds/move.mp3" type="audio/mpeg" />
          </audio>
          <audio id="rotate-sound" preload="auto">
            <source src="/sounds/rotate.mp3" type="audio/mpeg" />
          </audio>
          <audio id="drop-sound" preload="auto">
            <source src="/sounds/drop.mp3" type="audio/mpeg" />
          </audio>
          <audio id="clear-sound" preload="auto">
            <source src="/sounds/clear.mp3" type="audio/mpeg" />
          </audio>
          <audio id="game-over-sound" preload="auto">
            <source src="/sounds/gameover.mp3" type="audio/mpeg" />
          </audio>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-cyan-700">
          <p className="bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text font-medium">
            Controls: Arrow keys to move and rotate, Space to drop
          </p>
          <p className="mt-1 opacity-70">© {new Date().getFullYear()} Cosmic Tetris</p>
        </div>
      </div>
    </div>
  );
}
