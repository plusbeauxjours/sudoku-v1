export type Board = number[][];

export const shuffle = <T,>(arr: T[]): T[] => {
  const res = arr.slice();
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
};

export const generateCompletedBoard = (): Board => {
  const base = 3;
  const side = base * base;

  const rows = shuffle([...Array(side).keys()]);
  const cols = shuffle([...Array(side).keys()]);
  const nums = shuffle([...Array(side).keys()].map((n) => n + 1));

  const board = Array.from({ length: side }, () => Array(side).fill(0));

  for (let r = 0; r < side; r++) {
    for (let c = 0; c < side; c++) {
      const value = nums[(base * (r % base) + Math.floor(r / base) + c) % side];
      board[r][c] = value;
    }
  }

  const shuffled = Array.from({ length: side }, (_, r) =>
    Array.from({ length: side }, (_, c) => board[rows[r]][cols[c]])
  );

  return shuffled;
};

export const generatePuzzle = (
  empties: number
): { puzzle: Board; solution: Board } => {
  const solution = generateCompletedBoard();
  const puzzle = solution.map((row) => row.slice());
  let removed = 0;
  while (removed < empties) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return { puzzle, solution };
};

export const isValidPlacement = (
  board: Board,
  row: number,
  col: number,
  num: number
): boolean => {
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === num) return false;
    if (i !== row && board[i][col] === num) return false;
    const boxRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
    const boxCol = Math.floor(col / 3) * 3 + (i % 3);
    if (boxRow !== row && boxCol !== col && board[boxRow][boxCol] === num)
      return false;
  }
  return true;
};

export const isSolved = (board: Board): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (!val || !isValidPlacement(board, r, c, val)) return false;
    }
  }
  return true;
};

export const isValidNumber = (board: Board, row: number, col: number, num: number): boolean => {
  const rowValid = !board[row].includes(num);
  const colValid = !board.some(r => r[col] === num);
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  const boxValid = !board
    .slice(startRow, startRow + 3)
    .some(r => r.slice(startCol, startCol + 3).includes(num));
  return rowValid && colValid && boxValid;
};

export const findEmpty = (board: Board): [number, number] | null => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) return [r, c];
    }
  }
  return null;
};

export const solveSudoku = (board: Board): Board | null => {
  const empty = findEmpty(board);
  if (!empty) return board;
  const [row, col] = empty;

  for (let num = 1; num <= 9; num++) {
    if (isValidNumber(board, row, col, num)) {
      board[row][col] = num;
      const solved = solveSudoku(board);
      if (solved) return solved;
      board[row][col] = 0;
    }
  }
  return null;
};
