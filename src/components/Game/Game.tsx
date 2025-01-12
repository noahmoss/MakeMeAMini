// @format
import { useState } from "react";
import Grid, { Cell } from "../Grid";

import styles from "./Game.module.css";

type Direction = "across" | "down";

interface Cursor {
  row: number;
  col: number;
  direction: Direction;
}

interface Clues {
  across: [number, string][];
  down: [number, string][];
}

interface CrosswordData {
  filledPositions: string;
  width: number | null;
  height: number | null;
  clues: {
    across: Array<[number, string]>;
    down: Array<[number, string]>;
  };
}
function ActiveClueHeader() {
  return (
    <div className={styles.activeClueHeader}>3. This is the active clue</div>
  );
}

function initialCells(rows: number, cols: number) {
  const cells: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      filled: false,
      value: "",
    })),
  );

  return cells;
}

function Game() {
  const rows = 5;
  const cols = 5;
  const [cells, setCells] = useState<Cell[][]>(initialCells(rows, cols));

  console.log(cells);
  return (
    <div className={styles.gameWrapper}>
      <ActiveClueHeader />
      <Grid cells={cells} />
    </div>
  );
}

export default Game;
