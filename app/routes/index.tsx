import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
import { solveSudoku } from "../utils/sudoku";

export const loader = async ({}: LoaderArgs) => {
  const puzzle = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9],
  ];
  const solved = solveSudoku(puzzle.map(row => [...row]));
  return json({ solved });
};

export default function Index() {
  const { solved } = useLoaderData<typeof loader>();
  if (!solved) return <div>Unable to solve puzzle</div>;
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="grid grid-cols-9 gap-1">
        {solved.map((row, rowIndex) =>
          row.map((num, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300"
              animate={{ scale: [0.5, 1], opacity: [0, 1] }}
              transition={{ duration: 0.3, delay: (rowIndex * 9 + colIndex) * 0.03 }}
            >
              {num}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
