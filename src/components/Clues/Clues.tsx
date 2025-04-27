import { Cursor } from "../Game";
import { NumberedCell } from "../Grid";
import { allFilled, findWordBoundaries, isStartOfWord } from "../Grid/utils";

import { Tabs, Textarea } from "@mantine/core";

import styles from "./Clues.module.css";
import { useEffect, useRef, useState } from "react";

export interface Clue {
  value: string;
}

export type NumberedClue = Clue & {
  number: number;
  direction: ClueDirection;
};

export type ClueList = Record<string, NumberedClue>;

export interface Clues {
  across: ClueList;
  down: ClueList;
}

interface ClueStart {
  row: number;
  col: number;
}

export interface ClueStarts {
  across: Record<string, ClueStart>;
  down: Record<string, ClueStart>;
}

export type ClueDirection = "across" | "down";

export function getActiveClue(
  cells: NumberedCell[][],
  clues: Clues,
  cursor: Cursor,
): NumberedClue | undefined {
  if (allFilled(cells)) {
    return undefined;
  }

  const { startCursor } = findWordBoundaries(cells, cursor);

  const clueNumber = cells[startCursor.row][startCursor.col]?.number;
  if (!clueNumber) {
    return undefined;
  }
  const clueDir = cursor.direction === "row" ? "across" : "down";

  return {
    ...clues[clueDir][clueNumber],
    number: clueNumber,
    direction: clueDir,
  };
}

interface ClueInputProps {
  clue: NumberedClue;
  updateClue: updateClueFn;
}

export function ClueInput({ clue, updateClue }: ClueInputProps) {
  return (
    <Textarea
      value={clue.value}
      onChange={(e) =>
        updateClue(clue?.number, clue?.direction, e.target.value)
      }
      autosize
      minRows={1}
      maxRows={3}
      styles={{
        root: {
          width: "100%",
        },
        input: {
          transition: "unset",
          height: "min-content",
        },
        wrapper: {
          paddingTop: "4px",
          paddingBottom: "4px",
        },
      }}
    />
  );
}

export type updateClueFn = (
  clueNumber: number,
  direction: ClueDirection,
  clue: string,
) => void;

interface ClueListBaseProps {
  activeClue?: NumberedClue;
  orthogonalClue?: NumberedClue;
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
  updateClue: updateClueFn;
}

type ClueListProps = ClueListBaseProps & {
  direction: ClueDirection;
  clueList: ClueList;
};

function ClueList({
  direction,
  activeClue,
  orthogonalClue,
  clueList,
  setActiveClue,
  updateClue,
}: ClueListProps) {
  const clueNumbers = Object.keys(clueList)
    .map(Number)
    .sort((a, b) => a - b);

  // Scroll active & orthogonal clues into view whenever active clue changes
  const clueRefs = useRef(new Map<number, HTMLLIElement | null>());

  useEffect(() => {
    if (!activeClue || !orthogonalClue) return;
    const clueNumberToScroll =
      direction === activeClue?.direction
        ? activeClue.number
        : orthogonalClue.number;
    clueRefs.current?.get(clueNumberToScroll)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  });

  return (
    <ol className={styles.clueList}>
      {clueNumbers.map((clueNumber) => {
        const clue = clueList[clueNumber];
        const isActiveClue =
          direction === activeClue?.direction &&
          clueNumber === activeClue?.number;
        const isOrthogonalClue =
          direction === orthogonalClue?.direction &&
          clueNumber === orthogonalClue?.number;

        return (
          <li
            key={clueNumber}
            className={styles.clueItemWrapper}
            ref={(el) => {
              if (el) {
                clueRefs.current.set(clueNumber, el);
              } else {
                clueRefs.current.delete(clueNumber);
              }
            }}
          >
            <div
              className={`${styles.clueItem} 
                          ${isActiveClue ? styles.activeClueItem : undefined}`}
              key={clueNumber}
              onClick={() => setActiveClue(clueNumber, direction)}
            >
              <span
                className={`${styles.clueID}
                            ${isOrthogonalClue ? styles.orthogonalClueID : undefined}`}
              >
                {clueNumber}
              </span>
              <ClueInput clue={clue} updateClue={updateClue} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
interface ClueTabHeaderProps {
  activeClue?: NumberedClue;
  orthogonalClue?: NumberedClue;
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
}

function ClueTabHeader({ orthogonalClue, setActiveClue }: ClueTabHeaderProps) {
  function toggleDirection() {
    return (
      orthogonalClue &&
      setActiveClue(orthogonalClue.number, orthogonalClue.direction)
    );
  }

  return (
    <Tabs.List grow>
      <Tabs.Tab value="across" onClick={toggleDirection}>
        <h2 className={styles.cluesHeader}>Across</h2>
      </Tabs.Tab>
      <Tabs.Tab value="down">
        <h2 className={styles.cluesHeader} onClick={toggleDirection}>
          Down
        </h2>
      </Tabs.Tab>
    </Tabs.List>
  );
}

type CluesProps = ClueListBaseProps & {
  clues: Clues;
};

export function ClueBox({
  clues,
  activeClue,
  orthogonalClue,
  setActiveClue,
  ...rest
}: CluesProps) {
  const [activeTab, setActiveTab] = useState<string | null>(
    activeClue?.direction || "across",
  );

  useEffect(() => {
    if (activeClue?.direction && activeClue.direction !== activeTab) {
      setActiveTab(activeClue.direction);
    }
  }, [activeClue]);

  function toggleDirection() {
    return (
      orthogonalClue &&
      setActiveClue(orthogonalClue.number, orthogonalClue.direction)
    );
  }

  return (
    <>
      <div className={`${styles.cluesContainer} ${styles.smallScreenClues}`}>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          color="var(--active-tab-header-color)"
        >
          <ClueTabHeader
            activeClue={activeClue}
            orthogonalClue={orthogonalClue}
            setActiveClue={setActiveClue}
          />
          <div className={styles.cluesSection}>
            <Tabs.Panel value="across">
              <ClueList
                direction="across"
                clueList={clues?.across}
                activeClue={activeClue}
                setActiveClue={setActiveClue}
                {...rest}
              />
            </Tabs.Panel>

            <Tabs.Panel value="down">
              <ClueList
                direction="down"
                clueList={clues?.down}
                activeClue={activeClue}
                setActiveClue={setActiveClue}
                {...rest}
              />
            </Tabs.Panel>
          </div>
        </Tabs>
      </div>

      <div className={`${styles.cluesContainer} ${styles.largeScreenClues}`}>
        <div className={styles.cluesSection}>
          <button
            className={styles.largeScreenCluesHeader}
            onClick={toggleDirection}
            style={{
              borderBottomColor:
                activeClue?.direction === "across"
                  ? "var(--active-tab-header-color)"
                  : "var(--inactive-tab-header-color)",
            }}
          >
            <h2>Across</h2>
          </button>
          <ClueList
            direction="across"
            clueList={clues?.across}
            activeClue={activeClue}
            setActiveClue={setActiveClue}
            {...rest}
          />
        </div>
        <div className={styles.cluesSection}>
          <button
            className={styles.largeScreenCluesHeader}
            onClick={toggleDirection}
            style={{
              borderBottomColor:
                activeClue?.direction === "down"
                  ? "var(--active-tab-header-color)"
                  : "var(--inactive-tab-header-color)",
            }}
          >
            <h2>Down</h2>
          </button>
          <ClueList
            direction="down"
            clueList={clues?.down}
            activeClue={activeClue}
            setActiveClue={setActiveClue}
            {...rest}
          />
        </div>
      </div>
    </>
  );
}
