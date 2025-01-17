import styles from "./Grid.module.css";

import { Cursor, Direction } from "../Game";
import { turn, findWordBoundaries } from "./utils";
import { useKeydownListener } from "./hooks";
import { useRef } from "react";

export interface Cell {
  filled: boolean;
  value: string;
  number: number | null;
}

type GridProps = {
  cells: Cell[][];
  cursor: Cursor;
  updateCursorPosition: (row: number, col: number) => void;
  toggleCursorDirection: () => void;
  toggleFilledCell: (row: number, col: number) => void;
  setCurrentCellValue: (value: string) => void;
  advanceCursor: () => void;
  reverseCursor: () => void;
  skipWord: (direction: Direction) => void;
};

function Grid({
  cells,
  cursor,
  updateCursorPosition,
  toggleCursorDirection,
  toggleFilledCell,
  setCurrentCellValue,
  advanceCursor,
  reverseCursor,
  skipWord,
}: GridProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const spacebarDown = useKeydownListener(" ");
  const shiftDown = useKeydownListener("Shift");

  const isCurrentCell = (row: number, col: number, cursor: Cursor) => {
    return row === cursor.row && col === cursor.col;
  };

  const isCurrentWord = (row: number, col: number, cursor: Cursor) => {
    const { startCursor, endCursor } = findWordBoundaries(cells, cursor);
    const wordStart = startCursor[turn(cursor.direction)];
    const wordEnd = endCursor[turn(cursor.direction)];

    return (
      (cursor.direction === "row" &&
        cursor.row === row &&
        col >= wordStart &&
        col <= wordEnd) ||
      (cursor.direction === "col" &&
        cursor.col === col &&
        row >= wordStart &&
        row <= wordEnd)
    );
  };

  const handleCellClick = (row: number, col: number) => {
    // Always refocus the hidden input
    hiddenInputRef.current?.focus();

    if (spacebarDown || shiftDown) {
      toggleFilledCell(row, col);
      return;
    }

    if (isCurrentCell(row, col, cursor)) {
      toggleCursorDirection();
    } else {
      updateCursorPosition(row, col);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    //e.preventDefault();
    hiddenInputRef.current?.focus();

    const upperKey = e.key.toUpperCase();
    if (/^[A-Z]$/.test(upperKey)) {
      setCurrentCellValue(upperKey);
      advanceCursor();
    } else if (upperKey === "TAB") {
      e.preventDefault();
      if (e.shiftKey) {
        skipWord("backwards");
      } else {
        skipWord("forwards");
      }
    } else if (upperKey === " ") {
      e.preventDefault();
      toggleCursorDirection();
    } else if (upperKey === "BACKSPACE") {
      setCurrentCellValue(" ");
      reverseCursor();
    }
  };

  return (
    <>
      <input
        className={styles.hiddenInput}
        ref={hiddenInputRef}
        type=""
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        onKeyDown={handleKeyDown}
        onBlur={() => hiddenInputRef.current?.focus()}
        onChange={() => { }}
        autoFocus
        value=""
      />

      <div className={styles.grid}>
        {cells.map((row: Cell[], rowIndex: number) =>
          row.map((cell: Cell, colIndex: number) => {
            if (cell.filled) {
              return (
                <div
                  className={`
                  ${styles.gridCell}
                  ${styles.filledCell}
                  `}
                  onClick={() => {
                    handleCellClick(rowIndex, colIndex);
                  }}
                  key={`${rowIndex}-${colIndex}`}
                />
              );
            }

            const currentCell = isCurrentCell(rowIndex, colIndex, cursor);
            const currentWord = isCurrentWord(rowIndex, colIndex, cursor);

            return (
              <div
                className={`
                  ${styles.gridCell} 
                  ${currentWord && styles.cursorWord}
                  ${currentCell && styles.cursorCell}
              `}
                key={`${rowIndex}-${colIndex}`}
                onClick={() => {
                  handleCellClick(rowIndex, colIndex);
                }}
                tabIndex={-1}
              >
                <div className={styles.gridCellNumber}>{cell.number}</div>
                <div className={styles.gridCellValue}>{cell.value}</div>
              </div>
            );
          }),
        )}
      </div>
    </>
  );
}

export default Grid;
