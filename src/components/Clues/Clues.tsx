import { Cursor } from "../Game";
import { NumberedCell } from "../Grid";
import { allFilled, findWordBoundaries, isStartOfWord } from "../Grid/utils";

import { Textarea } from "@mantine/core";

import styles from "./Clues.module.css";
import { useEffect, useRef } from "react";

export type Clue = {
  value: string;
};

export type EnrichedClue = Clue & {
  number: number;
  direction: ClueDirection;
}

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
): EnrichedClue | undefined {
  if (allFilled(cells)) {
    return undefined;
  }

  const { startCursor } = findWordBoundaries(cells, cursor);

  const clueNumber = cells[startCursor.row][startCursor.col]?.number;
  if (!clueNumber) {
    throw new Error("findWordBoundaries did not return a valid word start!");
  }
  const clueDir = cursor.direction === "row" ? "across" : "down";

  return { ...clues[clueDir][clueNumber], number: clueNumber, direction: clueDir };
}

type ClueListProps = {
  direction: ClueDirection;
  activeClue?: EnrichedClue;
  orthogonalClue?: EnrichedClue;
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
  activeClue,
  orthogonalClue,
  clueList,
  setActiveClue,
  updateClue,
}: ClueListProps) {
  const clueNumbers = Object.keys(clueList)
    .map(Number)
    .sort((a, b) => a - b);

  // Scroll active & orthogonal clues into view whenever active clue changes
  const clueRefs = useRef(new Map<number, HTMLLIElement | null>());

  useEffect(() => {
    if (!activeClue || !orthogonalClue) return;
    const clueNumberToScroll =
      direction === activeClue?.direction ? activeClue.number : orthogonalClue.number;
    clueRefs.current?.get(clueNumberToScroll)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  });

  return (
    <ol className={styles.clueList}>
      {clueNumbers.map((clueNumber) => {
        const clue = clueList[clueNumber];
        const isActiveClue =
          direction === activeClue?.direction && clueNumber === activeClue?.number;
        const isOrthogonalClue =
          direction === orthogonalClue?.direction &&
          clueNumber === orthogonalClue?.number;

        return (
          <li
            key={clueNumber}
            className={styles.clueItemWrapper}
            ref={(el) => {
              if (el) {
                clueRefs.current.set(clueNumber, el);
              } else {
                clueRefs.current.delete(clueNumber);
              }
            }}
          >
            <div
              className={`${styles.clueItem} 
                        ${isActiveClue ? styles.activeClueItem : undefined}`}
              key={clueNumber}
              onClick={() => setActiveClue(clueNumber, direction)}
            >
              <span
                className={`${styles.clueID}
                              ${isOrthogonalClue ? styles.orthogonalClueID : undefined}`}
              >
                {clueNumber}
              </span>
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
                  root: {
                    width: "100%",
                  },
                  input: {
                    transition: "unset",
                    height: "min-content",
                  },
                  wrapper: {
                    paddingTop: "4px",
                    paddingBottom: "4px",
                  },
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type CluesProps = {
  clues: Clues;
  activeClue?: EnrichedClue;
  orthogonalClue?: EnrichedClue;
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
  updateClue: (
    clueNumber: number,
    direction: ClueDirection,
    clue: string,
  ) => void;
};

export function ClueBox({
  clues,
  activeClue,
  orthogonalClue,
  setActiveClue,
  updateClue,
}: CluesProps) {
  return (
    <div className={styles.cluesWrapper}>
      <div className={styles.cluesSection}>
        <h2 className={styles.cluesHeader}>Across</h2>
        <ClueList
          direction="across"
          activeClue={activeClue}
          orthogonalClue={orthogonalClue}
          clueList={clues?.across}
          setActiveClue={setActiveClue}
          updateClue={updateClue}
        />
      </div>
      <div className={styles.cluesSection}>
        <h2 className={styles.cluesHeader}>Down</h2>
        <ClueList
          direction="down"
          activeClue={activeClue}
          orthogonalClue={orthogonalClue}
          clueList={clues?.down}
          setActiveClue={setActiveClue}
          updateClue={updateClue}
        />
      </div>
    </div>
  );
}
