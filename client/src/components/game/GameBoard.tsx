import React from 'react';
import { Block } from '@/lib/tetris';

interface GameBoardProps {
  gameBoard: (Block | null)[][];
  isGameOver: boolean;
  isPaused: boolean;
  restartGame: () => void;
}

export default function GameBoard({ gameBoard, isGameOver, isPaused, restartGame }: GameBoardProps) {
  return (
    <div className="relative bg-tetris-bg bg-opacity-60 border-2 border-tetris-border rounded-md overflow-hidden">
      {/* Grid overlay for visual effect */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-20 gap-px pointer-events-none">
        {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className="game-grid-cell"></div>
        ))}
      </div>
      
      {/* Actual game board where pieces are rendered */}
      <div 
        id="game-board" 
        className="grid grid-cols-10 grid-rows-20 gap-px relative w-[280px] h-[560px] sm:w-[300px] sm:h-[600px]"
      >
        {gameBoard.map((row, y) => 
          row.map((block, x) => 
            block && (
              <div
                key={`${x}-${y}`}
                className={`tetris-block absolute rounded-sm bg-tetris-${block.type.toLowerCase()}`}
                style={{
                  width: '10%',
                  height: '5%',
                  top: `${y * 5}%`,
                  left: `${x * 10}%`,
                  boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.4), inset -3px -3px 6px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              ></div>
            )
          )
        )}
      </div>
      
      {/* Game Over Overlay */}
      <div id="game-over" className={`absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center ${isGameOver ? '' : 'hidden'}`}>
        <h2 className="font-game text-3xl text-red-500 mb-4">GAME OVER</h2>
        <button 
          id="restart-button" 
          className="bg-tetris-t bg-opacity-70 hover:bg-opacity-100 text-white font-bold py-2 px-6 rounded transition duration-200 font-game"
          onClick={restartGame}
        >
          RESTART
        </button>
      </div>
      
      {/* Pause Overlay */}
      <div id="pause-overlay" className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center ${isPaused ? '' : 'hidden'}`}>
        <h2 className="font-game text-2xl text-cyan-300">PAUSED</h2>
      </div>
    </div>
  );
}
