// @format
import { useState } from "react";
import Grid, { Cell } from "../Grid";
import { stepCursor, numberCells, startOfAdjacentWord } from "../Grid/utils";

import styles from "./Game.module.css";
import {
  Clue,
  Clues,
  ClueBox,
  ClueDirection,
  extractClues,
  getActiveClue,
} from "../Clues";

export type CursorDirection = "row" | "col";

export type MovementDirection = "forwards" | "backwards";

export interface Cursor {
  row: number;
  col: number;
  direction: CursorDirection;
}

type ActiveClueHeaderProps = {
  clueNumber: number;
  clueDir: ClueDirection,
  clueText: string;
  skipWord: (direction: MovementDirection) => void;
};

function ActiveClueHeader({ clueNumber, clueDir, clueText }: ActiveClueHeaderProps) {
  return (
    <div
      className={styles.activeClueHeader}
    >
      <div className={styles.activeClueLabel}>
        {`${clueNumber}${clueDir.charAt(0).toUpperCase()}`}
      </div>
      <div>
        {clueText}
      </div>
    </div>
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

function initialClues(cells: Cell[][]) {
  return extractClues(cells);
}

function Game() {
  const rows = 6;
  const cols = 6;

  const [cells, setCells] = useState<Cell[][]>(initialCells(rows, cols));
  const [cursor, setCursor] = useState<Cursor>({
    row: 0,
    col: 0,
    direction: "row",
  });
  const numberedCells = numberCells(cells);
  const [clues, setClues] = useState<Clues>(initialClues(numberedCells));

  const [activeClue, activeClueNumber, activeClueDir] = getActiveClue(
    numberedCells,
    clues,
    cursor,
  );

  const updateCursorPosition = (row: number, col: number) => {
    if (!cells[row][col].filled) {
      setCursor({ ...cursor, row: row, col: col });
    }
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
    const newCursor = startOfAdjacentWord(numberedCells, cursor, clues, direction);
    setCursor(newCursor);
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

  const setActiveClue = (clueNumber: number, direction: ClueDirection) => {
    const activeClue = clues[direction][clueNumber];
    if (activeClue) {
      setCursor({
        direction: direction === "across" ? "row" : "col",
        row: activeClue.rowStart,
        col: activeClue.colStart,
      });
    }
  };

  const updateClue = (
    clueNumber: number,
    direction: ClueDirection,
    clue: string,
  ) => {
    const updatedClues = JSON.parse(JSON.stringify(clues));
    updatedClues[direction][clueNumber].clue = clue;
    setClues(updatedClues);
  };

  return (
    <div className={styles.outerGameWrapper}>
      <div className={styles.gameWrapper}>
        <div>
          <h1 className={styles.crosswordTitle}>Untitled Crossword</h1>
        </div>
        <div className={styles.gridAndClues}>
          <div className={styles.gridAndActiveClue}>
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
            <ActiveClueHeader
              skipWord={skipWord}
              clueNumber={activeClueNumber}
              clueDir={activeClueDir}
              clueText={activeClue.clue}
            />
          </div>
          <div className={styles.cluesWrapper}>
            <div className={styles.clueBoxSpacer}>{"spacer"}</div>
            <ClueBox
              clues={clues}
              activeClueNumber={activeClueNumber}
              activeClueDir={activeClueDir}
              setActiveClue={setActiveClue}
              updateClue={updateClue}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
