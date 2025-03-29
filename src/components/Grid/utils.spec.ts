import { expect, test } from "vitest";
import { findWordBoundaries, isStartOfAnyWord } from "./utils";
import { Cell } from "./Grid";

const transformGrid = (cells: string[][]): Cell[][] => {
  return cells.map((row) =>
    row.map((cell) => ({ filled: cell == "x", value: "" })),
  );
};

// A spec for 5x5 grid with some filled cells and no entered words
const testGrid = transformGrid([
  ["x", "", "", "", "x"],
  ["", "", "", "", ""],
  ["", "", "x", "", ""],
  ["", "", "", "", ""],
  ["x", "", "", "", "x"],
]);

test("findWordBoundaries should correctly identify word boundaries", () => {
  expect(
    findWordBoundaries(testGrid, { row: 0, col: 1, direction: "row" })
  ).toEqual({
    startCursor: { row: 0, col: 1, direction: "row" },
    endCursor: { row: 0, col: 3, direction: "row" },
  });

  expect(
    findWordBoundaries(testGrid, { row: 0, col: 1, direction: "col" })
  ).toEqual({
    startCursor: { row: 0, col: 1, direction: "col" },
    endCursor: { row: 4, col: 1, direction: "col" },
  });
});

test("findWordBoundaries works when the cursor is in the middle of a word", () => {
  expect(
    findWordBoundaries(testGrid, { row: 0, col: 2, direction: "row" })
  ).toEqual({
    startCursor: { row: 0, col: 1, direction: "row" },
    endCursor: { row: 0, col: 3, direction: "row" },
  });

  expect(
    findWordBoundaries(testGrid, { row: 2, col: 0, direction: "col" })
  ).toEqual({
    startCursor: { row: 1, col: 0, direction: "col" },
    endCursor: { row: 3, col: 0, direction: "col" },
  });
});

test("isStartOfAnyWord correctly detects word starts", () => {
  // Valid word starts
  expect(isStartOfAnyWord(testGrid, 0, 1)).toBeTruthy()
  expect(isStartOfAnyWord(testGrid, 0, 2)).toBeTruthy()
  expect(isStartOfAnyWord(testGrid, 0, 3)).toBeTruthy()
  expect(isStartOfAnyWord(testGrid, 1, 0)).toBeTruthy()
  expect(isStartOfAnyWord(testGrid, 2, 0)).toBeTruthy()
  expect(isStartOfAnyWord(testGrid, 3, 0)).toBeTruthy()
  expect(isStartOfAnyWord(testGrid, 3, 2)).toBeTruthy()

  // Filled squares
  expect(isStartOfAnyWord(testGrid, 0, 0)).toBeFalsy()
  expect(isStartOfAnyWord(testGrid, 2, 2)).toBeFalsy()

  // Middles of words
  expect(isStartOfAnyWord(testGrid, 2, 1)).toBeFalsy()
  expect(isStartOfAnyWord(testGrid, 3, 3)).toBeFalsy()
})
