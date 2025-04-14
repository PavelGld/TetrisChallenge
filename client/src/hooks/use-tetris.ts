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
 * Интерфейс достижения игрока
 * 
 * @property id - Уникальный идентификатор достижения
 * @property name - Название достижения
 * @property description - Описание достижения
 * @property points - Количество галактических очков за достижение
 * @property unlocked - Флаг, показывающий разблокировано ли достижение
 * @property icon - Название иконки для достижения
 */
interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  icon: string;
}

/**
 * Интерфейс состояния игры
 * 
 * @property score - Текущий счет игрока
 * @property level - Текущий уровень (влияет на скорость падения)
 * @property lines - Количество очищенных линий
 * @property highScore - Лучший результат (сохраняется в localStorage)
 * @property isGameOver - Флаг окончания игры
 * @property galaxyPoints - Галактические очки за достижения
 * @property achievements - Список достижений игрока
 * @property totalLinesCleared - Общее количество очищенных линий за все игры
 * @property totalPiecesPlaced - Общее количество размещенных фигур за все игры
 * @property totalHardDrops - Общее количество жестких сбросов за все игры
 */
interface GameState {
  score: number;
  level: number;
  lines: number;
  highScore: number;
  isGameOver: boolean;
  galaxyPoints: number;
  achievements: Achievement[];
  totalLinesCleared: number;
  totalPiecesPlaced: number;
  totalHardDrops: number;
}

/**
 * Основная функция-хук для игры Тетрис
 * 
 * @returns Объект с состоянием и методами для управления игрой Тетрис
 */
export function useTetris() {
  /**
   * Список возможных достижений в игре
   */
  const ACHIEVEMENTS: Achievement[] = [
    {
      id: 'cosmic-novice',
      name: 'Космический новичок',
      description: 'Наберите 1000 очков',
      points: 10,
      unlocked: false,
      icon: 'star'
    },
    {
      id: 'space-explorer',
      name: 'Исследователь космоса',
      description: 'Достигните 5 уровня',
      points: 25,
      unlocked: false,
      icon: 'rocket'
    },
    {
      id: 'line-clearer',
      name: 'Мастер очистки',
      description: 'Очистите 50 линий',
      points: 30,
      unlocked: false,
      icon: 'sweeper'
    },
    {
      id: 'tetris-master',
      name: 'Тетрис-мастер',
      description: 'Сделайте 5 Тетрисов (4 линии одновременно)',
      points: 50,
      unlocked: false,
      icon: 'crown'
    },
    {
      id: 'galaxy-hero',
      name: 'Герой галактики',
      description: 'Наберите 10000 очков',
      points: 100,
      unlocked: false,
      icon: 'planet'
    },
    {
      id: 'speed-runner',
      name: 'Скоростной игрок',
      description: 'Достигните 10 уровня',
      points: 75,
      unlocked: false,
      icon: 'lightning'
    },
    {
      id: 'hard-dropper',
      name: 'Мастер падения',
      description: 'Выполните 50 жестких сбросов',
      points: 35,
      unlocked: false,
      icon: 'arrow-down'
    }
  ];

  // Загружаем сохраненные достижения и галактические очки из localStorage
  const loadSavedAchievements = (): Achievement[] => {
    const savedAchievements = localStorage.getItem('tetris-achievements');
    if (savedAchievements) {
      try {
        return JSON.parse(savedAchievements);
      } catch (e) {
        console.error('Ошибка при загрузке достижений:', e);
      }
    }
    return ACHIEVEMENTS;
  };

  const loadSavedGalaxyPoints = (): number => {
    const savedPoints = localStorage.getItem('tetris-galaxy-points');
    if (savedPoints) {
      try {
        return parseInt(savedPoints);
      } catch (e) {
        console.error('Ошибка при загрузке галактических очков:', e);
      }
    }
    return 0;
  };

  const loadSavedStats = () => {
    const savedStats = localStorage.getItem('tetris-stats');
    if (savedStats) {
      try {
        return JSON.parse(savedStats);
      } catch (e) {
        console.error('Ошибка при загрузке статистики:', e);
      }
    }
    return {
      totalLinesCleared: 0,
      totalPiecesPlaced: 0,
      totalHardDrops: 0
    };
  };

  // Основное состояние игры (счет, уровень, линии и т.д.)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lines: 0,
    highScore: parseInt(localStorage.getItem('tetris-highscore') || '0'),
    isGameOver: false,
    galaxyPoints: loadSavedGalaxyPoints(),
    achievements: loadSavedAchievements(),
    totalLinesCleared: loadSavedStats().totalLinesCleared,
    totalPiecesPlaced: loadSavedStats().totalPiecesPlaced,
    totalHardDrops: loadSavedStats().totalHardDrops
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
  
  /**
   * Проверяет и обновляет достижения игрока
   */
  const checkAchievements = useCallback((state: GameState) => {
    let updatedAchievements = [...state.achievements];
    let pointsEarned = 0;
    
    // Проверяем каждое достижение
    updatedAchievements = updatedAchievements.map(achievement => {
      // Если достижение уже разблокировано, возвращаем как есть
      if (achievement.unlocked) return achievement;
      
      let unlocked = false;
      
      // Проверяем условия для каждого достижения
      switch(achievement.id) {
        case 'cosmic-novice':
          unlocked = state.score >= 1000;
          break;
        case 'space-explorer':
          unlocked = state.level >= 5;
          break;
        case 'line-clearer':
          unlocked = state.totalLinesCleared >= 50;
          break;
        case 'tetris-master':
          // Это достижение проверяется в handlePieceLanded при очистке 4 линий
          break;
        case 'galaxy-hero':
          unlocked = state.score >= 10000;
          break;
        case 'speed-runner':
          unlocked = state.level >= 10;
          break;
        case 'hard-dropper':
          unlocked = state.totalHardDrops >= 50;
          break;
      }
      
      // Если достижение разблокировано, увеличиваем счетчик очков
      if (unlocked) {
        pointsEarned += achievement.points;
        console.log(`Achievement unlocked: ${achievement.name} (+${achievement.points} galaxy points)`);
        
        // Показываем уведомление в UI
        // TODO: Добавить красивое уведомление о получении достижения
      }
      
      // Возвращаем обновленное достижение
      return {
        ...achievement,
        unlocked: unlocked || achievement.unlocked
      };
    });
    
    // Если есть изменения в достижениях, обновляем состояние
    if (pointsEarned > 0) {
      // Обновляем локальное хранилище
      localStorage.setItem('tetris-achievements', JSON.stringify(updatedAchievements));
      localStorage.setItem('tetris-galaxy-points', (state.galaxyPoints + pointsEarned).toString());
      
      // Обновляем состояние игры
      return {
        achievements: updatedAchievements,
        galaxyPoints: state.galaxyPoints + pointsEarned
      };
    }
    
    return null;
  }, []);
  
  /**
   * Сохраняет статистику в localStorage
   */
  const saveStats = useCallback((state: GameState) => {
    const stats = {
      totalLinesCleared: state.totalLinesCleared,
      totalPiecesPlaced: state.totalPiecesPlaced,
      totalHardDrops: state.totalHardDrops
    };
    
    localStorage.setItem('tetris-stats', JSON.stringify(stats));
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
    
    // Проверяем достижения
    const achievementUpdates = checkAchievements(gameState);
    
    // Обновляем состояние игры
    setGameState(prev => {
      const updatedState = { 
        ...prev, 
        isGameOver: true,
        ...(achievementUpdates || {})
      };
      
      // Сохраняем статистику
      saveStats(updatedState);
      
      return updatedState;
    });
    
    setIsGameActive(false);
    
    // Play game over sound
    playSound('game-over');
  }, [gameState, playSound, checkAchievements, saveStats]);
  
  // Handle piece landing
  const handlePieceLanded = useCallback(() => {
    if (!currentPiece) return;
    
    // Merge current piece with the board
    const newBoard = mergeTetrominoWithBoard(gameBoard, currentPiece, currentPosition);
    
    // Check for line clears
    const { clearedBoard, linesCleared } = clearLines(newBoard);
    
    // Update the board
    setGameBoard(clearedBoard);
    
    // Обновляем статистику для достижений
    let tetrisAchievement = false;
    
    // Обновляем состояние игры
    setGameState(prev => {
      // Увеличиваем общее количество размещенных фигур
      const totalPiecesPlaced = prev.totalPiecesPlaced + 1;
      
      // Если линии очищены, обновляем очки и уровень
      if (linesCleared > 0) {
        let pointsScored = 0;
        
        // Система подсчета очков: больше очков за больше линий за раз
        switch (linesCleared) {
          case 1: pointsScored = 100 * prev.level; break;
          case 2: pointsScored = 300 * prev.level; break;
          case 3: pointsScored = 500 * prev.level; break;
          case 4: 
            pointsScored = 800 * prev.level; 
            // Это Тетрис! (4 линии за раз)
            // Проверяем достижение tetris-master
            tetrisAchievement = true;
            break;
        }
        
        // Обновляем очки, линии и уровень
        const newLines = prev.lines + linesCleared;
        const totalLinesCleared = prev.totalLinesCleared + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        
        // Проверяем достижения
        let updatedAchievements = [...prev.achievements];
        let galaxyPointsEarned = 0;
        
        // Проверяем достижение tetris-master, если это был Тетрис
        if (tetrisAchievement) {
          // Находим достижение в массиве
          const tetrisMasterIndex = updatedAchievements.findIndex(a => a.id === 'tetris-master');
          
          if (tetrisMasterIndex !== -1 && !updatedAchievements[tetrisMasterIndex].unlocked) {
            // Считаем предыдущее количество Тетрисов
            const tetrisCount = localStorage.getItem('tetris-count') ? 
                                parseInt(localStorage.getItem('tetris-count') || '0') : 0;
            
            // Увеличиваем счетчик Тетрисов
            const newTetrisCount = tetrisCount + 1;
            localStorage.setItem('tetris-count', newTetrisCount.toString());
            
            // Выводим информацию о текущем прогрессе достижения в консоль
            // Это помогает игроку отслеживать прогресс в получении достижения "Тетрис-мастер"
            console.log(`Тетрис! Счетчик Тетрисов: ${newTetrisCount}/5`);
            
            // Если это 5-й Тетрис, разблокируем достижение
            if (newTetrisCount >= 5) {
              updatedAchievements[tetrisMasterIndex].unlocked = true;
              galaxyPointsEarned += updatedAchievements[tetrisMasterIndex].points;
              
              console.log(`Achievement unlocked: ${updatedAchievements[tetrisMasterIndex].name} (+${updatedAchievements[tetrisMasterIndex].points} galaxy points)`);
              // Сохраняем обновленные достижения
              localStorage.setItem('tetris-achievements', JSON.stringify(updatedAchievements));
            }
          }
        }
        
        // Воспроизводим звук очистки
        playSound('clear');
        
        return {
          ...prev,
          score: prev.score + pointsScored,
          lines: newLines,
          level: newLevel,
          totalLinesCleared,
          totalPiecesPlaced,
          achievements: updatedAchievements,
          galaxyPoints: prev.galaxyPoints + galaxyPointsEarned
        };
      } else {
        // Если линии не очищены, обновляем только статистику
        return {
          ...prev,
          totalPiecesPlaced
        };
      }
    });
    
    // Получаем следующую фигуру
    const newPiece = nextPiece;
    if (!newPiece) {
      console.error("No next piece available!");
      return;
    }
    
    // Рассчитываем начальную позицию для новой фигуры
    const newX = Math.floor((BOARD_WIDTH - newPiece.shape[0].length) / 2);
    
    // Проверяем на конец игры (если новая фигура сразу сталкивается)
    if (checkCollision(clearedBoard, newPiece.shape, { x: newX, y: 0 })) {
      console.log("Game over - collision at start position");
      handleGameOver();
      return;
    }
    
    // Устанавливаем текущую фигуру на следующую
    setCurrentPiece(newPiece);
    setCurrentPosition({
      x: newX,
      y: 0
    });
    
    // Генерируем новую следующую фигуру
    setNextPiece(generateRandomTetromino());
    
    console.log("New piece:", newPiece.type, "at position:", newX, 0);
  }, [currentPiece, currentPosition, gameBoard, gameState, nextPiece, playSound, handleGameOver]);
  
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
  
  /**
   * Жесткий сброс фигуры (мгновенное падение)
   * 
   * Эта функция мгновенно перемещает текущую фигуру в самую нижнюю
   * возможную позицию на игровом поле и обрабатывает ее приземление.
   * За жесткий сброс начисляются дополнительные очки (2 очка за каждую пройденную клетку).
   */
  const hardDrop = useCallback(() => {
    if (!isGameActive || isPaused || !currentPiece) return;
    
    console.log("Hard drop initiated");
    
    // Копируем текущее состояние для манипуляций
    let newX = currentPosition.x;
    let newY = currentPosition.y;
    let dropDistance = 0;
    
    // Находим самую нижнюю возможную позицию для фигуры
    while (!checkCollision(gameBoard, currentPiece.shape, { x: newX, y: newY + 1 })) {
      newY++;
      dropDistance++;
    }
    
    console.log(`Drop distance: ${dropDistance}, new Y: ${newY}`);
    
    if (dropDistance === 0) {
      // Если нет возможности для падения, просто обрабатываем приземление
      handlePieceLanded();
      return;
    }
    
    // Обновляем позицию фигуры немедленно
    setCurrentPosition({ x: newX, y: newY });
    
    // Добавляем очки за жесткое падение и отслеживаем для достижений
    const newTotalHardDrops = gameState.totalHardDrops + 1;
    let updatedAchievements = [...gameState.achievements];
    let galaxyPointsEarned = 0;
    
    // Проверяем достижение hard-dropper
    if (newTotalHardDrops >= 50) {
      const hardDropperIndex = updatedAchievements.findIndex(a => a.id === 'hard-dropper');
      
      if (hardDropperIndex !== -1 && !updatedAchievements[hardDropperIndex].unlocked) {
        updatedAchievements[hardDropperIndex].unlocked = true;
        galaxyPointsEarned += updatedAchievements[hardDropperIndex].points;
        
        console.log(`Achievement unlocked: ${updatedAchievements[hardDropperIndex].name}`);
        localStorage.setItem('tetris-achievements', JSON.stringify(updatedAchievements));
      }
    }
    
    // Обновляем состояние игры с новыми очками
    setGameState(prev => ({
      ...prev,
      score: prev.score + dropDistance * 2,
      totalHardDrops: newTotalHardDrops,
      achievements: updatedAchievements,
      galaxyPoints: prev.galaxyPoints + galaxyPointsEarned
    }));
    
    // Воспроизводим звук падения
    playSound('drop');
    
    // Вызываем обработчик приземления фигуры сразу после перемещения
    // для немедленного слияния с полем
    handlePieceLanded();
    
  }, [gameBoard, currentPiece, currentPosition, isGameActive, isPaused, gameState, playSound, handlePieceLanded]);
  
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
    
    /**
     * Сбрасываем счетчик Тетрисов при запуске новой игры
     * 
     * Для удобства тестирования и улучшения игрового процесса сбрасываем счетчик
     * очистки 4 линий (Тетрисов) при каждом перезапуске игры.
     * Сброс происходит только если соответствующее достижение еще не разблокировано,
     * чтобы не мешать уже полученным достижениям.
     */
    const tetrisMasterIndex = gameState.achievements.findIndex(a => a.id === 'tetris-master');
    if (tetrisMasterIndex !== -1 && !gameState.achievements[tetrisMasterIndex].unlocked) {
      localStorage.setItem('tetris-count', '0');
      console.log('Счетчик Тетрисов сброшен.');
    }

  // Reset game state, but keep achievements and galaxy points
  setGameState(prev => ({
    ...prev,
    score: 0,
    level: 1,
    lines: 0,
    isGameOver: false,
    // Сохраняем галактические очки и достижения между играми
    galaxyPoints: prev.galaxyPoints,
    achievements: prev.achievements,
    totalLinesCleared: prev.totalLinesCleared,
    totalPiecesPlaced: prev.totalPiecesPlaced,
    totalHardDrops: prev.totalHardDrops
  }));
    
    // Set game status
    setIsGameActive(true);
    setIsPaused(false);
    
    console.log("Game initialized with first piece:", firstPiece.type, "at position:", startX, 0);
  }, [gameState]);
  
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
  
  // Регулярно проверяем достижения во время игры
  useEffect(() => {
    if (isGameActive && !isPaused) {
      // Проверяем достижения
      const achievementUpdates = checkAchievements(gameState);
      
      // Если есть изменения, обновляем состояние
      if (achievementUpdates) {
        setGameState(prev => ({
          ...prev,
          ...achievementUpdates
        }));
      }
    }
  }, [isGameActive, isPaused, gameState.score, gameState.level, gameState.totalLinesCleared, checkAchievements, gameState]);

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
