import { IconBackspace } from "@tabler/icons-react";
import styles from "./Keyboard.module.css";
import { ReactNode } from "react";
import { LogoSpace } from "../Logo";

function Letter({ value }: { value: ReactNode }) {
  return <div className={styles.letter}>{value}</div>;
}

function Keyboard() {
  return (
    <div className={styles.keyboard}>
      <div className={styles.row}>
        <Letter value={"Q"} />
        <Letter value={"W"} />
        <Letter value={"E"} />
        <Letter value={"R"} />
        <Letter value={"T"} />
        <Letter value={"Y"} />
        <Letter value={"U"} />
        <Letter value={"I"} />
        <Letter value={"O"} />
        <Letter value={"P"} />
      </div>
      <div className={styles.row}>
        <Letter value={"A"} />
        <Letter value={"S"} />
        <Letter value={"D"} />
        <Letter value={"F"} />
        <Letter value={"G"} />
        <Letter value={"H"} />
        <Letter value={"J"} />
        <Letter value={"K"} />
        <Letter value={"L"} />
      </div>
      <div className={styles.row}>
        <Letter value={<LogoSpace />} />
        <Letter value={"Z"} />
        <Letter value={"X"} />
        <Letter value={"C"} />
        <Letter value={"V"} />
        <Letter value={"B"} />
        <Letter value={"N"} />
        <Letter value={"M"} />
        <Letter value={<IconBackspace />} />
      </div>
    </div>
  );
}

export default Keyboard;
