import { useState } from "react";
import { Cursor } from "../Game";
import { Cell } from "../Grid";
import { findWordBoundaries, isStartOfWord } from "../Grid/utils";

import { Textarea } from '@mantine/core';

import styles from "./Clues.module.css";


export type Clue = {
  clue: string;
  rowStart: number;
  colStart: number;
};

export interface Clues {
  across: Clue[];
  down: Clue[];
}

export type ClueDirection = "across" | "down";

export function extractClues(cells: Cell[][]): Clues {
  let clues: Clues = { down: [], across: [] };
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
          clues.across[cell.number] = {
            clue: "This is a default across clue",
            rowStart: rowIndex,
            colStart: colIndex,
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
          clues.down[cell.number] = {
            clue: "This is a default down clue",
            rowStart: rowIndex,
            colStart: colIndex,
          };
        }
      }
    });
  });
  return clues;
}

export function getActiveClue(
  cells: Cell[][],
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
  clueList: Clue[];
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
  updateClue: (clueNumber: number, direction: ClueDirection, clue: string) => void;
};

function ClueList({
  direction,
  activeClueNumber,
  activeClueDir,
  clueList,
  setActiveClue,
  updateClue,
}: ClueListProps) {
  console.log({ clueList });
  return (
    <ol className={styles.clueList}>
      {clueList.map((clue, clueNumber) => {
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
              value={clue.clue}
              onChange={(e) => updateClue(clueNumber, direction, e.target.value)}
              variant="unstyled"
              autosize
              minRows={1}
              maxRows={3}
              styles={{
                input: {
                  transition: "unset",
                  height: "min-content",
                }
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
  updateClue: (clueNumber: number, direction: ClueDirection, clue: string) => void;
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
