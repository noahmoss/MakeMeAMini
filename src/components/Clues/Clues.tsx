import { Cursor, Mode } from "../Game";
import { NumberedCell } from "../Grid";
import { allFilled, findWordBoundaries } from "../Grid/utils";

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

interface ClueTextProps {
  clue: NumberedClue;
  mode: Mode;
}

export function ClueText({ clue, mode }: ClueTextProps) {
  const [mounted, setMounted] = useState(false);
  const [animationClass, setAnimationClass] = useState(styles.textInvisible);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    if (mode === "editing") {
      setAnimationClass(styles.fadeOut);
      setTimeout(() => setAnimationClass(styles.textInvisible), 400);
    } else {
      setAnimationClass(styles.fadeIn);
      setTimeout(() => setAnimationClass(styles.textVisible), 400);
    }
  }, [mode]);

  if (!clue.value) {
    return (
      <span className={`${animationClass} ${styles.emptyClue}`}>
        (empty clue)
      </span>
    );
  }

  return (
    <span className={`${animationClass} ${styles.clueText}`}>{clue.value}</span>
  );
}

interface ClueInputProps extends ClueTextProps {
  updateClue: updateClueFn;
  setActiveClue: (clueNumber: number, direction: ClueDirection) => void;
}

function ClueInput({ clue, updateClue, setActiveClue, mode }: ClueInputProps) {
  const [mounted, setMounted] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  const fadeInDurationMs = 800;
  const fadeOutDurationMs = 400;

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }

    if (mode === "editing") {
      setAnimationClass(styles.fadeIn);
      setTimeout(() => setAnimationClass(styles.textVisible), fadeInDurationMs);
    } else {
      setAnimationClass(styles.fadeOut);
      setTimeout(
        () => setAnimationClass(styles.textInvisible),
        fadeOutDurationMs,
      );
    }
  }, [mode]);

  return (
    <Textarea
      className={animationClass}
      value={clue.value}
      onChange={(e) => updateClue(clue.number, clue.direction, e.target.value)}
      onFocus={() => {
        setActiveClue(clue.number, clue.direction);
      }}
      autosize
      minRows={1}
      maxRows={3}
      styles={{
        root: {
          width: "100%",
        },
        input: {
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
  mode: Mode;
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
  mode,
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

  const maxClue = Math.max(...clueNumbers);

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
            // Force a re-render whenever clue count changes to avoid inconsistent animations
            key={`${clueNumber}-${maxClue}`}
            className={styles.clueItemWrapper}
            onClick={() => setActiveClue(clueNumber, direction)}
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
            >
              <span
                className={`${styles.clueID}
                            ${isOrthogonalClue ? styles.orthogonalClueID : undefined}`}
              >
                {clueNumber}
              </span>
              <div className={styles.clueContainer}>
                <ClueInput
                  clue={clue}
                  updateClue={updateClue}
                  setActiveClue={setActiveClue}
                  mode={mode}
                />
                <ClueText clue={clue} mode={mode} />
              </div>
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
  function toggleDirection(direction: ClueDirection) {
    return orthogonalClue && setActiveClue(orthogonalClue.number, direction);
  }

  return (
    <Tabs.List grow>
      <Tabs.Tab value="across" onClick={() => toggleDirection("across")}>
        <h2 className={styles.cluesHeader}>Across</h2>
      </Tabs.Tab>
      <Tabs.Tab value="down" onClick={() => toggleDirection("down")}>
        <h2 className={styles.cluesHeader}>Down</h2>
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

  function toggleDirection(direction: ClueDirection) {
    return orthogonalClue && setActiveClue(orthogonalClue.number, direction);
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
            onClick={() => toggleDirection("across")}
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
            onClick={() => toggleDirection("down")}
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
