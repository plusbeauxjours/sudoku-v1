const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const charactersElement = document.getElementById('characters');
const checkButton = document.getElementById('check');
const timerElement = document.getElementById('time');
const numberPopup = document.getElementById('number-popup');

let timerStarted = false;
let startTime = 0;
let timerInterval = null;
let activeInput = null;

const animals = ['🐱','🐶','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯'];

// Create difficulty buttons with cute characters
animals.forEach((animal, index) => {
  const btn = document.createElement('button');
  btn.textContent = animal;
  btn.title = `난이도 ${index + 1}`;
  btn.addEventListener('click', () => startGame(index + 1));
  charactersElement.appendChild(btn);
});

let solution = [];
let puzzle = [];

function startGame(level) {
  const empties = 20 + level * 5; // number of cells to remove
  solution = generateBoard();
  puzzle = removeCells(solution, empties);
  renderBoard(puzzle);
  messageElement.textContent = '';
  hidePopup();
  timerStarted = false;
  clearInterval(timerInterval);
  timerElement.textContent = '0';
}

function generateBoard() {
  const base = 3;
  const side = base * base;

  const rows = shuffle([...Array(side).keys()]);
  const cols = shuffle([...Array(side).keys()]);
  const nums = shuffle([...Array(side).keys()].map(n => n + 1));

  const board = Array.from({ length: side }, () => Array(side).fill(0));

  for (let r = 0; r < side; r++) {
    for (let c = 0; c < side; c++) {
      const value = nums[(base * (r % base) + Math.floor(r / base) + c) % side];
      board[r][c] = value;
    }
  }

  // Shuffle rows and columns
  const shuffled = Array.from({ length: side }, (_, r) =>
    Array.from({ length: side }, (_, c) => board[rows[r]][cols[c]])
  );

  return shuffled;
}

function shuffle(arr) {
  const res = arr.slice();
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

function removeCells(board, count) {
  const puzzle = board.map(row => row.slice());
  let removed = 0;
  while (removed < count) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzle[r][c] !== null) {
      puzzle[r][c] = null;
      removed++;
    }
  }
  return puzzle;
}

function renderBoard(data) {
  boardElement.innerHTML = '';
  data.forEach((row, r) => {
    row.forEach((value, c) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (value !== null) {
        cell.textContent = value;
        cell.classList.add('prefilled');
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^1-9]/g, '');
          const val = parseInt(e.target.value);
          puzzle[r][c] = isNaN(val) ? null : val;
          if (!timerStarted) startTimer();
          if (isSolved(puzzle)) {
            messageElement.textContent = '완성! 축하합니다!';
            stopTimer();
          }
        });
        input.addEventListener('focus', () => {
          activeInput = input;
          showPopup(input, r, c);
        });
        input.addEventListener('blur', () => {
          setTimeout(hidePopup, 100);
        });
        cell.appendChild(input);
      }
      boardElement.appendChild(cell);
    });
  });
}

function checkBoard() {
  const inputs = boardElement.querySelectorAll('input');
  inputs.forEach(input => {
    const r = parseInt(input.dataset.row);
    const c = parseInt(input.dataset.col);
    const val = parseInt(input.value);
    puzzle[r][c] = isNaN(val) ? null : val;
  });

  if (isSolved(puzzle)) {
    messageElement.textContent = '완성! 축하합니다!';
    stopTimer();
  } else {
    messageElement.textContent = '아직 완성되지 않았어요.';
  }
}

function isSolved(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (!val || !isValid(board, r, c, val)) return false;
    }
  }
  return true;
}

function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === num) return false;
    if (i !== row && board[i][col] === num) return false;
    const boxRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
    const boxCol = Math.floor(col / 3) * 3 + (i % 3);
    if (boxRow !== row && boxCol !== col && board[boxRow][boxCol] === num) return false;
  }
  return true;
}

function startTimer() {
  timerStarted = true;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = String(secs);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerStarted = false;
}

function showPopup(input, r, c) {
  const allowed = [];
  for (let n = 1; n <= 9; n++) {
    if (isValid(puzzle, r, c, n)) allowed.push(n);
  }
  numberPopup.innerHTML = '';
  for (let num = 1; num <= 9; num++) {
    const btn = document.createElement('button');
    btn.textContent = num;
    if (!allowed.includes(num)) btn.disabled = true;
    btn.addEventListener('click', () => {
      input.value = String(num);
      input.dispatchEvent(new Event('input'));
      input.focus();
      hidePopup();
    });
    numberPopup.appendChild(btn);
  }
  const zeroBtn = document.createElement('button');
  zeroBtn.textContent = '0';
  zeroBtn.classList.add('zero');
  zeroBtn.addEventListener('click', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.focus();
    hidePopup();
  });
  numberPopup.appendChild(zeroBtn);
  const rect = input.getBoundingClientRect();
  const boardRect = boardElement.getBoundingClientRect();
  numberPopup.style.display = 'grid';
  let top = rect.bottom + window.scrollY;
  let left = rect.left + window.scrollX;
  const popupRect = numberPopup.getBoundingClientRect();
  const maxLeft = boardRect.right + window.scrollX - popupRect.width;
  const minLeft = boardRect.left + window.scrollX;
  if (left > maxLeft) left = Math.max(minLeft, maxLeft);
  if (left < minLeft) left = minLeft;
  const maxTop = boardRect.bottom + window.scrollY - popupRect.height;
  if (top > maxTop) top = rect.top + window.scrollY - popupRect.height;
  numberPopup.style.top = top + 'px';
  numberPopup.style.left = left + 'px';
  requestAnimationFrame(() => numberPopup.classList.add('show'));
}

function hidePopup() {
  numberPopup.classList.remove('show');
  numberPopup.style.display = 'none';
  numberPopup.innerHTML = '';
}

checkButton.addEventListener('click', checkBoard);
