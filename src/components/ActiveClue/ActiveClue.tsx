import { ChevronLeft, ChevronRight } from "react-feather";
import { NumberedClue, updateClueFn } from "../Clues";
import { MovementDirection } from "../Game";

import styles from "./ActiveClue.module.css";
import { Textarea } from "@mantine/core";

type ActiveClueProps = {
  clue?: NumberedClue;
  skipWord: (direction: MovementDirection) => void;
  updateClue: updateClueFn;
};

function ActiveClue({ clue, skipWord, updateClue }: ActiveClueProps) {
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
        <div className={styles.activeClueValue}>{clue?.value}</div>
        {clue && (
          <Textarea
            className={styles.activeClueInput}
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
