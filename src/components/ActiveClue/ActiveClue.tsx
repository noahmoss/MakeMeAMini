import { ChevronLeft, ChevronRight } from "react-feather";
import { NumberedClue, updateClueFn } from "../Clues";
import { Mode, MovementDirection } from "../Game";

import { useMediaQuery } from "@mantine/hooks";

import styles from "./ActiveClue.module.css";
import EditableClue from "../Clues/EditableClue";

interface ActiveClueProps {
  clue?: NumberedClue;
  skipWord: (direction: MovementDirection) => void;
  updateClue: updateClueFn;
  mode: Mode;
}

function ActiveClue({ clue, skipWord, updateClue, mode }: ActiveClueProps) {
  const disallowEdit = useMediaQuery("(min-width: 600px)");

  return (
    <div className={styles.activeClue}>
      <button
        className={styles.clueSkipButton}
        onClick={() => skipWord("backwards")}
      >
        <ChevronLeft className={styles.clueSkipChevron} />
      </button>
      <div className={styles.activeClueContent}>
        <div className={styles.activeClueLabel}>
          {clue && `${clue.number}${clue.direction.charAt(0).toUpperCase()}`}
        </div>
        {clue && (
          <EditableClue
            clue={clue}
            updateClue={updateClue}
            mode={mode}
            allowEdit={!disallowEdit}
          />
        )}
      </div>
      <button
        className={styles.clueSkipButton}
        onClick={() => skipWord("forwards")}
      >
        <ChevronRight className={styles.clueSkipChevron} />
      </button>
    </div>
  );
}

export default ActiveClue;
