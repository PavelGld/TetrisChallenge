import React from 'react';
import { Block, Tetromino } from '@/lib/tetris';

interface GameBoardProps {
  gameBoard: (Block | null)[][];
  currentPiece: Tetromino | null;
  currentPosition: { x: number; y: number };
  isGameOver: boolean;
  isPaused: boolean;
  restartGame: () => void;
}

export default function GameBoard({ 
  gameBoard, 
  currentPiece, 
  currentPosition, 
  isGameOver, 
  isPaused, 
  restartGame 
}: GameBoardProps) {
  // Render the active falling piece
  const renderActivePiece = () => {
    if (!currentPiece) return null;
    
    // Create an array to hold all the block elements
    const blocks = [];
    
    // Loop through the current piece shape
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardX = x + currentPosition.x;
          const boardY = y + currentPosition.y;
          
          // Check if piece is within visible board boundaries
          if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
            blocks.push(
              <div
                key={`active-${x}-${y}-${boardX}-${boardY}`}
                className={`tetris-block absolute rounded-sm bg-tetris-${currentPiece.type.toLowerCase()}`}
                style={{
                  width: '10%',
                  height: '5%',
                  top: `${boardY * 5}%`,
                  left: `${boardX * 10}%`,
                  boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.4), inset -3px -3px 6px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  zIndex: 2
                }}
              ></div>
            );
          }
        }
      }
    }
    
    // For debugging
    console.log('Rendering active piece:', 
      currentPiece.type, 
      'shape:', JSON.stringify(currentPiece.shape), 
      'position:', currentPosition
    );
    
    return blocks;
  };

  return (
    <div className="relative bg-tetris-bg bg-opacity-60 border-2 border-tetris-border rounded-md overflow-hidden">
      {/* Grid overlay for visual effect */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-20 gap-px pointer-events-none">
        {Array.from({ length: 200 }).map((_, i) => (
          <div key={i} className="game-grid-cell"></div>
        ))}
      </div>
      
      {/* Actual game board where landed pieces are rendered */}
      <div 
        id="game-board" 
        className="grid grid-cols-10 grid-rows-20 gap-px relative w-[280px] h-[560px] sm:w-[300px] sm:h-[600px]"
      >
        {gameBoard.map((row, y) => 
          row.map((block, x) => 
            block && (
              <div
                key={`board-${x}-${y}`}
                className={`tetris-block absolute rounded-sm bg-tetris-${block.type.toLowerCase()}`}
                style={{
                  width: '10%',
                  height: '5%',
                  top: `${y * 5}%`,
                  left: `${x * 10}%`,
                  boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.4), inset -3px -3px 6px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  zIndex: 1
                }}
              ></div>
            )
          )
        )}
        
        {/* Active falling piece */}
        {renderActivePiece()}
      </div>
      
      {/* Game Over Overlay */}
      <div id="game-over" className={`absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10 ${isGameOver ? '' : 'hidden'}`}>
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
      <div id="pause-overlay" className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10 ${isPaused ? '' : 'hidden'}`}>
        <h2 className="font-game text-2xl text-cyan-300">PAUSED</h2>
      </div>
    </div>
  );
}
