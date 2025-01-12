// @format
import { useState } from "react";
import Grid, { Cell } from "../Grid";
import { numberCells } from "../Grid/utils";

import styles from "./Game.module.css";

type Direction = "row" | "col";

export interface Cursor {
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

function initialCells(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      filled: false,
      value: "A",
      number: null,
    })),
  );
}

function Game() {
  const rows = 5;
  const cols = 5;
  const [cells, setCells] = useState<Cell[][]>(initialCells(rows, cols));
  const [cursor, setCursor] = useState<Cursor>({
    row: 0,
    col: 0,
    direction: "row",
  });

  const updateCursorPosition = (row: number, col: number) => {
    setCursor({ ...cursor, row: row, col: col })
  }

  const toggleCursorDirection = () => {
    setCursor({ ...cursor, direction: cursor.direction === "row" ? "col" : "row" })
  }

  const toggleFilledCell = (row: number, col: number) => {
    let newCells = [...cells];
    newCells[row][col].filled = !cells[row][col].filled;
    setCells(newCells);
  }

  const numberedCells = numberCells(cells);

  return (
    <div className={styles.gameWrapper}>
      <ActiveClueHeader />
      <Grid cells={numberedCells} cursor={cursor}
        updateCursorPosition={updateCursorPosition}
        toggleCursorDirection={toggleCursorDirection}
        toggleFilledCell={toggleFilledCell}
      />
    </div>
  );
}

export default Game;
