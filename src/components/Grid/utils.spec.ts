import { expect, test } from "vitest";
import {
  findWordBoundaries,
  isStartOfWord,
  isStartOfAnyWord,
} from "./utils";
import { Cell } from "./Grid";
import { numberCells } from "../Game";

const transformGrid = (cells: string[][]): Cell[][] => {
  return cells.map((row) =>
    row.map((cell) => ({ filled: cell == "x", value: "" })),
  );
};

// A spec for 5x5 grid with some filled cells and no entered words
const fiveByFive = transformGrid([
  ["x", "", "", "", "x"],
  ["", "", "", "", ""],
  ["", "", "x", "", ""],
  ["", "", "", "", ""],
  ["x", "", "", "", "x"],
]);

const blackGrid = transformGrid([
  ["x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x"],
  ["x", "x", "x", "x", "x"],
]);

const sevenBySeven = transformGrid([
  ["", "", "", "", "", "", ""],
  ["", "x", "", "", "", "", ""],
  ["", "", "x", "", "", "", ""],
  ["", "", "", "x", "", "", ""],
  ["", "", "", "", "x", "", ""],
  ["", "", "", "", "", "x", ""],
  ["", "", "", "", "", "", ""],
]);

test("findWordBoundaries should correctly identify word boundaries", () => {
  expect(
    findWordBoundaries(fiveByFive, { row: 0, col: 1, direction: "row" }),
  ).toEqual({
    startCursor: { row: 0, col: 1, direction: "row" },
    endCursor: { row: 0, col: 3, direction: "row" },
  });

  expect(
    findWordBoundaries(fiveByFive, { row: 0, col: 1, direction: "col" }),
  ).toEqual({
    startCursor: { row: 0, col: 1, direction: "col" },
    endCursor: { row: 4, col: 1, direction: "col" },
  });
});

test("findWordBoundaries works when the cursor is in the middle of a word", () => {
  expect(
    findWordBoundaries(fiveByFive, { row: 0, col: 2, direction: "row" }),
  ).toEqual({
    startCursor: { row: 0, col: 1, direction: "row" },
    endCursor: { row: 0, col: 3, direction: "row" },
  });

  expect(
    findWordBoundaries(fiveByFive, { row: 2, col: 0, direction: "col" }),
  ).toEqual({
    startCursor: { row: 1, col: 0, direction: "col" },
    endCursor: { row: 3, col: 0, direction: "col" },
  });
});

test("isStartOfWord correctly detects word starts", () => {
  expect(
    isStartOfWord(fiveByFive, { row: 0, col: 1, direction: "row" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 0, col: 2, direction: "row" }),
  ).toBeFalsy();
  expect(
    isStartOfWord(fiveByFive, { row: 0, col: 3, direction: "row" }),
  ).toBeFalsy();
  expect(
    isStartOfWord(fiveByFive, { row: 1, col: 0, direction: "row" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 2, col: 0, direction: "row" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 3, col: 0, direction: "row" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 3, col: 2, direction: "row" }),
  ).toBeFalsy();

  expect(
    isStartOfWord(fiveByFive, { row: 0, col: 1, direction: "col" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 0, col: 2, direction: "col" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 0, col: 3, direction: "col" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 1, col: 0, direction: "col" }),
  ).toBeTruthy();
  expect(
    isStartOfWord(fiveByFive, { row: 2, col: 0, direction: "col" }),
  ).toBeFalsy();
  expect(
    isStartOfWord(fiveByFive, { row: 3, col: 0, direction: "col" }),
  ).toBeFalsy();
  expect(
    isStartOfWord(fiveByFive, { row: 3, col: 2, direction: "col" }),
  ).toBeTruthy();
});

test("isStartOfAnyWord correctly detects word starts", () => {
  // Valid word starts
  expect(isStartOfAnyWord(fiveByFive, 0, 1)).toBeTruthy();
  expect(isStartOfAnyWord(fiveByFive, 0, 2)).toBeTruthy();
  expect(isStartOfAnyWord(fiveByFive, 0, 3)).toBeTruthy();
  expect(isStartOfAnyWord(fiveByFive, 1, 0)).toBeTruthy();
  expect(isStartOfAnyWord(fiveByFive, 2, 0)).toBeTruthy();
  expect(isStartOfAnyWord(fiveByFive, 3, 0)).toBeTruthy();
  expect(isStartOfAnyWord(fiveByFive, 3, 2)).toBeTruthy();

  // Filled squares
  expect(isStartOfAnyWord(fiveByFive, 0, 0)).toBeFalsy();
  expect(isStartOfAnyWord(fiveByFive, 2, 2)).toBeFalsy();

  // Middles of words
  expect(isStartOfAnyWord(fiveByFive, 2, 1)).toBeFalsy();
  expect(isStartOfAnyWord(fiveByFive, 3, 3)).toBeFalsy();
});

test("numberCells", () => {
  const numbers = (numberedCells: Cell[][]) => {
    return numberedCells.map((row) => row.map((cell) => cell.number));
  };

  expect(numbers(numberCells(fiveByFive))).toEqual([
    [null, 1, 2, 3, null],
    [4, null, null, null, 5],
    [6, null, null, 7, null],
    [8, null, 9, null, null],
    [null, 10, null, null, null],
  ]);

  expect(numbers(numberCells(blackGrid))).toEqual([
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ]);

  expect(numbers(numberCells(sevenBySeven))).toEqual([
    [1, 2, 3, 4, 5, 6, 7],
    [8, null, 9, null, null, null, null],
    [10, 11, null, 12, null, null, null],
    [13, null, 14, null, 15, null, null],
    [16, null, null, 17, null, 18, null],
    [19, null, null, null, 20, null, 21],
    [22, null, null, null, null, 23, null],
  ]);
});
