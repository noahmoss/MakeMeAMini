import { useState } from "react";
import { Cursor } from "../Game";
import { Cell } from "../Grid";
import { findWordBoundaries, isStartOfWord } from "../Grid/utils";

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
  clueList: Clue[]
}

function ClueList({ clueList }: ClueListProps) {
  console.log(clueList);
  return (
    <ol className={styles.clueList}>
      {clueList.map((clue, clueNumber) => (
        < li className={styles.clueItem}>
          {clueNumber}{" "}{clue.clue}
        </li>
      ))
      }
    </ol >
  )
}

type CluesProps = {
  clues: Clues;
};

export function ClueBox({ clues }: CluesProps) {
  const [direction, setDirection] = useState("across");

  return (
    <div className={styles.cluesWrapper} >
      <h2 className={styles.cluesHeader}>Across</h2>
      <ClueList clueList={clues?.across} />
      <h2 className={styles.cluesHeader}>Down</h2>
      <ClueList clueList={clues?.down} />
    </div >
  )
}
