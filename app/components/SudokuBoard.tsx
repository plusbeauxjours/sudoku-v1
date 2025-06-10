import { useEffect, useRef, useState } from "react";
import type { Board } from "../utils/sudoku";
import { generatePuzzle, isSolved } from "../utils/sudoku";

const animals = ["🐱","🐶","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯"];

export default function SudokuBoard() {
  const [puzzle, setPuzzle] = useState<Board | null>(null);
  const [message, setMessage] = useState("");
  const [time, setTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [running, setRunning] = useState(false);

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
          <div className="grid grid-cols-9 gap-1 mt-4">
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
                  />
                )
              )
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
