// @format
import { useState, useRef, useEffect } from "react";
import Grid, { Cell, SolvingCell } from "../Grid";
import Header from "../Header";
import {
  stepCursor,
  startOfAdjacentWord,
  isCurrentCell,
  isCurrentWord,
} from "../Grid/utils";

import styles from "./Game.module.css";

import { Clues, ClueBox, ClueDirection, ClueStarts, ClueList } from "../Clues";
import ActiveClue from "../ActiveClue";
import Controls, { CheckOption, RevealOption } from "../Controls";
import {
  clueStartLocations,
  extractClues,
  getActiveClue,
} from "../Clues/utils";
import { Keyboard } from "../Keyboard";
import {
  incorrectValue,
  initialCells,
  initialSolvingCells,
  numberCells,
} from "./utils";
import { deserializeCrossword } from "../SharingModal/utils";

const DEFAULT_ROW_COUNT = 5;

export type CursorDirection = "row" | "col";

export type MovementDirection = "forwards" | "backwards";

export type Mode = "solving" | "editing";

export interface Cursor {
  row: number;
  col: number;
  direction: CursorDirection;
}

function Game() {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const cluesWrapperRef = useRef<HTMLDivElement>(null);

  // Cursor
  const [cursor, setCursor] = useState<Cursor>({
    row: 0,
    col: 0,
    direction: "row",
  });

  // Puzzle state
  const [cells, setCells] = useState<Cell[][]>(initialCells(DEFAULT_ROW_COUNT));
  const numberedCells: Cell[][] = numberCells(cells);
  const [clues, setClues] = useState<Clues>(extractClues(numberedCells));
  const clueStarts: ClueStarts = clueStartLocations(numberedCells);

  // Settings
  const [symmetry, setSymmetry] = useState<boolean>(false);

  // Click to fill = true enables editing filled squares via mobile keyboard
  const [clickToFill, setClickToFill] = useState<boolean>(false);

  const params = new URLSearchParams(window.location.search);
  const encodedData = params.get("puz");

  // Solving mode state
  const [mode, setMode] = useState<Mode>(encodedData ? "solving" : "editing");
  const [seconds, setSeconds] = useState(0);
  const [solvingCells, setSolvingCells] = useState<SolvingCell[][]>(
    initialSolvingCells(DEFAULT_ROW_COUNT),
  );
  const [autocheck, setAutocheck] = useState<boolean>(false);

  useEffect(() => {
    if (encodedData) {
      const { cells, clues } = deserializeCrossword(encodedData);
      setCells(cells);
      setClues(clues);
    }
  }, [encodedData]);

  const setModeAndRefocus = (newMode: Mode) => {
    setMode(newMode);
    hiddenInputRef.current?.focus();
    if (newMode === "solving") {
      setSolvingCells(initialSolvingCells(cells.length));
      setAutocheck(false);
    }
  };

  const setRowCount = (rowCount: number) => {
    // When changing row count, do a hard reset of grid, clues, and cursor
    const newCells = initialCells(rowCount);
    setCells(newCells);
    setSolvingCells(initialSolvingCells(rowCount));
    const newClues = extractClues(numberCells(newCells));
    setClues(newClues);
    setCursor({ row: 0, col: 0, direction: "row" });
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
    const newCells = [...cells];
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
      dir: ClueDirection,
      newClues: ClueList,
      existingClues: ClueList,
    ): ClueList => {
      return Object.fromEntries(
        Object.entries(newClues).map(([number, { value }]) => [
          number,
          {
            value: existingClues[number]?.value ?? value,
            number: Number(number),
            direction: dir,
          },
        ]),
      );
    };

    const newClues = {
      across: mergeClues("across", extractedClues.across, clues.across),
      down: mergeClues("down", extractedClues.down, clues.down),
    };

    setClues(newClues);
  };

  // Maybe this doesn't need to be polymorphic for editing vs solving cells
  const setCurrentCellValue = (value: string) => {
    const newCells = [...(mode === "editing" ? cells : solvingCells)];
    newCells[cursor.row][cursor.col].value = value;

    if (mode === "solving") {
      const solvingCells = newCells as SolvingCell[][];
      solvingCells[cursor.row][cursor.col].incorrect = false;
      setSolvingCells(solvingCells);
    } else if (mode === "editing") {
      setCells(newCells);
    }
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

    // If we're solving the puzzle, always direct focus back to the hidden input for the grid
    if (mode === "solving") {
      hiddenInputRef.current?.focus();
    }
  };

  const updateClue = (
    clueNumber: number,
    direction: ClueDirection,
    clue: string,
  ) => {
    const newClues = {
      ...clues,
      [direction]: {
        ...clues[direction],
        [clueNumber]: {
          ...clues[direction][clueNumber],
          value: clue,
        },
      },
    };

    setClues(newClues);
  };

  const clearSolvingGrid = () => {
    setSolvingCells(initialSolvingCells(solvingCells.length));
  };

  const clearIncorrect = () => {
    const newSolvingCells = solvingCells.map((row, rowIndex) => {
      return row.map((solvingCell, colIndex) => {
        const isIncorrect = incorrectValue(
          cells[rowIndex][colIndex],
          solvingCell,
        );
        return {
          ...solvingCell,
          value: isIncorrect ? "" : solvingCell.value,
          incorrect: false,
        };
      });
    });
    setSolvingCells(newSolvingCells);
  };

  const check = (checkMode: CheckOption | null) => {
    if (!checkMode) {
      setAutocheck(false);
      return;
    }

    if (checkMode === "Auto") setAutocheck(true);
    const checkedCells = solvingCells.map((row, rowIndex) => {
      return row.map((solvingCell, colIndex) => {
        const currentCell = isCurrentCell(rowIndex, colIndex, cursor);
        const currentWord = isCurrentWord(
          solvingCells,
          rowIndex,
          colIndex,
          cursor,
        );

        const shouldCheck =
          checkMode === "Auto" ||
          checkMode === "Puzzle" ||
          (currentCell && checkMode === "Square") ||
          (currentWord && checkMode === "Word");

        if (shouldCheck) {
          return {
            ...solvingCell,
            incorrect: incorrectValue(cells[rowIndex][colIndex], solvingCell),
          };
        }
        return solvingCell;
      });
    });
    setSolvingCells(checkedCells);
  };

  const reveal = (revealMode: RevealOption) => {
    const revealedCells = solvingCells.map((row, rowIndex) => {
      return row.map((solvingCell, colIndex) => {
        const currentCell = isCurrentCell(rowIndex, colIndex, cursor);
        const currentWord = isCurrentWord(
          solvingCells,
          rowIndex,
          colIndex,
          cursor,
        );

        const shouldReveal =
          revealMode === "Puzzle" ||
          (currentCell && revealMode === "Square") ||
          (currentWord && revealMode === "Word");

        if (shouldReveal) {
          return {
            ...solvingCell,
            value: cells[rowIndex][colIndex].value,
          };
        }
        return solvingCell;
      });
    });
    setSolvingCells(revealedCells);
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
      <Header
        settingsProps={settingsProps}
        mode={mode}
        setMode={setModeAndRefocus}
        seconds={seconds}
        setSeconds={setSeconds}
        cells={cells}
        clues={clues}
      />
      <div className={styles.gridAndClues}>
        <div className={styles.controlsWrapper}>
          <Controls
            mode={mode}
            clearPuzzle={clearSolvingGrid}
            clearTimer={() => setSeconds(0)}
            clearIncorrect={clearIncorrect}
            autocheck={autocheck}
            check={check}
            reveal={reveal}
          />
        </div>
        <div className={styles.activeClueWrapper}>
          <ActiveClue
            skipWord={skipWord}
            clue={activeClue}
            updateClue={updateClue}
            mode={mode}
          />
        </div>
        <div className={styles.gridWrapper} ref={gridWrapperRef}>
          <Grid
            mode={mode}
            cells={numberedCells}
            solvingCells={solvingCells}
            cursor={cursor}
            updateCursorPosition={updateCursorPosition}
            toggleCursorDirection={toggleCursorDirection}
            toggleFilledCell={toggleFilledCell}
            clickToFill={clickToFill}
            setCurrentCellValue={setCurrentCellValue}
            advanceCursor={advanceCursor}
            reverseCursor={reverseCursor}
            skipWord={skipWord}
            autocheck={autocheck}
            useSymmetry={symmetry}
            hiddenInputRef={hiddenInputRef}
          />
        </div>
        <div className={styles.cluesWrapper} ref={cluesWrapperRef}>
          <ClueBox
            mode={mode}
            clues={clues}
            activeClue={activeClue}
            orthogonalClue={orthogonalClue}
            setActiveClue={setActiveClue}
            updateClue={updateClue}
          />
        </div>
        <div className={styles.mobileKeyboard}>
          <Keyboard
            mode={mode}
            setCurrentCellValue={setCurrentCellValue}
            advanceCursor={advanceCursor}
            reverseCursor={reverseCursor}
            clickToFill={clickToFill}
            setClickToFill={setClickToFill}
          />
        </div>
      </div>
    </div>
  );
}

export default Game;
