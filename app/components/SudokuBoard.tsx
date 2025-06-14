import { useEffect, useRef, useState } from "react";
import type { Board } from "../utils/sudoku";
import { generatePuzzle, isSolved, isValidPlacement } from "../utils/sudoku";

const animals = ["🐱","🐶","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯"];

export default function SudokuBoard() {
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

  const updateCell = (row: number, col: number, value: string) => {
    if (!puzzle) return;
    const num = parseInt(value);
    const next = puzzle.map((r) => r.slice());
    next[row][col] = isNaN(num) ? 0 : num;
    setPuzzle(next);
    if (!running) startTimer();
    if (isSolved(next)) {
      setMessage("완성! 축하합니다!");
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
      setMessage("완성! 축하합니다!");
      stopTimer();
    } else setMessage("아직 완성되지 않았어요.");
  };

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 py-6 text-center">
      <h1 className="text-2xl font-bold">귀여운 스도쿠</h1>
      <p className="font-bold">시간: {time}초</p>
      <div>
        <p>난이도를 선택하세요:</p>
        <div className="flex flex-wrap justify-center gap-1 mt-1">
          {animals.map((a, i) => (
            <button
              key={i}
              title={`난이도 ${i + 1}`}
              className="px-2 py-1 bg-green-600 text-white rounded"
              onClick={() => startGame(i + 1)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
      {puzzle && (
        <> 
          <div
            ref={boardRef}
            className="grid grid-cols-9 gap-1 mt-4 relative"
          >
            {puzzle.map((row, r) =>
              row.map((cell, c) =>
                cell !== 0 ? (
                  <div
                    key={`${r}-${c}`}
                    className="w-8 h-8 flex items-center justify-center border bg-gray-100 font-bold"
                  >
                    {cell}
                  </div>
                ) : (
                  <input
                    key={`${r}-${c}`}
                    className="w-8 h-8 text-center border"
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
            정답 확인
          </button>
        </>
      )}
      <p className="font-bold h-5">{message}</p>
    </div>
  );
}
