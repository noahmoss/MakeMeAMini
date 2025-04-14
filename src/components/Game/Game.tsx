// @format
import { useState, useRef, useEffect } from "react";
import Grid, { Cell, NumberedCell } from "../Grid";
import Header from "../Header";
import { stepCursor, numberCells, startOfAdjacentWord } from "../Grid/utils";

import styles from "./Game.module.css";

import {
  Clues,
  ClueBox,
  ClueDirection,
  extractClues,
  getActiveClue,
  clueStartLocations,
  ClueStarts,
  ClueList,
} from "../Clues";
import ActiveClue from "../ActiveClue";

export type CursorDirection = "row" | "col";

export type MovementDirection = "forwards" | "backwards";

export interface Cursor {
  row: number;
  col: number;
  direction: CursorDirection;
}

function initialCells(rows: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: rows }, () => ({
      filled: false,
      value: "",
      number: null,
    })),
  );
}

function initialClues(cells: NumberedCell[][]) {
  return extractClues(cells);
}

function Game() {
  const defaultRowCount = 5;
  const [cells, setCells] = useState<Cell[][]>(initialCells(defaultRowCount));
  const [cursor, setCursor] = useState<Cursor>({
    row: 0,
    col: 0,
    direction: "row",
  });
  const [symmetry, setSymmetry] = useState<boolean>(false);

  const numberedCells: NumberedCell[][] = numberCells(cells);
  const [clues, setClues] = useState<Clues>(initialClues(numberedCells));

  const clueStarts: ClueStarts = clueStartLocations(numberedCells);

  const setRowCount = (rowCount: number) => {
    setCells(initialCells(rowCount));
  };

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
    setCursor(stepCursor(numberedCells, cursor, clues, "backwards"));
  };

  const advanceCursor = () => {
    setCursor(stepCursor(numberedCells, cursor, clues, "forwards"));
  };

  const skipWord = (direction: MovementDirection) => {
    const newCursor = startOfAdjacentWord(
      numberedCells,
      cursor,
      clues,
      clueStarts,
      direction,
    );
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

    // Update clues with new numberings if needed
    const extractedClues = extractClues(numberCells(newCells));
    const mergeClues = (
      newClues: ClueList,
      existingClues: ClueList,
    ): ClueList => {
      return Object.fromEntries(
        Object.entries(newClues).map(([number, { value }]) => [
          number,
          { value: existingClues[number]?.value ?? value },
        ]),
      );
    };

    const newClues = {
      across: mergeClues(extractedClues.across, clues.across),
      down: mergeClues(extractedClues.down, clues.down),
    };

    setClues(newClues);
  };

  const setCurrentCellValue = (value: string) => {
    let newCells = [...cells];
    newCells[cursor.row][cursor.col].value = value;
    setCells(newCells);
  };

  const setActiveClue = (clueNumber: number, direction: ClueDirection) => {
    const activeClue = clues[direction][clueNumber];
    const { row, col } = clueStarts[direction][clueNumber];
    if (activeClue) {
      setCursor({
        direction: direction === "across" ? "row" : "col",
        row: row,
        col: col,
      });
    }
  };

  const updateClue = (
    clueNumber: number,
    direction: ClueDirection,
    clue: string,
  ) => {
    const updatedClues = JSON.parse(JSON.stringify(clues));
    updatedClues[direction][clueNumber].value = clue;
    setClues(updatedClues);
  };

  const settingsProps = {
    rowCount: cells.length,
    setRowCount,
    symmetry,
    setSymmetry,
  };

  const activeClue = getActiveClue(numberedCells, clues, cursor);

  const orthogonalClue = getActiveClue(numberedCells, clues, {
    ...cursor,
    direction: cursor.direction === "row" ? "col" : "row",
  });

  // CSS alone can't make the clues container match the height of the grid
  // because the grid's height is derived from its width via aspect-ratio. This
  // ResizeObserver ensures the clues container always matches the grid's
  // height.
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const cluesWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Only sync height on desktop screen widths
    const gridWrapperEl = gridWrapperRef?.current;
    const cluesWrapperEl = cluesWrapperRef?.current;
    if (!gridWrapperEl || !cluesWrapperEl) return;

    const observer = new ResizeObserver(([entry]) => {
      cluesWrapperEl.style.height = `${entry.contentRect.height}px`;
    });
    observer.observe(gridWrapperEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.gameWrapper}>
      <Header settingsProps={settingsProps} />
      <div className={styles.gridAndClues2}>
        <div className={styles.gridWrapper2} ref={gridWrapperRef}>
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
            useSymmetry={symmetry}
          />
        </div>
        <div className={styles.activeClueWrapper}>
          <ActiveClue skipWord={skipWord} clue={activeClue} />
        </div>
        <div className={styles.cluesWrapper2} ref={cluesWrapperRef}>
          <ClueBox
            clues={clues}
            activeClue={activeClue}
            orthogonalClue={orthogonalClue}
            setActiveClue={setActiveClue}
            updateClue={updateClue}
          />
        </div>
      </div>
    </div>
  );
}

export default Game;
