import styles from "./Grid.module.css";

import { Cursor } from "../Game";
import { findWordBoundaries } from "./utils";
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
};

function Grid({
  cells,
  cursor,
  updateCursorPosition,
  toggleCursorDirection,
  toggleFilledCell,
  setCurrentCellValue,
}: GridProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const spacebarDown = useKeydownListener(" ");
  const shiftDown = useKeydownListener("Shift");

  const isCurrentCell = (row: number, col: number, cursor: Cursor) => {
    return row === cursor.row && col === cursor.col;
  };

  const isCurrentWord = (row: number, col: number, cursor: Cursor) => {
    const { wordStart, wordEnd } = findWordBoundaries(cells, cursor);
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
    hiddenInputRef.current?.focus();

    const upperKey = e.key.toUpperCase();
    if (/^[A-Z]$/.test(upperKey)) {
      console.log(upperKey);
      setCurrentCellValue(upperKey);
    }
  };

  return (
    <>
      <input
        className={styles.hiddenInput}
        ref={hiddenInputRef}
        type="text"
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

      <div className={styles.gridContainer}>
        {cells.map((row: Cell[], rowIndex: number) =>
          row.map((cell: Cell, colIndex: number) => {
            if (cell.filled) {
              return (
                <div
                  className={styles.filledCell}
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
