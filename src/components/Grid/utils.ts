import { Cell } from "./Grid";
import { Clues, Cursor, Direction } from "../Game";

function rowCount(cells: Cell[][]) {
  return cells.length;
}

function colCount(cells: Cell[][]) {
  return cells[0].length;
}

function turn(cursor: Cursor) {
  return cursor.direction === "row" ?
    { ...cursor, direction: "col" }
    : { ...cursor, direction: "row" }
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
  clues: Clues,
): Cursor {
  const { startCursor } = findWordBoundaries(cells, cursor);

  const clueNumber = cells[startCursor.row][startCursor.col]?.number ?? 0;
  const maxDown = clues.down.length - 1;
  const maxAcross = clues.across.length - 1;

  if (!clueNumber) {
    throw new Error("findWordBoundaries did not return a valid word start!")
  }

  let nextClueNumber;
  let nextClueDir;
  if (searchDir === 'forwards') {
    nextClueNumber = clueNumber + 1;
    if ((cursor.direction === 'row' && nextClueNumber > maxAcross)
      || (cursor.direction === 'col' && nextClueNumber > maxDown)) {
      nextClueNumber = 1;
      nextClueDir = turn(cursor).direction;
    }
  } else if (searchDir === 'backwards') {
    nextClueNumber = clueNumber - 1;
    if (nextClueNumber < 1) {
      nextClueNumber = cursor.direction === 'row' ? maxDown : maxAcross;
      nextClueDir = turn(cursor).direction;
    }
  }

  const nextClue = clues[nextClueDir === 'row' ? 'across' : 'down'][nextClueNumber]
  //if ((cursor.direction === 'row' && nextClueNumber < 1)
  //  || (cursor.direction === 'col' && nextClueNumber > maxDown)) {
  //  nextClueNumber = 1;
  //}
}



return cursor;

  //let newCursor = cursor;
  //if (searchDir === 'forwards') {
  //
  //  const wordEndCursor =
  //    cursor.direction === 'row' ?
  //      { ...cursor, col: wordEnd } :
  //      { ...cursor, row: wordEnd };
  //
  //  console.log({ wordEndCursor });
  //
  //  newCursor = moveCursor(cells, wordEndCursor, 'forwards');
  //  console.log({ newCursor });
  //
  //} else if (searchDir === 'backwards') {
  //  const wordStartCursor =
  //    cursor.direction === 'row' ?
  //      { ...cursor, col: wordStart } :
  //      { ...cursor, row: wordStart };
  //  // Cursor pointing to the end of the previous word
  //  newCursor = moveCursor(cells, wordStartCursor, 'backwards');
  //  const { wordStart: newWordStart } = findWordBoundaries(cells, newCursor);
  //  newCursor = newCursor.direction === 'row' ?
  //    { ...newCursor, col: newWordStart } :
  //    { ...newCursor, row: newWordStart };
  //}
  //return newCursor;
}
