import { useEffect, useState } from "react";
import { Cursor } from "../Game";
import { Cell } from "../Grid";
import { findWordBoundaries, wordLength } from "../Grid/utils";

async function loadWordList(gridSize: number): Promise<Set<string>> {
  const response = await fetch(
    `${import.meta.env.BASE_URL}wordlist/v1/filtered${gridSize}.txt`,
  );
  const text = await response.text();
  const words = text.split("\n").map((word) => {
    return word.split(";")[0]; // Remove score
  });
  return new Set(words);
}

function FillAssist({ cells, cursor }: { cells: Cell[][]; cursor: Cursor }) {
  const gridSize = cells.length;
  const [wordList, setWordList] = useState<Set<string> | null>(null);

  useEffect(() => {
    async function loadWords() {
      try {
        console.log("Loading word list...");
        const wordList = await loadWordList(gridSize);
        setWordList(wordList);
        console.log("Got the word list!");
      } catch (error) {
        console.error("Error loading word list:", error);
      }
    }
    void loadWords();
  }, [gridSize]);

  // Generates a regex pattern based on the current cursor position and filled cells
  const cursorPattern = (): RegExp => {
    const { startCursor, endCursor } = findWordBoundaries(cells, cursor);
    const length = wordLength(startCursor, endCursor);
    const wordPattern = [...Array.from({ length })]
      .map((_, i) => {
        const cell =
          cursor.direction === "row"
            ? cells[cursor.row][startCursor.col + i]
            : cells[startCursor.row + i][cursor.col];
        console.log("Cell at position", i, ":", cell);
        return cell.value == "" || cell.value == " " ? "." : cell.value;
      })
      .join("");
    return new RegExp("^" + wordPattern + "$");
  };

  const getPossibleWords = (): string[] => {
    if (!wordList) {
      return [];
    }

    const pattern: RegExp = cursorPattern();
    console.log("Generated pattern:", pattern);
    return Array.from(wordList).filter((word) => pattern.test(word));
  };

  console.log(getPossibleWords());

  return <div></div>;
}

export default FillAssist;
