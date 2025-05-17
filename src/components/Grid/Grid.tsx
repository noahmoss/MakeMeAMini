import styles from "./Grid.module.css";

import { Cursor, incorrectValue, Mode, MovementDirection } from "../Game";
import { isCurrentCell, isCurrentWord } from "./utils";
import { useKeydownListener } from "./hooks";
import { useEffect, useRef, useState } from "react";

export interface Cell {
  filled: boolean;
  value: string;
  number?: number | null;
}

export interface SolvingCell extends Cell {
  incorrect: boolean;
}

type FilledCellProps = {
  handleClick: () => void;
};

function FilledCell({ handleClick }: FilledCellProps) {
  return (
    <div
      className={` ${styles.gridCell} ${styles.filledCell} `}
      onClick={handleClick}
    />
  );
}

type CellProps = {
  cell: Cell;
  solvingCell: Cell;
  className: string;
  rowIndex: number;
  colIndex: number;
  mode: Mode;
  incorrect: boolean;
  handleCellClick: (mode: Mode, rowIndex: number, colIndex: number) => void;
  isHoveredCell: boolean;
  setHoveredCell: (hovered: { row: number; col: number } | null) => void;
};

function Cell({
  cell,
  solvingCell,
  className,
  rowIndex,
  colIndex,
  mode,
  incorrect,
  handleCellClick,
  isHoveredCell,
  setHoveredCell,
}: CellProps) {
  const [mounted, setMounted] = useState(false);
  const [editingAnimationClass, setEditingAnimationClass] = useState(
    styles.textVisible,
  );
  const [solvingAnimationClass, setSolvingAnimationClass] = useState(
    styles.textInvisible,
  );

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    if (mode === "editing") {
      // Transition from solving -> editing
      setSolvingAnimationClass(styles.fadeOut);
      setTimeout(() => setSolvingAnimationClass(styles.textInvisible), 400);

      setEditingAnimationClass(styles.fadeIn);
      setTimeout(() => setEditingAnimationClass(styles.textVisible), 800);
    } else if (mode === "solving") {
      // Transition from editing -> solving
      setEditingAnimationClass(styles.fadeOut);
      setTimeout(() => setEditingAnimationClass(styles.textInvisible), 400);

      setSolvingAnimationClass(styles.fadeIn);
      setTimeout(() => setSolvingAnimationClass(styles.textVisible), 800);
    }
  }, [mode]);

  return (
    <div
      className={className}
      onClick={() => {
        handleCellClick(mode, rowIndex, colIndex);
      }}
      onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
      onMouseLeave={() => isHoveredCell && setHoveredCell(null)}
      tabIndex={-1}
    >
      <div className={styles.gridCellNumber}>{cell?.number}</div>
      <div className={styles.gridCellValueWrapper}>
        <div className={`${editingAnimationClass} ${styles.gridCellValue}`}>
          {cell?.value}
        </div>
        <div
          className={`${solvingAnimationClass} 
                      ${styles.gridCellValue}
                      ${incorrect && styles.incorrectCell}`}
        >
          {solvingCell?.value}
        </div>
      </div>
    </div>
  );
}

interface GridProps {
  mode: Mode;
  cells: Cell[][];
  solvingCells: SolvingCell[][];
  cursor?: Cursor;
  updateCursorPosition: (row: number, col: number) => void;
  toggleCursorDirection: () => void;
  toggleFilledCell: (row: number, col: number) => void;
  setCurrentCellValue: (value: string) => void;
  advanceCursor: () => void;
  reverseCursor: () => void;
  skipWord: (direction: MovementDirection) => void;
  autocheck: boolean;
  // Should we apply rotational symmetry when editing black squares?
  useSymmetry: boolean;
  // Ref for hidden <input> that powers typing in grid
  hiddenInputRef: React.RefObject<HTMLInputElement>;
}

function Grid({
  mode,
  cells,
  solvingCells,
  cursor,
  updateCursorPosition,
  toggleCursorDirection,
  toggleFilledCell,
  setCurrentCellValue,
  advanceCursor,
  reverseCursor,
  skipWord,
  autocheck,
  useSymmetry,
  hiddenInputRef,
}: GridProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const shiftDown = useKeydownListener("Shift");

  const rotate = (cells: Cell[][], row: number, col: number) => {
    const rotatedRow = Math.abs(cells.length - row - 1);
    const rotatedCol = Math.abs(cells.length - col - 1);
    return { rotatedRow, rotatedCol };
  };

  const handleCellClick = (mode: Mode, row: number, col: number) => {
    // Always refocus the hidden input
    if (!cursor) {
      return;
    }

    hiddenInputRef.current?.focus();

    if (shiftDown && mode === "editing") {
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

  // Attach a ResizeObserver to the grid to ensure the cell font sizes scale
  // proportionally to cell width.
  // TODO: A little cleaner to use a single CSS var + calc
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const gridEl = gridRef?.current;
    if (!gridEl) return;

    const observer = new ResizeObserver(([entry]) => {
      const gridWidth = entry.contentRect.width;
      const cellWidth = gridWidth / cells.length;
      gridEl.style.setProperty(
        "--cell-value-font-size",
        `${cellWidth * 0.6}px`,
      );
      gridEl.style.setProperty(
        "--cell-number-font-size",
        `${cellWidth * 0.25}px`,
      );
      gridEl.style.setProperty(
        "--cell-number-top-offset",
        `${cellWidth * 0.15}px`,
      );
      gridEl.style.setProperty(
        "--cell-number-left-offset",
        `${cellWidth * 0.03}px`,
      );
    });
    observer.observe(gridEl);
    return () => observer.disconnect();
  }, [cells.length]);

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
        onChange={() => { }}
        autoFocus
        value=""
      />

      <div
        className={styles.grid}
        ref={gridRef}
        style={
          {
            "--grid-row-count": cells.length,
            "--grid-col-count": cells[0].length,
          } as React.CSSProperties
        }
      >
        {cells.map((row: Cell[], rowIndex: number) =>
          row.map((cell: Cell, colIndex: number) => {
            if (cell.filled) {
              return (
                <FilledCell
                  handleClick={() => {
                    handleCellClick(mode, rowIndex, colIndex);
                  }}
                  key={`${rowIndex}-${colIndex}`}
                />
              );
            }

            const currentCell =
              cursor && isCurrentCell(rowIndex, colIndex, cursor);
            const currentWord =
              cursor && isCurrentWord(cells, rowIndex, colIndex, cursor);

            const isHoveredCell =
              mode === "editing" &&
              rowIndex === hoveredCell?.row &&
              colIndex === hoveredCell?.col;

            const rotatedHoveredCell =
              hoveredCell && rotate(cells, hoveredCell.row, hoveredCell.col);
            const isRotatedHoveredCell =
              mode === "editing" &&
              rowIndex === rotatedHoveredCell?.rotatedRow &&
              colIndex === rotatedHoveredCell?.rotatedCol;

            const solvingCell = solvingCells[rowIndex][colIndex];
            const incorrect =
              mode === "solving" &&
              (solvingCell.incorrect ||
                (autocheck && incorrectValue(cell, solvingCell)));

            return (
              <Cell
                cell={cell}
                solvingCell={solvingCells[rowIndex][colIndex]}
                mode={mode}
                incorrect={incorrect}
                className={`
                  ${styles.gridCell} 
                  ${currentWord && styles.cursorWord}
                  ${currentCell && styles.cursorCell}
                  ${shiftDown && isHoveredCell && styles.fillCellHoverIndicator}
                  ${shiftDown && useSymmetry && isRotatedHoveredCell && styles.mirroredFillCellHoverIndicator}
              `}
                rowIndex={rowIndex}
                colIndex={colIndex}
                handleCellClick={handleCellClick}
                isHoveredCell={isHoveredCell}
                setHoveredCell={setHoveredCell}
                key={`${rowIndex}-${colIndex}`}
              />
            );
          }),
        )}
      </div>
    </>
  );
}

export default Grid;
