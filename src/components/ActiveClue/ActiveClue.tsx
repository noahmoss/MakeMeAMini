import { ChevronLeft, ChevronRight } from "react-feather";
import { EnrichedClue } from "../Clues";
import { MovementDirection } from "../Game";

import styles from "./ActiveClue.module.css";

type ActiveClueProps = {
  clue?: EnrichedClue;
  skipWord: (direction: MovementDirection) => void;
};

function ActiveClue({ clue, skipWord }: ActiveClueProps) {
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
        <div>{clue?.value}</div>
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
