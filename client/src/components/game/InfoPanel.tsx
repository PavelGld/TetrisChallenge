import React from 'react';
import NextPiece from './NextPiece';
import Controls from './Controls';
import { Tetromino } from '@/lib/tetris';

interface InfoPanelProps {
  score: number;
  level: number;
  lines: number;
  highScore: number;
  nextPiece: Tetromino | null;
  isGameActive: boolean;
  isPaused: boolean;
  togglePause: () => void;
  restartGame: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  rotate: () => void;
  softDrop: () => void;
  hardDrop: () => void;
}

export default function InfoPanel({
  score,
  level,
  lines,
  highScore,
  nextPiece,
  isGameActive,
  isPaused,
  togglePause,
  restartGame,
  moveLeft,
  moveRight,
  rotate,
  softDrop,
  hardDrop
}: InfoPanelProps) {
  return (
    <div className="w-full md:w-auto flex flex-col gap-6">
      {/* Score Section */}
      <div className="bg-tetris-bg bg-opacity-70 border-2 border-tetris-border rounded-md p-4 w-full">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300">SCORE</h3>
            <p id="score" className="font-game text-2xl">{score}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300">LEVEL</h3>
            <p id="level" className="font-game text-2xl">{level}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300">LINES</h3>
            <p id="lines" className="font-game text-2xl">{lines}</p>
          </div>
          
          <div className="space-y-1">
            <h3 className="font-game text-sm text-cyan-300">HIGH SCORE</h3>
            <p id="high-score" className="font-game text-2xl">{highScore}</p>
          </div>
        </div>
      </div>
      
      {/* Next Piece Preview */}
      <div className="bg-tetris-bg bg-opacity-70 border-2 border-tetris-border rounded-md p-4">
        <h3 className="font-game text-sm text-cyan-300 mb-2">NEXT</h3>
        <NextPiece nextPiece={nextPiece} />
      </div>
      
      {/* Game Controls */}
      <Controls 
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
  );
}
