import { ChevronLeft, ChevronRight } from "react-feather";
import { ClueDirection } from "../Clues";
import { MovementDirection } from "../Game";

import styles from "./ActiveClue.module.css";

type ActiveClueProps = {
  clueNumber: number;
  clueDir: ClueDirection;
  clueText: string;
  skipWord: (direction: MovementDirection) => void;
};

function ActiveClue({
  clueNumber,
  clueDir,
  clueText,
  skipWord,
}: ActiveClueProps) {
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
          {`${clueNumber}${clueDir.charAt(0).toUpperCase()}`}
        </div>
        <div>{clueText}</div>
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
