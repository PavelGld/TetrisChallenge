import React from 'react';
import { Tetromino } from '@/lib/tetris';

interface NextPieceProps {
  nextPiece: Tetromino | null;
}

export default function NextPiece({ nextPiece }: NextPieceProps) {
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    
    // Define a 4x4 grid for the next piece
    const grid = Array.from({ length: 4 }, () => Array(4).fill(false));
    
    // Calculate offsets to center the piece in the 4x4 grid
    const pieceHeight = nextPiece.shape.length;
    const pieceWidth = nextPiece.shape[0].length;
    const offsetY = Math.floor((4 - pieceHeight) / 2);
    const offsetX = Math.floor((4 - pieceWidth) / 2);
    
    // Map the nextPiece shape to the grid with centering
    nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          // Add centering offsets
          const gridY = y + offsetY;
          const gridX = x + offsetX;
          
          // Make sure we don't go out of bounds
          if (gridY >= 0 && gridY < 4 && gridX >= 0 && gridX < 4) {
            grid[gridY][gridX] = true;
          }
        }
      });
    });
    
    console.log("Next piece:", nextPiece.type, "shape:", JSON.stringify(nextPiece.shape));
    
    return (
      <div className="grid grid-cols-4 grid-rows-4 gap-0 w-24 h-24">
        {grid.flatMap((row, y) => 
          row.map((filled, x) => (
            <div
              key={`${x}-${y}`}
              className={`next-block ${filled ? `bg-tetris-${nextPiece.type.toLowerCase()} rounded-sm` : 'opacity-0'}`}
              style={filled ? {
                boxShadow: 'inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              } : {}}
            ></div>
          ))
        )}
      </div>
    );
  };

  return (
    <div id="next-piece" className="flex justify-center p-2 bg-black bg-opacity-30 rounded-md">
      {renderNextPiece()}
    </div>
  );
}
