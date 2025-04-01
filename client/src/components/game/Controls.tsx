import React, { useEffect, useState } from 'react';

interface ControlsProps {
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

export default function Controls({
  isGameActive,
  isPaused,
  togglePause,
  restartGame,
  moveLeft,
  moveRight,
  rotate,
  softDrop,
  hardDrop
}: ControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Get the appropriate text for the start/pause button
  const getStartPauseText = () => {
    if (!isGameActive) return 'START';
    return isPaused ? 'RESUME' : 'PAUSE';
  };

  return (
    <div className="bg-tetris-bg bg-opacity-70 border-2 border-tetris-border rounded-md p-4" style={{
      boxShadow: '0 0 15px rgba(100, 200, 255, 0.2), inset 0 0 10px rgba(100, 200, 255, 0.1)',
    }}>
      <h3 className="font-game text-sm bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text mb-3">CONTROLS</h3>
      
      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button 
          id="start-pause" 
          className="game-btn bg-tetris-i bg-opacity-70 hover:bg-opacity-90 py-2 px-4 rounded font-game text-sm flex-grow transition-all duration-150 transform hover:scale-105"
          onClick={togglePause}
          style={{ 
            boxShadow: '0 0 10px rgba(0, 225, 255, 0.3)',
            textShadow: '0 0 5px rgba(0, 200, 255, 0.5)'
          }}
        >
          {getStartPauseText()}
        </button>
        <button 
          id="restart" 
          className="game-btn bg-tetris-z bg-opacity-70 hover:bg-opacity-90 py-2 px-4 rounded font-game text-sm flex-grow transition-all duration-150 transform hover:scale-105"
          onClick={restartGame}
          style={{ 
            boxShadow: '0 0 10px rgba(255, 50, 50, 0.3)',
            textShadow: '0 0 5px rgba(255, 100, 100, 0.5)'
          }}
        >
          RESTART
        </button>
      </div>
      
      {/* Keyboard Controls Info */}
      <div className={`text-sm space-y-2 ${isMobile ? 'hidden' : 'block'}`}>
        <p className="flex justify-between">
          <span>Move Left/Right:</span>
          <span className="font-semibold">← →</span>
        </p>
        <p className="flex justify-between">
          <span>Rotate:</span>
          <span className="font-semibold">↑</span>
        </p>
        <p className="flex justify-between">
          <span>Soft Drop:</span>
          <span className="font-semibold">↓</span>
        </p>
        <p className="flex justify-between">
          <span>Hard Drop:</span>
          <span className="font-semibold">SPACE</span>
        </p>
      </div>
      
      {/* Mobile Touch Controls */}
      <div className={`mobile-controls ${isMobile ? 'flex' : 'hidden'} flex-wrap justify-center mt-4 gap-2`}>
        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            className="control-btn col-span-1 bg-gray-700 bg-opacity-70 h-14 rounded flex items-center justify-center transition-all duration-150"
            onTouchStart={(e) => { e.preventDefault(); moveLeft(); }}
            style={{ 
              boxShadow: '0 0 8px rgba(0, 200, 255, 0.3)',
              border: '1px solid rgba(100, 200, 255, 0.2)'
            }}
          >
            <i className="ri-arrow-left-s-line text-2xl text-cyan-300">←</i>
          </button>
          <button
            className="control-btn col-span-1 bg-gray-700 bg-opacity-70 h-14 rounded flex items-center justify-center transition-all duration-150"
            onTouchStart={(e) => { e.preventDefault(); rotate(); }}
            style={{ 
              boxShadow: '0 0 8px rgba(0, 200, 255, 0.3)',
              border: '1px solid rgba(100, 200, 255, 0.2)'
            }}
          >
            <i className="ri-arrow-up-s-line text-2xl text-cyan-300">↑</i>
          </button>
          <button
            className="control-btn col-span-1 bg-gray-700 bg-opacity-70 h-14 rounded flex items-center justify-center transition-all duration-150"
            onTouchStart={(e) => { e.preventDefault(); moveRight(); }}
            style={{ 
              boxShadow: '0 0 8px rgba(0, 200, 255, 0.3)',
              border: '1px solid rgba(100, 200, 255, 0.2)'
            }}
          >
            <i className="ri-arrow-right-s-line text-2xl text-cyan-300">→</i>
          </button>
          <button
            className="control-btn col-span-1 bg-gray-700 bg-opacity-70 h-14 rounded flex items-center justify-center transition-all duration-150"
            onTouchStart={(e) => { e.preventDefault(); softDrop(); }}
            style={{ 
              boxShadow: '0 0 8px rgba(0, 200, 255, 0.3)',
              border: '1px solid rgba(100, 200, 255, 0.2)'
            }}
          >
            <i className="ri-arrow-down-s-line text-2xl text-cyan-300">↓</i>
          </button>
          <button
            className="control-btn col-span-2 bg-gray-700 bg-opacity-70 h-14 rounded flex items-center justify-center transition-all duration-150"
            onTouchStart={(e) => { e.preventDefault(); hardDrop(); }}
            style={{ 
              boxShadow: '0 0 8px rgba(0, 200, 255, 0.3)',
              border: '1px solid rgba(100, 200, 255, 0.2)'
            }}
          >
            <span className="text-2xl mr-1 text-cyan-300">⎵</span> 
            <span className="text-cyan-300">DROP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
