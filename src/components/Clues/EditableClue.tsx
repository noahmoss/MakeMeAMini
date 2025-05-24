import { useEffect, useRef, useState } from "react";
import { Mode } from "../Game";
import { ClueDirection, NumberedClue, updateClueFn } from "./Clues";

import styles from "./Clues.module.css";
import { Textarea } from "@mantine/core";

const FADE_IN_DURATION_MS = 800;
const FADE_OUT_DURATION_MS = 400;

interface ClueTextProps {
  clue: NumberedClue;
  mode: Mode;
}

function ClueText({ clue, mode }: ClueTextProps) {
  const [animationClass, setAnimationClass] = useState(styles.textInvisible);
  const mountedRef = useRef(false);
  const prevMode = useRef<Mode>("editing");

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const modeChanged = mode !== prevMode.current;
    if (!modeChanged) return;

    prevMode.current = mode;

    if (mode === "editing") {
      setAnimationClass(styles.fadeOut);
      setTimeout(
        () => setAnimationClass(styles.textInvisible),
        FADE_OUT_DURATION_MS,
      );
    } else {
      setAnimationClass(styles.fadeIn);
      setTimeout(
        () => setAnimationClass(styles.textVisible),
        FADE_IN_DURATION_MS,
      );
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
  setActiveClue?: (clueNumber: number, direction: ClueDirection) => void;
}

function ClueInput({ clue, updateClue, setActiveClue, mode }: ClueInputProps) {
  const [animationClass, setAnimationClass] = useState(styles.textVisible);
  const mountedRef = useRef(false);
  const prevMode = useRef<Mode | undefined>("editing");

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const modeChanged = mode !== prevMode.current;
    if (!modeChanged) return;

    prevMode.current = mode;

    if (mode === "editing") {
      setAnimationClass(styles.fadeIn);
      setTimeout(
        () => setAnimationClass(styles.textVisible),
        FADE_IN_DURATION_MS,
      );
    } else {
      setAnimationClass(styles.fadeOut);
      setTimeout(
        () => setAnimationClass(styles.textInvisible),
        FADE_OUT_DURATION_MS,
      );
    }
  }, [mode]);

  return (
    <Textarea
      className={animationClass}
      value={clue.value}
      onChange={(e) => updateClue(clue.number, clue.direction, e.target.value)}
      onFocus={() => {
        setActiveClue?.(clue.number, clue.direction);
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

interface EditableClueProps extends ClueInputProps {
  allowEdit?: boolean;
}

function EditableClue({
  clue,
  updateClue,
  setActiveClue,
  mode,
  allowEdit = true,
}: EditableClueProps) {
  return (
    <div className={styles.clueContainer}>
      {allowEdit ? (
        <>
          <ClueInput
            clue={clue}
            updateClue={updateClue}
            setActiveClue={setActiveClue}
            mode={mode}
          />
          <ClueText clue={clue} mode={mode} />
        </>
      ) : (
        <span className={`${styles.clueText}`}>{clue.value}</span>
      )}
    </div>
  );
}

export default EditableClue;
