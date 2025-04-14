import styles from "./Grid.module.css";

import { Cursor, MovementDirection } from "../Game";
import { turn, findWordBoundaries } from "./utils";
import { useKeydownListener } from "./hooks";
import { useRef, useState } from "react";

export interface Cell {
  filled: boolean;
  value: string;
}

export interface NumberedCell extends Cell {
  number: number | null;
}

type GridProps = {
  cells: NumberedCell[][];
  cursor?: Cursor;
  updateCursorPosition: (row: number, col: number) => void;
  toggleCursorDirection: () => void;
  toggleFilledCell: (row: number, col: number) => void;
  setCurrentCellValue: (value: string) => void;
  advanceCursor: () => void;
  reverseCursor: () => void;
  skipWord: (direction: MovementDirection) => void;
  // Should we apply rotational symmetry when editing black squares?
  useSymmetry: boolean;
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
  useSymmetry,
}: GridProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const shiftDown = useKeydownListener("Shift");

  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

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

  const rotate = (cells: Cell[][], row: number, col: number) => {
    const rotatedRow = Math.abs(cells.length - row - 1);
    const rotatedCol = Math.abs(cells.length - col - 1);
    return { rotatedRow, rotatedCol };
  };

  const handleCellClick = (row: number, col: number) => {
    // Always refocus the hidden input
    if (!cursor) {
      return;
    }

    hiddenInputRef.current?.focus();

    if (shiftDown) {
      toggleFilledCell(row, col);
      if (useSymmetry) {
        const { rotatedRow, rotatedCol } = rotate(cells, row, col);
        const isCenterSquare = row === rotatedRow && col === rotatedCol;
        if (
          cells[row][col].filled === cells[rotatedRow][rotatedCol].filled &&
          !isCenterSquare
        ) {
          toggleFilledCell(rotatedRow, rotatedCol);
        }
      }
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
        onChange={() => {}}
        autoFocus
        value=""
      />

      <div
        className={styles.grid}
        style={
          {
            "--grid-row-count": cells.length,
            "--grid-col-count": cells[0].length,
          } as React.CSSProperties
        }
      >
        {cells.map((row: NumberedCell[], rowIndex: number) =>
          row.map((cell: NumberedCell, colIndex: number) => {
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

            const currentCell =
              cursor && isCurrentCell(rowIndex, colIndex, cursor);
            const currentWord =
              cursor && isCurrentWord(rowIndex, colIndex, cursor);

            const isHoveredCell =
              rowIndex === hoveredCell?.row && colIndex === hoveredCell?.col;

            const rotatedHoveredCell =
              hoveredCell && rotate(cells, hoveredCell.row, hoveredCell.col);
            const isRotatedHoveredCell =
              rowIndex === rotatedHoveredCell?.rotatedRow &&
              colIndex === rotatedHoveredCell?.rotatedCol;

            return (
              <div
                className={`
                  ${styles.gridCell} 
                  ${currentWord && styles.cursorWord}
                  ${currentCell && styles.cursorCell}
                  ${shiftDown && isHoveredCell && styles.fillCellHoverIndicator}
                  ${shiftDown && useSymmetry && isRotatedHoveredCell && styles.mirroredFillCellHoverIndicator}
              `}
                key={`${rowIndex}-${colIndex}`}
                onClick={() => {
                  handleCellClick(rowIndex, colIndex);
                }}
                onMouseEnter={() =>
                  setHoveredCell({ row: rowIndex, col: colIndex })
                }
                onMouseLeave={() => isHoveredCell && setHoveredCell(null)}
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
