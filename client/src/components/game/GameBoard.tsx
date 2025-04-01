/**
 * Компонент GameBoard - отображает игровое поле Тетриса
 * 
 * Этот компонент отвечает за визуализацию игрового поля, текущей падающей фигуры,
 * приземлившихся блоков и состояний "Игра окончена" и "Пауза".
 */

import React from 'react';
import { Block, Tetromino } from '@/lib/tetris';

/**
 * Интерфейс для свойств компонента GameBoard
 * 
 * @property gameBoard - Двумерный массив, представляющий состояние игрового поля
 * @property currentPiece - Текущая активная (падающая) фигура
 * @property currentPosition - Позиция текущей фигуры на игровом поле
 * @property isGameOver - Флаг, показывающий, окончена ли игра
 * @property isPaused - Флаг, показывающий, находится ли игра на паузе
 * @property restartGame - Функция для перезапуска игры
 */
interface GameBoardProps {
  gameBoard: (Block | null)[][];
  currentPiece: Tetromino | null;
  currentPosition: { x: number; y: number };
  isGameOver: boolean;
  isPaused: boolean;
  restartGame: () => void;
}

/**
 * Компонент игровой доски Тетрис
 * 
 * @param props - Свойства компонента GameBoard
 * @returns JSX элемент игровой доски
 */
export default function GameBoard({ 
  gameBoard, 
  currentPiece, 
  currentPosition, 
  isGameOver, 
  isPaused, 
  restartGame 
}: GameBoardProps) {
  /**
   * Рендерит текущую активную (падающую) фигуру
   * 
   * Функция преобразует абстрактное представление фигуры в набор
   * визуальных блоков, расположенных на игровом поле в соответствии 
   * с текущей позицией фигуры.
   * 
   * @returns Массив JSX элементов, представляющих блоки активной фигуры,
   *          или null, если текущей фигуры нет
   */
  const renderActivePiece = () => {
    // Если нет текущей фигуры, ничего не рендерим
    if (!currentPiece) return null;
    
    // Массив для хранения JSX элементов блоков
    const blocks = [];
    
    // Перебираем матрицу формы текущей фигуры
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        // Если в этой позиции есть блок (true)
        if (currentPiece.shape[y][x]) {
          // Рассчитываем координаты блока на игровом поле
          const boardX = x + currentPosition.x;
          const boardY = y + currentPosition.y;
          
          // Проверяем, находится ли блок в пределах видимого поля
          if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
            // Добавляем блок в массив для рендеринга
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
                  zIndex: 2 // Чтобы активная фигура была всегда поверх приземлившихся блоков
                }}
              ></div>
            );
          }
        }
      }
    }
    
    // Для отладки: выводим информацию о текущей фигуре
    console.log('Rendering active piece:', 
      currentPiece.type, 
      'shape:', JSON.stringify(currentPiece.shape), 
      'position:', currentPosition
    );
    
    return blocks;
  };

  return (
    <div className="relative bg-tetris-bg bg-opacity-60 border-2 border-tetris-border rounded-md overflow-hidden" style={{
      boxShadow: '0 0 20px rgba(100, 200, 255, 0.3), inset 0 0 15px rgba(100, 200, 255, 0.2)',
    }}>
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
