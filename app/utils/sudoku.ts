export type Board = number[][];

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
