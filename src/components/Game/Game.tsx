// @format
import { useState } from "react";
import Grid, { Cell } from "../Grid";
import { stepCursor, numberCells, startOfAdjacentWord } from "../Grid/utils";

import styles from "./Game.module.css";
import { ClueBox, extractClues, getActiveClue } from "../Clues";

export type CursorDirection = "row" | "col";

export type MovementDirection = "forwards" | "backwards";

export interface Cursor {
  row: number;
  col: number;
  direction: CursorDirection;
}

//interface CrosswordData {
//  filledPositions: string;
//  width: number | null;
//  height: number | null;
//  clues: {
//    across: Array<[number, string]>;
//    down: Array<[number, string]>;
//  };
//}

type ActiveClueHeaderProps = {
  clueNumber: number;
  clueText: string;
  skipWord: (direction: MovementDirection) => void;
};

function ActiveClueBar({ clueNumber, clueText }: ActiveClueHeaderProps) {
  return (
    <div
      className={styles.activeClueHeader}
    >{`${clueNumber}. ${clueText}`}</div>
  );
}

function initialCells(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      filled: false,
      value: "",
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
  const numberedCells = numberCells(cells);
  const clues = extractClues(numberedCells);

  const [activeClue, activeClueNumber, activeClueDir] = getActiveClue(
    numberedCells,
    clues,
    cursor,
  );

  const updateCursorPosition = (row: number, col: number) => {
    if (!cells[row][col].filled) setCursor({ ...cursor, row: row, col: col });
  };

  const toggleCursorDirection = () => {
    setCursor({
      ...cursor,
      direction: cursor.direction === "row" ? "col" : "row",
    });
  };

  const reverseCursor = () => {
    setCursor(stepCursor(numberedCells, cursor, "backwards", clues));
  };

  const advanceCursor = () => {
    setCursor(stepCursor(numberedCells, cursor, "forwards", clues));
  };

  const skipWord = (direction: MovementDirection) => {
    setCursor(startOfAdjacentWord(numberedCells, cursor, direction, clues));
  };

  const toggleFilledCell = (row: number, col: number) => {
    let newCells = [...cells];
    newCells[row][col].filled = !cells[row][col].filled;
    newCells[row][col].value = "";
    setCells(newCells);

    // If we're filling in the cell of the current cursor, advance it to the next cell
    if (newCells[row][col].filled && cursor.row === row && cursor.col === col) {
      advanceCursor();
    }
  };

  const setCurrentCellValue = (value: string) => {
    let newCells = [...cells];
    newCells[cursor.row][cursor.col].value = value;
    setCells(newCells);
  };

  return (
    <div className={styles.gameWrapper}>
      <h1 className={styles.crosswordTitle}>Untitled Crossword</h1>
      <div className={styles.gridWrapper}>
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
      <ActiveClueBar
        skipWord={skipWord}
        clueNumber={activeClueNumber}
        clueText={activeClue.clue}
      />
      <div className={styles.cluesWrapper}>
        <ClueBox
          clues={clues}
          activeClueNumber={activeClueNumber}
          activeClueDir={activeClueDir}
        />
      </div>
    </div>
  );
}

export default Game;
