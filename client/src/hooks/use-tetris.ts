/**
 * Хук useTetris - основная логика игры Тетрис
 * 
 * Этот хук инкапсулирует всю игровую логику Тетриса: управление фигурами,
 * обнаружение столкновений, подсчет очков, повышение уровней и т.д.
 * 
 * Автор: [Ваше имя]
 * Дата: Апрель 2025
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  createEmptyBoard, 
  Tetromino, 
  Block, 
  generateRandomTetromino, 
  checkCollision, 
  mergeTetrominoWithBoard,
  clearLines,
  rotateMatrix,
  BOARD_WIDTH
} from '@/lib/tetris';

/**
 * Интерфейс состояния игры
 * 
 * @property score - Текущий счет игрока
 * @property level - Текущий уровень (влияет на скорость падения)
 * @property lines - Количество очищенных линий
 * @property highScore - Лучший результат (сохраняется в localStorage)
 * @property isGameOver - Флаг окончания игры
 */
interface GameState {
  score: number;
  level: number;
  lines: number;
  highScore: number;
  isGameOver: boolean;
}

/**
 * Основная функция-хук для игры Тетрис
 * 
 * @returns Объект с состоянием и методами для управления игрой Тетрис
 */
export function useTetris() {
  // Основное состояние игры (счет, уровень, линии и т.д.)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lines: 0,
    highScore: parseInt(localStorage.getItem('tetris-highscore') || '0'),
    isGameOver: false
  });
  
  // Игровое поле - двумерный массив ячеек
  const [gameBoard, setGameBoard] = useState<(Block | null)[][]>(createEmptyBoard());
  
  // Текущая падающая фигура и её позиция
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  
  // Следующая фигура для предпросмотра
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  
  // Статус игры: активна/пауза
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Ссылка на таймер игрового цикла
  const gameLoopRef = useRef<number | null>(null);
  
  // Game speed based on level (in milliseconds)
  const getGameSpeed = useCallback(() => {
    return Math.max(100, 1000 - (gameState.level - 1) * 100);
  }, [gameState.level]);
  
  // Sound effects
  const playSound = useCallback((sound: string) => {
    const audio = document.getElementById(`${sound}-sound`) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log("Audio play error:", err));
    }
  }, []);
  
  // Game over handling function
  const handleGameOver = useCallback(() => {
    // Stop game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Update high score if needed
    if (gameState.score > gameState.highScore) {
      localStorage.setItem('tetris-highscore', gameState.score.toString());
      setGameState(prev => ({ ...prev, highScore: gameState.score }));
    }
    
    // Set game over state
    setGameState(prev => ({ ...prev, isGameOver: true }));
    setIsGameActive(false);
    
    // Play game over sound
    playSound('game-over');
  }, [gameState.score, gameState.highScore, playSound]);
  
  // Handle piece landing
  const handlePieceLanded = useCallback(() => {
    if (!currentPiece) return;
    
    // Merge current piece with the board
    const newBoard = mergeTetrominoWithBoard(gameBoard, currentPiece, currentPosition);
    
    // Check for line clears
    const { clearedBoard, linesCleared } = clearLines(newBoard);
    
    // Update the board
    setGameBoard(clearedBoard);
    
    // Update score based on lines cleared
    if (linesCleared > 0) {
      let pointsScored = 0;
      
      // Scoring system: more points for more lines at once
      switch (linesCleared) {
        case 1: pointsScored = 100 * gameState.level; break;
        case 2: pointsScored = 300 * gameState.level; break;
        case 3: pointsScored = 500 * gameState.level; break;
        case 4: pointsScored = 800 * gameState.level; break; // Tetris!
      }
      
      // Update game state
      const newLines = gameState.lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + pointsScored,
        lines: newLines,
        level: newLevel
      }));
      
      // Play clear sound
      playSound('clear');
    }
    
    // Get the next piece
    const newPiece = nextPiece;
    if (!newPiece) {
      console.error("No next piece available!");
      return;
    }
    
    // Calculate the starting position for the new piece
    const newX = Math.floor((BOARD_WIDTH - newPiece.shape[0].length) / 2);
    
    // Check if game over (if new piece collides immediately)
    if (checkCollision(clearedBoard, newPiece.shape, { x: newX, y: 0 })) {
      console.log("Game over - collision at start position");
      handleGameOver();
      return;
    }
    
    // Set current piece to next piece
    setCurrentPiece(newPiece);
    setCurrentPosition({
      x: newX,
      y: 0
    });
    
    // Generate a new next piece
    setNextPiece(generateRandomTetromino());
    
    console.log("New piece:", newPiece.type, "at position:", newX, 0);
  }, [currentPiece, currentPosition, gameBoard, gameState.level, gameState.lines, nextPiece, playSound, handleGameOver]);
  
  // Move piece down (soft drop)
  const softDrop = useCallback(() => {
    if (!isGameActive || isPaused || !currentPiece) return;
    
    const newY = currentPosition.y + 1;
    if (!checkCollision(gameBoard, currentPiece.shape, { x: currentPosition.x, y: newY })) {
      setCurrentPosition(prev => ({ ...prev, y: newY }));
      // Add a small score bonus for soft drop
      setGameState(prev => ({ ...prev, score: prev.score + 1 }));
    } else {
      console.log(`Piece landed: ${currentPiece.type} at position:`, currentPosition);
      // Piece landed
      handlePieceLanded();
    }
  }, [gameBoard, currentPiece, currentPosition, isGameActive, isPaused, handlePieceLanded]);
  
  // Game loop
  const gameLoop = useCallback(() => {
    if (!isGameActive || isPaused) return;
    softDrop();
  }, [isGameActive, isPaused, softDrop]);
  
  // Move current piece left
  const moveLeft = useCallback(() => {
    if (!isGameActive || isPaused || !currentPiece) return;
    
    const newX = currentPosition.x - 1;
    if (!checkCollision(gameBoard, currentPiece.shape, { x: newX, y: currentPosition.y })) {
      setCurrentPosition(prev => ({ ...prev, x: newX }));
      playSound('move');
    }
  }, [gameBoard, currentPiece, currentPosition, isGameActive, isPaused, playSound]);
  
  // Move current piece right
  const moveRight = useCallback(() => {
    if (!isGameActive || isPaused || !currentPiece) return;
    
    const newX = currentPosition.x + 1;
    if (!checkCollision(gameBoard, currentPiece.shape, { x: newX, y: currentPosition.y })) {
      setCurrentPosition(prev => ({ ...prev, x: newX }));
      playSound('move');
    }
  }, [gameBoard, currentPiece, currentPosition, isGameActive, isPaused, playSound]);
  
  // Rotate current piece
  const rotate = useCallback(() => {
    if (!isGameActive || isPaused || !currentPiece) return;
    
    const rotatedShape = rotateMatrix(currentPiece.shape);
    
    // Try normal rotation
    if (!checkCollision(gameBoard, rotatedShape, currentPosition)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotatedShape } : null);
      playSound('rotate');
      return;
    }
    
    // Try wall kicks (left and right)
    for (let offset = 1; offset <= 2; offset++) {
      // Try kicking right
      if (!checkCollision(gameBoard, rotatedShape, { x: currentPosition.x + offset, y: currentPosition.y })) {
        setCurrentPiece(prev => prev ? { ...prev, shape: rotatedShape } : null);
        setCurrentPosition(prev => ({ ...prev, x: prev.x + offset }));
        playSound('rotate');
        return;
      }
      
      // Try kicking left
      if (!checkCollision(gameBoard, rotatedShape, { x: currentPosition.x - offset, y: currentPosition.y })) {
        setCurrentPiece(prev => prev ? { ...prev, shape: rotatedShape } : null);
        setCurrentPosition(prev => ({ ...prev, x: prev.x - offset }));
        playSound('rotate');
        return;
      }
    }
  }, [gameBoard, currentPiece, currentPosition, isGameActive, isPaused, playSound]);
  
  // Hard drop the piece
  const hardDrop = useCallback(() => {
    if (!isGameActive || isPaused || !currentPiece) return;
    
    let dropDistance = 0;
    let newY = currentPosition.y;
    
    // Find the furthest possible position
    while (!checkCollision(gameBoard, currentPiece.shape, { x: currentPosition.x, y: newY + 1 })) {
      newY++;
      dropDistance++;
    }
    
    // Update position
    setCurrentPosition(prev => ({ ...prev, y: newY }));
    
    // Add score based on drop distance (2 points per cell)
    setGameState(prev => ({ ...prev, score: prev.score + dropDistance * 2 }));
    
    // Play drop sound
    playSound('drop');
    
    // Piece landed instantly
    handlePieceLanded();
  }, [gameBoard, currentPiece, currentPosition, isGameActive, isPaused, playSound, handlePieceLanded]);
  
  // Initialize the game
  const initializeGame = useCallback(() => {
    // Create empty board
    setGameBoard(createEmptyBoard());
    
    // Generate first tetromino
    const firstPiece = generateRandomTetromino();
    setCurrentPiece(firstPiece);
    
    // Position piece at the top center of the board
    const startX = Math.floor((BOARD_WIDTH - firstPiece.shape[0].length) / 2);
    setCurrentPosition({ 
      x: startX, 
      y: 0 
    });
    
    // Generate next tetromino
    setNextPiece(generateRandomTetromino());
    
    // Reset game state
    setGameState(prev => ({
      ...prev,
      score: 0,
      level: 1,
      lines: 0,
      isGameOver: false
    }));
    
    // Set game status
    setIsGameActive(true);
    setIsPaused(false);
    
    console.log("Game initialized with first piece:", firstPiece.type, "at position:", startX, 0);
  }, []);
  
  /**
   * Запускает новую игру или возобновляет игру после паузы
   * 
   * - Если игра окончена - инициализирует новую игру
   * - Если игра не запущена - инициализирует и запускает новую игру
   * - Если игра на паузе - возобновляет игру
   */
  const startGame = useCallback(() => {
    // Если игра окончена или ещё не начата, инициализируем новую
    if (gameState.isGameOver || !isGameActive) {
      initializeGame();
      setIsGameActive(true);
    } else {
      // Если игра уже идёт, снимаем с паузы
      setIsPaused(false);
    }
    
    // Очищаем все существующие игровые циклы
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    // Запускаем новый игровой цикл
    gameLoopRef.current = window.setInterval(gameLoop, getGameSpeed());
  }, [gameState.isGameOver, isGameActive, initializeGame, gameLoop, getGameSpeed]);
  
  // Pause the game
  const pauseGame = useCallback(() => {
    if (!isGameActive) return;
    
    setIsPaused(true);
    
    // Stop the game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [isGameActive]);
  
  // Restart the game
  const restartGame = useCallback(() => {
    // Stop any existing game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Initialize and start the game
    initializeGame();
    
    // Start a new game loop
    gameLoopRef.current = window.setInterval(gameLoop, getGameSpeed());
  }, [initializeGame, gameLoop, getGameSpeed]);
  
  // Update game speed when level changes
  useEffect(() => {
    if (isGameActive && !isPaused && gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = window.setInterval(gameLoop, getGameSpeed());
    }
  }, [gameState.level, isGameActive, isPaused, gameLoop, getGameSpeed]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);
  
  // Load high score from localStorage on mount
  useEffect(() => {
    const storedHighScore = localStorage.getItem('tetris-highscore');
    if (storedHighScore) {
      setGameState(prev => ({ ...prev, highScore: parseInt(storedHighScore) }));
    }
  }, []);
  
  return {
    gameState,
    gameBoard,
    currentPiece,
    currentPosition,
    nextPiece,
    isGameActive,
    isPaused,
    startGame,
    pauseGame,
    restartGame,
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
  };
}
