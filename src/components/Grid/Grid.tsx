import styles from "./Grid.module.css";

import { Cursor } from "../Game";
import { findWordBoundaries } from "./utils";
import { useEffect, useState } from "react";

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
};

function useKeydownListener(key: string): Boolean {
  const [keydown, setKeydown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        setKeydown(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === key) {
        setKeydown(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };

  }, [key])

  return keydown;
}

function Grid({ cells, cursor, updateCursorPosition, toggleCursorDirection, toggleFilledCell }: GridProps) {
  const spacebarDown = useKeydownListener(" ");
  const shiftDown = useKeydownListener("Shift");

  const isCurrentCell = (row: number, col: number, cursor: Cursor) => {
    return row === cursor.row && col === cursor.col;
  }

  const isCurrentWord = (row: number, col: number, cursor: Cursor) => {
    const { wordStart, wordEnd } = findWordBoundaries(cells, cursor);
    return ((
      cursor.direction === 'row' &&
      cursor.row === row &&
      col >= wordStart &&
      col <= wordEnd
    ) || (
        cursor.direction === 'col' &&
        cursor.col === col &&
        row >= wordStart &&
        row <= wordEnd
      ))
  }

  const handleCellClick = (row: number, col: number) => {
    if (spacebarDown || shiftDown) {
      toggleFilledCell(row, col);
      return;
    }

    if (isCurrentCell(row, col, cursor)) {
      toggleCursorDirection();
    } else {
      updateCursorPosition(row, col);
    }
  }

  return (
    <div className={styles.gridContainer}>
      {cells.map((row: Cell[], rowIndex: number) =>
        row.map((cell: Cell, colIndex: number) => {
          if (cell.filled) {
            return (
              <div className={styles.filledCell}
                onClick={() => { handleCellClick(rowIndex, colIndex) }}
                key={`${rowIndex}-${colIndex}`}
              />
            )
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
              onClick={() => { handleCellClick(rowIndex, colIndex) }}
            >
              <div className={styles.gridCellNumber}>{cell.number}</div>

              <div className={styles.gridCellValue}>{cell.value}</div>
            </div>
          );
        }),
      )}
    </div>
  );
}

export default Grid;
