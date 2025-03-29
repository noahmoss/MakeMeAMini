import { expect, test } from "vitest";
import { findWordBoundaries } from "./utils";
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
