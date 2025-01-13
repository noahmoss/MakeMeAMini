import { Cell } from "./Grid";
import { Clues, Cursor, CursorDirection, Direction } from "../Game";

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

  let startCursor = direction === "row" ?
    { ...cursor, col: wordStart } :
    { ...cursor, row: wordStart };
  let endCursor = direction === "row" ?
    { ...cursor, col: wordEnd } :
    { ...cursor, row: wordEnd };

  return { startCursor, endCursor };
};

export const isStartOfAnyWord = (
  cells: readonly Cell[][],
  row: number,
  col: number,
) => {
  return isStartOfWord(cells, { row, col, direction: "row" })
    || isStartOfWord(cells, { row, col, direction: "col" })
}

export const isStartOfWord = (
  cells: readonly Cell[][],
  { row, col, direction }: Cursor,
) => {
  if (cells[row][col].filled) {
    return false;
  }

  if (direction === "row") {
    return (
      col === 0 ||
      cells[row][col - 1].filled
    )
  } else if (direction === "col") {
    return (
      row === 0 ||
      cells[row - 1][col].filled
    )
  }
};

export function numberCells(cells: readonly Cell[][]) {
  let num = 1;
  return cells.map((rowArray, rowIndex) =>
    rowArray.map((cell, colIndex) => ({
      ...cell,
      number: isStartOfAnyWord(cells, rowIndex, colIndex) ? num++ : null,
    })),
  );
}

// Moves the cursor to the next or previous non-black square, wrapping if necessary.
export function moveCursor(
  cells: Cell[][],
  cursor: Cursor,
  searchDir: Direction,
): Cursor {
  const numRows = cells.length;
  const numCols = cells[0].length;
  const isForwards = searchDir === "forwards";

  const getNextPosition = ({ row, col, direction }: Cursor): Cursor => {
    if (direction === "row") {
      const nextCol = (col + (isForwards ? 1 : -1) + numCols) % numCols;
      const nextRow =
        nextCol === (isForwards ? 0 : numCols - 1)
          ? (row + (isForwards ? 1 : -1) + numRows) % numRows
          : row;

      return { row: nextRow, col: nextCol, direction };
    } else {
      const nextRow = (row + (isForwards ? 1 : -1) + numRows) % numRows;
      const nextCol =
        nextRow === (isForwards ? 0 : numRows - 1)
          ? (col + (isForwards ? 1 : -1) + numCols) % numCols
          : col;

      return { row: nextRow, col: nextCol, direction };
    }
  };

  const { row, col, direction } = cursor;
  let currRow = row;
  let currCol = col;
  let wrapped = false;

  while (true) {
    const { row: nextRow, col: nextCol } = getNextPosition({
      row: currRow,
      col: currCol,
      direction,
    });

    // Detect if wraparound occurred
    if (
      (direction === "row" && nextRow < currRow) || // Wrapped past the last row
      (direction === "col" && nextCol < currCol) // Wrapped past the last column
    ) {
      wrapped = true;
    }

    currRow = nextRow;
    currCol = nextCol;

    // Stop at the first non-filled square
    if (!cells[currRow][currCol].filled) {
      return {
        row: currRow,
        col: currCol,
        direction: wrapped ? (direction === "row" ? "col" : "row") : direction,
      };
    }

    // If we've wrapped back to the starting position, stop
    if (currRow === row && currCol === col) {
      return { row, col, direction };
    }
  }
}


export function startOfNextWord(
  cells: Cell[][],
  cursor: Cursor,
  searchDir: Direction,
  clues: Clues
): Cursor {
  const { startCursor } = findWordBoundaries(cells, cursor);

  console.log({ cells });
  console.log({ startCursor });

  const clueNumber = cells[startCursor.row][startCursor.col].number;

  if (!clueNumber) {
    throw new Error("findWordBoundaries did not return a valid word start!");
  }

  // Extract sorted lists of valid clue numbers
  const validAcrossNumbers = Object.keys(clues.across).map(Number).sort((a, b) => a - b);
  const validDownNumbers = Object.keys(clues.down).map(Number).sort((a, b) => a - b);

  // Determine the current direction's clue list
  const currentClueNumbers =
    cursor.direction === "row" ? validAcrossNumbers : validDownNumbers;
  const otherClueNumbers =
    cursor.direction === "row" ? validDownNumbers : validAcrossNumbers;

  const currentIndex = currentClueNumbers.indexOf(clueNumber);

  let nextClueNumber = clueNumber;
  let nextClueDir = cursor.direction;
  if (searchDir === "forwards") {
    // Move forward in the current list
    if (currentIndex < currentClueNumbers.length - 1) {
      nextClueNumber = currentClueNumbers[currentIndex + 1];
    } else {
      // Wrap to the other direction and pick the first clue
      nextClueDir = nextClueDir === "row" ? "col" : "row";
      nextClueNumber = otherClueNumbers[0];
    }
  } else if (searchDir === "backwards") {
    // Move backward in the current list
    if (currentIndex > 0) {
      nextClueNumber = currentClueNumbers[currentIndex - 1];
    } else {
      // Wrap to the other direction and pick the last clue
      nextClueDir = nextClueDir === "row" ? "col" : "row";
      nextClueNumber = otherClueNumbers[otherClueNumbers.length - 1];
    }
  }

  // Find the next clue in the corresponding direction
  const nextClue =
    clues[nextClueDir === "row" ? "across" : "down"][nextClueNumber];

  if (!nextClue) {
    throw new Error("Could not find the next clue!");
  }

  return {
    row: nextClue.rowStart,
    col: nextClue.colStart,
    direction: nextClueDir,
  };
}
