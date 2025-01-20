import { Cursor } from "../Game";
import { NumberedCell } from "../Grid";
import { findWordBoundaries, isStartOfWord } from "../Grid/utils";

import { Textarea } from "@mantine/core";

import styles from "./Clues.module.css";

export type Clue = {
  value: string;
};

export type ClueList = {
  [key: string]: Clue;
};

export type Clues = {
  across: ClueList;
  down: ClueList;
};

type ClueStart = {
  row: number;
  col: number;
};

export type ClueStarts = {
  across: { [key: string]: ClueStart };
  down: { [key: string]: ClueStart };
};

export type ClueDirection = "across" | "down";

export function extractClues(cells: NumberedCell[][]): Clues {
  let clues: Clues = { down: {}, across: {} };
  cells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.number) {
        // Check for "across" clues
        if (
          isStartOfWord(cells, {
            row: rowIndex,
            col: colIndex,
            direction: "row",
          })
        ) {
          clues.across[cell.number] = { value: "" };
        }

        // Check for "down" clues
        if (
          isStartOfWord(cells, {
            row: rowIndex,
            col: colIndex,
            direction: "col",
          })
        ) {
          clues.down[cell.number] = { value: "" };
        }
      }
    });
  });
  return clues;
}

export function clueStartLocations(cells: NumberedCell[][]): ClueStarts {
  let clueStarts: ClueStarts = { down: {}, across: {} };
  cells.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.number) {
        // Check for "across" clues
        if (
          isStartOfWord(cells, {
            row: rowIndex,
            col: colIndex,
            direction: "row",
          })
        ) {
          clueStarts.across[cell.number] = {
            row: rowIndex,
            col: colIndex,
          };
        }

        // Check for "down" clues
        if (
          isStartOfWord(cells, {
            row: rowIndex,
            col: colIndex,
            direction: "col",
          })
        ) {
          clueStarts.down[cell.number] = {
            row: rowIndex,
            col: colIndex,
          };
        }
      }
    });
  });
  return clueStarts;
}

export function getActiveClue(
  cells: NumberedCell[][],
  clues: Clues,
  cursor: Cursor,
): [Clue, number, "across" | "down"] {
  const { startCursor } = findWordBoundaries(cells, cursor);

  const clueNumber = cells[startCursor.row][startCursor.col]?.number;
  if (!clueNumber) {
    throw new Error("findWordBoundaries did not return a valid word start!");
  }
  const clueDir = cursor.direction === "row" ? "across" : "down";

  return [clues[clueDir][clueNumber], clueNumber, clueDir];
}

type ClueListProps = {
  direction: ClueDirection;
  activeClueNumber: number;
  activeClueDir: ClueDirection;
  clueList: ClueList;
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
  updateClue: (
    clueNumber: number,
    direction: ClueDirection,
    clue: string,
  ) => void;
};

function ClueList({
  direction,
  activeClueNumber,
  activeClueDir,
  clueList,
  setActiveClue,
  updateClue,
}: ClueListProps) {
  const clueNumbers = Object.keys(clueList)
    .map(Number)
    .sort((a, b) => a - b);
  return (
    <ol className={styles.clueList}>
      {clueNumbers.map((clueNumber) => {
        const clue = clueList[clueNumber];
        const isActiveClue =
          direction === activeClueDir && clueNumber === activeClueNumber;
        return (
          <li
            className={`${styles.clueItem} ${isActiveClue ? styles.activeClueItem : undefined}`}
            key={clueNumber}
            onClick={() => setActiveClue(clueNumber, direction)}
          >
            <span className={`${styles.clueID}`}>{clueNumber}</span>
            <Textarea
              value={clue.value}
              onChange={(e) =>
                updateClue(clueNumber, direction, e.target.value)
              }
              onFocus={() => setActiveClue(clueNumber, direction)}
              autosize
              minRows={1}
              maxRows={3}
              styles={{
                input: {
                  transition: "unset",
                  height: "min-content",
                },
              }}
            />
          </li>
        );
      })}
    </ol>
  );
}

type CluesProps = {
  clues: Clues;
  activeClueNumber: number;
  activeClueDir: ClueDirection;
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
  updateClue: (
    clueNumber: number,
    direction: ClueDirection,
    clue: string,
  ) => void;
};

export function ClueBox({
  clues,
  activeClueNumber,
  activeClueDir,
  setActiveClue,
  updateClue,
}: CluesProps) {
  return (
    <div className={styles.cluesWrapper}>
      <div className={styles.cluesSection}>
        <h2 className={styles.cluesHeader}>Across</h2>
        <ClueList
          direction="across"
          activeClueNumber={activeClueNumber}
          activeClueDir={activeClueDir}
          clueList={clues?.across}
          setActiveClue={setActiveClue}
          updateClue={updateClue}
        />
      </div>
      <div className={styles.cluesSection}>
        <h2 className={styles.cluesHeader}>Down</h2>
        <ClueList
          direction="down"
          activeClueNumber={activeClueNumber}
          activeClueDir={activeClueDir}
          clueList={clues?.down}
          setActiveClue={setActiveClue}
          updateClue={updateClue}
        />
      </div>
    </div>
  );
}
