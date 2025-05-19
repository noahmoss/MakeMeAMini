import { useEffect, useState } from "react";
import { Mode } from "../Game";
import { ClueDirection, NumberedClue, updateClueFn } from "./Clues";

import styles from "./Clues.module.css";
import { Textarea } from "@mantine/core";

interface ClueTextProps {
  clue: NumberedClue;
  mode: Mode;
}

function ClueText({ clue, mode }: ClueTextProps) {
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

interface EditableClueProps extends ClueInputProps {}

function EditableClue({
  clue,
  updateClue,
  setActiveClue,
  mode,
}: EditableClueProps) {
  return (
    <div className={styles.clueContainer}>
      <ClueInput
        clue={clue}
        updateClue={updateClue}
        setActiveClue={setActiveClue}
        mode={mode}
      />
      <ClueText clue={clue} mode={mode} />
    </div>
  );
}

export default EditableClue;
