import { Cell } from "./Grid";
import { Cursor } from "../Game";

function rowCount(cells: Cell[][]) {
  return cells.length;
}

function colCount(cells: Cell[][]) {
  return cells[0].length;
}

// Returns the row or column indices for the current word, based on the provided cursor position
export const findWordBoundaries = (cells: Cell[][], cursor: Cursor) => {
  const { row, col, direction } = cursor;

  let currentCellInWord = (index: number): Cell =>
    direction === "row" ? cells[row][index] : cells[index][col];
  const maxIndex =
    (direction === "row" ? colCount(cells) : rowCount(cells)) - 1;

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

// Moves the cursor to the next or previous non-black square, wrapping if necessary.
export function moveCursor(
  cells: Cell[][],
  { row, col, direction }: Cursor,
  searchDir: "forwards" | "backwards"
): Cursor {
  const numRows = cells.length;
  const numCols = cells[0].length;
  const isForwards = searchDir === "forwards";
  let startRow = row;
  let startCol = col;

  const getNextPosition = (currentRow: number, currentCol: number) => {
    if (direction === "row") {
      const nextCol = (currentCol + (isForwards ? 1 : -1) + numCols) % numCols;
      const nextRow =
        nextCol === (isForwards ? 0 : numCols - 1)
          ? (currentRow + (isForwards ? 1 : -1) + numRows) % numRows
          : currentRow;
      return { nextRow, nextCol };
    } else {
      const nextRow = (currentRow + (isForwards ? 1 : -1) + numRows) % numRows;
      const nextCol =
        nextRow === (isForwards ? 0 : numRows - 1)
          ? (currentCol + (isForwards ? 1 : -1) + numCols) % numCols
          : currentCol;
      return { nextRow, nextCol };
    }
  };

  while (true) {
    const { nextRow, nextCol } = getNextPosition(startRow, startCol);
    startRow = nextRow;
    startCol = nextCol;

    if (!cells[startRow][startCol].filled) {
      return { row: startRow, col: startCol, direction };
    }

    if (startRow === row && startCol === col) {
      // We've returned to the starting position
      return { row, col, direction };
    }
  }
}

export function startOfNextWord(
  cells: Cell[][],
  cursor: Cursor,
  searchDir: 'forwards' | 'backwards'
): Cursor {
  const { wordStart, wordEnd } = findWordBoundaries(cells, cursor);

  let newCursor = cursor;
  if (searchDir === 'forwards') {
    const wordEndCursor =
      cursor.direction === 'row' ?
        { ...cursor, col: wordEnd } :
        { ...cursor, row: wordEnd };
    newCursor = moveCursor(cells, wordEndCursor, 'forwards');
  } else if (searchDir === 'backwards') {
    const wordStartCursor =
      cursor.direction === 'row' ?
        { ...cursor, col: wordStart } :
        { ...cursor, row: wordStart };
    newCursor = moveCursor(cells, wordStartCursor, 'forwards');
  }
  return newCursor;
}
