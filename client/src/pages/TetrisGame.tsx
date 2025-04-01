import React, { useEffect } from 'react';
import GameBoard from '@/components/game/GameBoard';
import InfoPanel from '@/components/game/InfoPanel';
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

  // Handle pause/resume toggle
  const togglePause = () => {
    if (!isGameActive) {
      startGame();
    } else {
      isPaused ? startGame() : pauseGame();
    }
  };

  return (
    <div className="text-white font-main">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Game Title */}
        <h1 className="font-game text-xl sm:text-3xl md:text-4xl mb-4 text-center text-cyan-300 tracking-wider">
          TETRIS
        </h1>
        
        {/* Main Game Container */}
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6 w-full max-w-6xl">
          <GameBoard 
            gameBoard={gameBoard}
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
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Controls: Arrow keys to move and rotate, Space to drop</p>
          <p className="mt-1">© {new Date().getFullYear()} Tetris Game</p>
        </div>
      </div>
    </div>
  );
}
