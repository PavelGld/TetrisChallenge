// Types
export interface Block {
  type: string; // I, J, L, O, S, T, Z
}

export interface Tetromino {
  type: string;
  shape: boolean[][];
}

export interface Position {
  x: number;
  y: number;
}

// Constants
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Tetromino definitions
export const TETROMINOES: Record<string, Tetromino> = {
  I: {
    type: 'I',
    shape: [
      [false, false, false, false],
      [true, true, true, true],
      [false, false, false, false],
      [false, false, false, false]
    ]
  },
  J: {
    type: 'J',
    shape: [
      [true, false, false],
      [true, true, true],
      [false, false, false]
    ]
  },
  L: {
    type: 'L',
    shape: [
      [false, false, true],
      [true, true, true],
      [false, false, false]
    ]
  },
  O: {
    type: 'O',
    shape: [
      [true, true],
      [true, true]
    ]
  },
  S: {
    type: 'S',
    shape: [
      [false, true, true],
      [true, true, false],
      [false, false, false]
    ]
  },
  T: {
    type: 'T',
    shape: [
      [false, true, false],
      [true, true, true],
      [false, false, false]
    ]
  },
  Z: {
    type: 'Z',
    shape: [
      [true, true, false],
      [false, true, true],
      [false, false, false]
    ]
  }
};

// Create empty game board
export function createEmptyBoard(): (Block | null)[][] {
  return Array.from({ length: BOARD_HEIGHT }, () => 
    Array(BOARD_WIDTH).fill(null)
  );
}

// Generate random tetromino
export function generateRandomTetromino(): Tetromino {
  const tetrominoTypes = Object.keys(TETROMINOES);
  const randomType = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  return { ...TETROMINOES[randomType] };
}

// Check if a piece collides with the board or boundaries
export function checkCollision(
  board: (Block | null)[][],
  shape: boolean[][],
  position: Position
): boolean {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = x + position.x;
        const boardY = y + position.y;
        
        // Check if the block is outside the board boundaries
        if (
          boardX < 0 || 
          boardX >= BOARD_WIDTH || 
          boardY < 0 || 
          boardY >= BOARD_HEIGHT
        ) {
          return true;
        }
        
        // Check if the block collides with a non-empty block on the board
        if (boardY >= 0 && board[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Merge tetromino with the board
export function mergeTetrominoWithBoard(
  board: (Block | null)[][],
  tetromino: Tetromino,
  position: Position
): (Block | null)[][] {
  const newBoard = JSON.parse(JSON.stringify(board)) as (Block | null)[][];
  
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x]) {
        const boardX = x + position.x;
        const boardY = y + position.y;
        
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = { type: tetromino.type };
        }
      }
    }
  }
  
  return newBoard;
}

// Clear completed lines
export function clearLines(
  board: (Block | null)[][]
): { clearedBoard: (Block | null)[][], linesCleared: number } {
  let linesCleared = 0;
  let newBoard = JSON.parse(JSON.stringify(board)) as (Block | null)[][];
  
  // Check each row from bottom to top
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    // If every cell in this row is filled (not null)
    if (newBoard[y].every(cell => cell !== null)) {
      linesCleared++;
      
      // Move all rows above this one down
      for (let rowToMove = y; rowToMove > 0; rowToMove--) {
        newBoard[rowToMove] = [...newBoard[rowToMove - 1]];
      }
      
      // Add empty row at the top
      newBoard[0] = Array(BOARD_WIDTH).fill(null);
      
      // Since we just moved all rows down, we need to check this row again
      y++;
    }
  }
  
  return { clearedBoard: newBoard, linesCleared };
}

// Rotate a matrix 90 degrees clockwise
export function rotateMatrix(matrix: boolean[][]): boolean[][] {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(false));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      result[j][n - 1 - i] = matrix[i][j];
    }
  }
  
  return result;
}
