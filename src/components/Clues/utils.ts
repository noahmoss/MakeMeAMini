import { Cursor } from "../Game";
import { Cell as Cell } from "../Grid";
import { allFilled, findWordBoundaries, isStartOfWord } from "../Grid/utils";
import { Clues, ClueStarts, NumberedClue } from "./Clues";

export function extractClues(cells: Cell[][]): Clues {
  const clues: Clues = { down: {}, across: {} };
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
            value: "",
            direction: "across",
            number: cell.number,
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
            value: "",
            direction: "down",
            number: cell.number,
          };
        }
      }
    });
  });
  return clues;
}

export function clueStartLocations(cells: Cell[][]): ClueStarts {
  const clueStarts: ClueStarts = { down: {}, across: {} };
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
  cells: Cell[][],
  clues: Clues,
  cursor: Cursor,
): NumberedClue | undefined {
  if (allFilled(cells)) {
    return undefined;
  }

  const { startCursor } = findWordBoundaries(cells, cursor);

  const clueNumber = cells[startCursor.row][startCursor.col]?.number;
  if (!clueNumber) {
    return undefined;
  }
  const clueDir = cursor.direction === "row" ? "across" : "down";

  return {
    ...clues[clueDir][clueNumber],
    number: clueNumber,
    direction: clueDir,
  };
}
