// @format
import { useState } from "react";
import Grid, { Cell } from "../Grid";
import {
  isStartOfWord,
  moveCursor,
  numberCells,
  startOfNextWord,
} from "../Grid/utils";

import styles from "./Game.module.css";

type CursorDirection = "row" | "col";

export type Direction = "forwards" | "backwards";

export interface Cursor {
  row: number;
  col: number;
  direction: CursorDirection;
}

type Clue = {
  clue: string;
  rowStart: number;
  colStart: number;
}

export interface Clues {
  across: Clue[];
  down: Clue[];
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
    setCursor({ ...cursor, row: row, col: col });
  };

  const toggleCursorDirection = () => {
    setCursor({
      ...cursor,
      direction: cursor.direction === "row" ? "col" : "row",
    });
  };

  const reverseCursor = () => {
    setCursor(moveCursor(cells, cursor, "backwards"));
  }

  const advanceCursor = () => {
    setCursor(moveCursor(cells, cursor, "forwards"));
  };

  const skipWord = (direction: Direction) => {
    setCursor(startOfNextWord(cells, cursor, direction));
  }

  const toggleFilledCell = (row: number, col: number) => {
    let newCells = [...cells];
    newCells[row][col].filled = !cells[row][col].filled;
    setCells(newCells);
  };

  const setCurrentCellValue = (value: string) => {
    let newCells = [...cells];
    newCells[cursor.row][cursor.col].value = value;
    setCells(newCells);
  };
  const numberedCells = numberCells(cells);

  let clues: Clues = { down: [], across: [] };
  numberedCells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.number) {
        // Check for "across" clues
        if (
          isStartOfWord(cells, { row: rowIndex, col: colIndex, direction: "row" })
        ) {
          clues.across[cell.number] = {
            clue: "col",
            rowStart: rowIndex,
            colStart: colIndex,
          };
        }

        // Check for "down" clues
        if (
          isStartOfWord(cells, { row: rowIndex, col: colIndex, direction: "col" })
        ) {
          clues.down[cell.number] = {
            clue: "",
            rowStart: rowIndex,
            colStart: colIndex,
          };
        }
      }
    });
  });

  console.log(clues);

  return (
    <div className={styles.gameWrapper}>
      <ActiveClueHeader />
      <Grid
        cells={numberedCells}
        cursor={cursor}
        updateCursorPosition={updateCursorPosition}
        toggleCursorDirection={toggleCursorDirection}
        toggleFilledCell={toggleFilledCell}
        setCurrentCellValue={setCurrentCellValue}
        advanceCursor={advanceCursor}
        reverseCursor={reverseCursor}
        skipWord={skipWord}
      />
    </div>
  );
}

export default Game;
