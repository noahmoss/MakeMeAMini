import { Cell } from "./Grid";
import { Cursor } from "../Game";

function rowCount(grid: Cell[][]) {
  return grid.length;
}

function colCount(grid: Cell[][]) {
  return grid[0].length;
}

// Returns the row or column indices for the current word, based on the provided cursor position
export const findWordBoundaries = (grid: Cell[][], cursor: Cursor) => {
  const { row, col, direction } = cursor;

  let currentCellInWord = (index: number): Cell =>
    direction === "row" ? grid[row][index] : grid[index][col];
  const maxIndex =
    (direction === "row" ? colCount(grid) : rowCount(grid)) - 1;

  // Search backwards to find the start of the word
  let wordStart = direction === "row" ? col : row;
  let wordEnd = wordStart;
  while (wordStart >= 0 && !currentCellInWord(wordStart).filled) {
    wordStart -= 1;
  }
  wordStart += 1;

  // Search forwards to find the end of the word
  while (wordEnd <= maxIndex && !currentCellInWord(wordEnd).filled) {
    wordEnd += 1;
  }
  wordEnd -= 1;

  return { wordStart, wordEnd };
};

export const isStartOfWord = (
  cells: readonly Cell[][],
  rowIndex: number,
  colIndex: number,
) => {
  return (
    !cells[rowIndex][colIndex].filled &&
    (colIndex === 0 ||
      cells[rowIndex][colIndex - 1].filled ||
      rowIndex === 0 ||
      cells[rowIndex - 1][colIndex].filled)
  );
};

export function numberCells(cells: readonly Cell[][]) {
  let num = 1;
  return cells.map((rowArray, rowIndex) =>
    rowArray.map((cell, colIndex) => ({
      ...cell,
      number: isStartOfWord(cells, rowIndex, colIndex) ? num++ : null,
    })),
  );
}
