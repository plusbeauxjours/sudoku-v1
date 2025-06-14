import { useEffect, useRef, useState } from "react";
import type { Board } from "../utils/sudoku";
import { generatePuzzle, isSolved, isValidPlacement } from "../utils/sudoku";

export default function SudokuBoard() {
  const [level, setLevel] = useState(1);

  const [puzzle, setPuzzle] = useState<Board | null>(null);
  const [message, setMessage] = useState("");
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [running, setRunning] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const activeInputRef = useRef<HTMLInputElement | null>(null);
  const [popup, setPopup] = useState<
    | { row: number; col: number; top: number; left: number; allowed: number[] }
    | null
  >(null);

  const startTimer = () => {
    if (timerRef.current) return;
    setRunning(true);
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
  };

  const formatTime = (secs: number) => {
    const h = String(Math.floor(secs / 3600)).padStart(2, "0");
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  };

  const startGame = (level: number) => {
    const empties = 20 + level * 5;
    const { puzzle } = generatePuzzle(empties);
    setPuzzle(puzzle);
    setMessage("");
    stopTimer();
    setTime(0);
  };

  const getBorderClasses = (r: number, c: number) => {
    const classes = ["border", "border-gray-300"];
    if (r % 3 === 0) classes.push("border-t-2");
    if ((r + 1) % 3 === 0) classes.push("border-b-2");
    if (c % 3 === 0) classes.push("border-l-2");
    if ((c + 1) % 3 === 0) classes.push("border-r-2");
    return classes.join(" ");
  };

  const updateCell = (row: number, col: number, value: string) => {
    if (!puzzle) return;
    const num = parseInt(value);
    const next = puzzle.map((r) => r.slice());
    next[row][col] = isNaN(num) ? 0 : num;
    setPuzzle(next);
    if (!running) startTimer();
    if (isSolved(next)) {
      setMessage("Puzzle solved! Congratulations!");
      stopTimer();
    }
  };

  const showPopup = (
    row: number,
    col: number,
    input: HTMLInputElement
  ) => {
    if (!puzzle || !boardRef.current) return;
    activeInputRef.current = input;
    const allowed: number[] = [];
    for (let n = 1; n <= 9; n++) {
      if (isValidPlacement(puzzle, row, col, n)) allowed.push(n);
    }
    const rect = input.getBoundingClientRect();
    const parentRect = boardRef.current.getBoundingClientRect();
    let top = rect.bottom - parentRect.top;
    let left = rect.left - parentRect.left;
    const popupWidth = 112;
    const popupHeight = 148;
    const maxLeft = parentRect.width - popupWidth;
    if (left > maxLeft) left = Math.max(0, maxLeft);
    if (left < 0) left = 0;
    const maxTop = parentRect.height - popupHeight;
    if (top > maxTop) top = rect.top - parentRect.top - popupHeight;
    if (top < 0) top = 0;
    setPopup({
      row,
      col,
      top,
      left,
      allowed,
    });
  };

  const hidePopup = () => setPopup(null);

  const selectNumber = (num: number) => {
    if (!popup) return;
    updateCell(popup.row, popup.col, num === 0 ? "" : String(num));
    activeInputRef.current?.focus();
    hidePopup();
  };

  const checkBoard = () => {
    if (!puzzle) return;
    if (isSolved(puzzle)) {
      setMessage("Puzzle solved! Congratulations!");
      stopTimer();
    } else setMessage("Not solved yet.");
  };

  useEffect(() => {
    startGame(level);
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 py-6 text-center">
      <h1 className="text-2xl font-bold">Cute Sudoku</h1>
      <p className="font-bold">Time: {formatTime(time)}</p>
      <div className="flex flex-col items-center">
        <label htmlFor="level">Difficulty: {level}</label>
        <input
          id="level"
          type="range"
          min="1"
          max="10"
          value={level}
          onChange={(e) => {
            const lvl = parseInt(e.target.value);
            setLevel(lvl);
            startGame(lvl);
          }}
        />
      </div>
      {puzzle && (
        <> 
          <div
            ref={boardRef}
            className="grid grid-cols-9 gap-0 mt-4 relative"
          >
            {puzzle.map((row, r) =>
              row.map((cell, c) =>
                cell !== 0 ? (
                  <div
                    key={`${r}-${c}`}
                    className={`w-8 h-8 flex items-center justify-center bg-gray-100 font-bold ${getBorderClasses(
                      r,
                      c
                    )}`}
                  >
                    {cell}
                  </div>
                ) : (
                  <input
                    key={`${r}-${c}`}
                    className={`w-8 h-8 text-center ${getBorderClasses(r, c)}`}
                    maxLength={1}
                    value={cell === 0 ? "" : cell}
                    onChange={(e) =>
                      updateCell(r, c, e.target.value.replace(/[^1-9]/g, ""))
                    }
                    onFocus={(e) => showPopup(r, c, e.currentTarget)}
                    onBlur={() => setTimeout(hidePopup, 100)}
                  />
                )
              )
            )}
            {popup && (
              <div
                className="absolute grid grid-cols-3 gap-1 p-1 bg-white border rounded shadow z-10"
                style={{ top: popup.top, left: popup.left }}
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className="w-8 h-8 text-sm rounded bg-green-600 text-white disabled:bg-gray-300"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectNumber(n)}
                    disabled={!popup.allowed.includes(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className="w-8 h-8 text-sm rounded bg-green-600 text-white col-span-3"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectNumber(0)}
                >
                  0
                </button>
              </div>
            )}
          </div>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            onClick={checkBoard}
          >
            Check Answer
          </button>
        </>
      )}
      <p className="font-bold h-5">{message}</p>
    </div>
  );
}
