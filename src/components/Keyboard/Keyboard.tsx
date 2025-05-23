import { IconBackspace } from "@tabler/icons-react";
import styles from "./Keyboard.module.css";
import { ReactNode } from "react";
import { LogoSpace } from "../Logo";

interface KeyButtonProps {
  value: string;
  children: ReactNode;
  onClick: (value: string) => void;
}

function KeyButton({ value, children, onClick }: KeyButtonProps) {
  return (
    <button
      className={styles.letter}
      onClick={() => onClick(value)}
      type="button"
      aria-label={`Key ${value}`}
    >
      {children}
    </button>
  );
}

interface KeyboardProps {
  setCurrentCellValue: (value: string) => void;
}

const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

function Keyboard({ setCurrentCellValue }: KeyboardProps) {
  const renderKey = (key: string) => {
    switch (key) {
      case "ENTER":
        return <LogoSpace />;
      case "BACKSPACE":
        return <IconBackspace />;
      default:
        return key;
    }
  };

  return (
    <div className={styles.keyboard}>
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((key) => (
            <KeyButton key={key} value={key} onClick={setCurrentCellValue}>
              {renderKey(key)}
            </KeyButton>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
