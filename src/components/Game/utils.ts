import { Cell, SolvingCell } from "../Grid";
import { isStartOfAnyWord } from "../Grid/utils";

export function numberCells<T extends Cell>(cells: readonly T[][]): T[][] {
  let num = 1;
  return cells.map((rowArray, rowIndex) =>
    rowArray.map((cell, colIndex) => ({
      ...cell,
      number: isStartOfAnyWord(cells, rowIndex, colIndex) ? num++ : null,
    })),
  );
}

export function incorrectValue(cell: Cell, solvingCell: SolvingCell) {
  if (
    cell.value &&
    cell.value != " " &&
    solvingCell.value &&
    solvingCell.value != " "
  ) {
    return cell.value !== solvingCell.value;
  } else return false;
}

export function initialCells(rows: number): Cell[][] {
  return numberCells(
    Array.from({ length: rows }, () =>
      Array.from({ length: rows }, () => ({
        filled: false,
        value: "",
      })),
    ),
  );
}

export function initialSolvingCells(rows: number): SolvingCell[][] {
  return numberCells(
    Array.from({ length: rows }, () =>
      Array.from({ length: rows }, () => ({
        filled: false,
        value: "",
        check: false,
        incorrect: false,
      })),
    ),
  );
}
