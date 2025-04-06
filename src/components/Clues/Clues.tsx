import { Cursor } from "../Game";
import { NumberedCell } from "../Grid";
import { allFilled, findWordBoundaries, isStartOfWord } from "../Grid/utils";

import { Tabs, Textarea } from "@mantine/core";

import styles from "./Clues.module.css";
import { useEffect, useRef, useState } from "react";

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

type ClueListBaseProps = {
  activeClue?: EnrichedClue;
  orthogonalClue?: EnrichedClue;
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
  updateClue: (
    clueNumber: number,
    direction: ClueDirection,
    clue: string,
  ) => void;
}

type ClueListProps = ClueListBaseProps & {
  direction: ClueDirection;
  clueList: ClueList;
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

type CluesProps = ClueListBaseProps & {
  clues: Clues;
};

export function ClueBox({
  clues,
  activeClue,
  ...rest
}: CluesProps) {
  const [activeTab, setActiveTab] = useState<string | null>(activeClue?.direction || "across");

  useEffect(() => {
    if (activeClue?.direction && activeClue.direction !== activeTab) {
      setActiveTab(activeClue.direction)
    }
  }, [activeClue])

  return (
    <>
      <div className={styles.smallScreenClues}>
        <Tabs value={activeTab} onChange={setActiveTab} color="var(--active-tab-header-color)">
          <Tabs.List grow>
            <Tabs.Tab value="across">
              <h2 className={styles.cluesHeader}>Across</h2>
            </Tabs.Tab>
            <Tabs.Tab value="down">
              <h2 className={styles.cluesHeader}>Down</h2>
            </Tabs.Tab>
          </Tabs.List>

          <div className={styles.cluesSection}>
            <Tabs.Panel value="across">
              <ClueList
                direction="across"
                clueList={clues?.across}
                activeClue={activeClue}
                {...rest}
              />
            </Tabs.Panel>

            <Tabs.Panel value="down">
              <ClueList
                direction="down"
                clueList={clues?.down}
                activeClue={activeClue}
                {...rest}
              />
            </Tabs.Panel>
          </div>
        </Tabs>
      </div>

      <div className={styles.largeScreenClues}>
        <div className={styles.cluesSection}>
          <h2 className={styles.largeScreenCluesHeader}
            style={{ borderBottomColor: activeClue?.direction === "across" ? "var(--active-tab-header-color)" : "var(--inactive-tab-header-color)" }}
          >Across</h2>
          <ClueList
            direction="across"
            clueList={clues?.across}
            activeClue={activeClue}
            {...rest}
          />
        </div>
        <div className={styles.cluesSection}>
          <h2 className={styles.largeScreenCluesHeader}
            style={{ borderBottomColor: activeClue?.direction === "down" ? "var(--active-tab-header-color)" : "var(--inactive-tab-header-color)" }}
          >Down</h2>
          <ClueList
            direction="down"
            clueList={clues?.down}
            activeClue={activeClue}
            {...rest}
          />
        </div>
      </div>
    </>
  );
}
