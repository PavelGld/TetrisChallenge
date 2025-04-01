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
    
    // Map the nextPiece shape to the grid
    nextPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          grid[y][x] = true;
        }
      });
    });
    
    return (
      <div className="grid grid-cols-4 grid-rows-4 gap-0 w-24 h-24">
        {grid.flatMap((row, y) => 
          row.map((filled, x) => (
            <div
              key={`${x}-${y}`}
              className={`next-block ${filled ? `bg-tetris-${nextPiece.type.toLowerCase()} rounded-sm` : 'opacity-0'}`}
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
