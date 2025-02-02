// @format
import { useState } from "react";
import Grid, { Cell, NumberedCell } from "../Grid";
import { stepCursor, numberCells, startOfAdjacentWord } from "../Grid/utils";

import { Settings, Link, HelpCircle } from "react-feather";

import styles from "./Game.module.css";
import { TextInput } from "@mantine/core";
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
import Logo from "../Logo";
import ActiveClue from "../ActiveClue";

export type CursorDirection = "row" | "col";

export type MovementDirection = "forwards" | "backwards";

export interface Cursor {
  row: number;
  col: number;
  direction: CursorDirection;
}

function CrosswordTitle({ }) {
  return (
    <div className={styles.titleContainer}>
      <TextInput
        size="lg"
        placeholder="Untitled Crossword"
        variant="unstyled"
        styles={{
          input: {
            transition: "unset",
            fontWeight: 500,
            fontSize: "1.8rem",
            width: "100%",
          },
          wrapper: {
          }
        }}
      />
    </div>
  )
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

function initialClues(cells: NumberedCell[][]) {
  return extractClues(cells);
}

function Game() {
  const rows = 6;
  const cols = 6;

  const [title, setTitle] = useState<string>("Untitled Crossword");
  const [cells, setCells] = useState<Cell[][]>(initialCells(rows, cols));
  const [cursor, setCursor] = useState<Cursor>({
    row: 0,
    col: 0,
    direction: "row",
  });
  const numberedCells: NumberedCell[][] = numberCells(cells);
  const [clues, setClues] = useState<Clues>(initialClues(numberedCells));

  const clueStarts: ClueStarts = clueStartLocations(numberedCells);

  const [activeClue, activeClueNumber, activeClueDir] = getActiveClue(
    numberedCells,
    clues,
    cursor,
  );

  const [_, orthogonalClueNumber, orthogonalClueDir] = getActiveClue(
    numberedCells,
    clues,
    {
      ...cursor,
      direction: cursor.direction === "row" ? "col" : "row"
    }
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
    setCursor(
      stepCursor(numberedCells, cursor, clues, clueStarts, "backwards"),
    );
  };

  const advanceCursor = () => {
    setCursor(stepCursor(numberedCells, cursor, clues, clueStarts, "forwards"));
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
          { value: existingClues[number]?.value ?? value }
        ])
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

  return (
    <div className={styles.outerGameWrapper}>
      <div className={styles.gameWrapper}>
        <div className={styles.siteHeader} >
          <Logo />
          <div className={styles.iconGroup}>
            <Settings />
            <Link />
            <HelpCircle />
          </div>
        </div>
        <CrosswordTitle />
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
            <ActiveClue
              skipWord={skipWord}
              clueNumber={activeClueNumber}
              clueDir={activeClueDir}
              clueText={activeClue.value}
            />
          </div>
          <div className={styles.cluesWrapper}>
            <div className={styles.clueBoxSpacer}>{"spacer"}</div>
            <ClueBox
              clues={clues}
              activeClueNumber={activeClueNumber}
              activeClueDir={activeClueDir}
              orthogonalClueNumber={orthogonalClueNumber}
              orthogonalClueDir={orthogonalClueDir}
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
