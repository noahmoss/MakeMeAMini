import { Cell, NumberedCell } from "./Grid";
import { Cursor, CursorDirection, MovementDirection } from "../Game";
import { ClueDirection, Clues, ClueStarts } from "../Clues";

function rowCount(cells: Cell[][]) {
  return cells.length;
}

function colCount(cells: Cell[][]) {
  return cells[0].length;
}

export function turn(direction: CursorDirection): CursorDirection {
  return direction === "row" ? "col" : "row";
}

// Returns two cursors for the beginning and end cells of the current word
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

  let startCursor =
    direction === "row"
      ? { ...cursor, col: wordStart }
      : { ...cursor, row: wordStart };
  let endCursor =
    direction === "row"
      ? { ...cursor, col: wordEnd }
      : { ...cursor, row: wordEnd };

  return { startCursor, endCursor };
};

export const isStartOfAnyWord = (
  cells: readonly Cell[][],
  row: number,
  col: number,
) => {
  return (
    isStartOfWord(cells, { row, col, direction: "row" }) ||
    isStartOfWord(cells, { row, col, direction: "col" })
  );
};

export const isStartOfWord = (
  cells: readonly Cell[][],
  { row, col, direction }: Cursor,
) => {
  if (cells[row][col].filled) {
    return false;
  }

  if (direction === "row") {
    return col === 0 || cells[row][col - 1].filled;
  } else if (direction === "col") {
    return row === 0 || cells[row - 1][col].filled;
  }
};

export function numberCells(cells: readonly Cell[][]): NumberedCell[][] {
  let num = 1;
  return cells.map((rowArray, rowIndex) =>
    rowArray.map((cell, colIndex) => ({
      ...cell,
      number: isStartOfAnyWord(cells, rowIndex, colIndex) ? num++ : null,
    })),
  );
}

export function startOfAdjacentWord(
  cells: NumberedCell[][],
  cursor: Cursor,
  clues: Clues,
  clueStarts: ClueStarts,
  searchDir: MovementDirection,
): Cursor {
  const { startCursor } = findWordBoundaries(cells, cursor);

  const clueNumber = cells[startCursor.row][startCursor.col].number;

  if (!clueNumber) {
    throw new Error("findWordBoundaries did not return a valid word start!");
  }

  // Extract sorted lists of valid clue numbers
  const validAcrossNumbers = Object.keys(clues.across)
    .map(Number)
    .sort((a, b) => a - b);
  const validDownNumbers = Object.keys(clues.down)
    .map(Number)
    .sort((a, b) => a - b);

  // Determine the current direction's clue list
  const currentClueNumbers =
    cursor.direction === "row" ? validAcrossNumbers : validDownNumbers;
  const otherClueNumbers =
    cursor.direction === "row" ? validDownNumbers : validAcrossNumbers;

  const currentIndex = currentClueNumbers.indexOf(clueNumber);

  let nextClueNumber = clueNumber;
  let nextClueDir: ClueDirection =
    cursor.direction === "row" ? "across" : "down";
  if (searchDir === "forwards") {
    // Move forward in the current list
    if (currentIndex < currentClueNumbers.length - 1) {
      nextClueNumber = currentClueNumbers[currentIndex + 1];
    } else {
      // Wrap to the other direction and pick the first clue
      nextClueDir = nextClueDir === "across" ? "down" : "across";
      nextClueNumber = otherClueNumbers[0];
    }
  } else if (searchDir === "backwards") {
    // Move backward in the current list
    if (currentIndex > 0) {
      nextClueNumber = currentClueNumbers[currentIndex - 1];
    } else {
      // Wrap to the other direction and pick the last clue
      nextClueDir = nextClueDir === "across" ? "down" : "across";
      nextClueNumber = otherClueNumbers[otherClueNumbers.length - 1];
    }
  }

  const nextClueStart = clueStarts[nextClueDir][nextClueNumber];

  return {
    ...nextClueStart,
    direction: nextClueDir === "across" ? "row" : "col",
  };
}

export function stepCursor(
  cells: NumberedCell[][],
  cursor: Cursor,
  clues: Clues,
  clueStarts: ClueStarts,
  stepDirection: MovementDirection,
): Cursor {
  const { startCursor, endCursor } = findWordBoundaries(cells, cursor);
  const orthogonalDir = turn(cursor.direction);

  if (stepDirection === "forwards") {
    if (cursor[orthogonalDir] < endCursor[orthogonalDir]) {
      let steppedCursor = { ...cursor };
      steppedCursor[orthogonalDir] += 1;
      return steppedCursor;
    } else {
      return startOfAdjacentWord(
        cells,
        cursor,
        clues,
        clueStarts,
        stepDirection,
      );
    }
  } else if (stepDirection === "backwards") {
    if (cursor[orthogonalDir] > startCursor[orthogonalDir]) {
      let steppedCursor = { ...cursor };
      steppedCursor[orthogonalDir] -= 1;
      return steppedCursor;
    } else {
      const prevWordStart = startOfAdjacentWord(
        cells,
        cursor,
        clues,
        clueStarts,
        stepDirection,
      );
      const { endCursor } = findWordBoundaries(cells, prevWordStart);
      return endCursor;
    }
  }
  return cursor;
}
