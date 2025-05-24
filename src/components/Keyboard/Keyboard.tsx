import { IconBackspace } from "@tabler/icons-react";
import styles from "./Keyboard.module.css";
import { ReactNode } from "react";
import { LogoSpace } from "../Logo";
import { Mode } from "../Game";

interface KeyButtonProps {
  value: string;
  children: ReactNode;
  onClick: (value: string) => void;
}

function KeyButton({ value, children, onClick }: KeyButtonProps) {
  const isFunctionKey = value === "BLACK" || value === "BACKSPACE";

  return (
    <button
      className={`${styles.letter} ${isFunctionKey && styles.functionKey}`}
      onClick={() => onClick(value)}
      type="button"
      aria-label={`Key ${value}`}
    >
      {children}
    </button>
  );
}

interface KeyboardProps {
  mode: Mode;
  setCurrentCellValue: (value: string) => void;
  toggleCurrentFilledCell: () => void;
  advanceCursor: () => void;
  reverseCursor: () => void;
}

const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["BLACK", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

function Keyboard({
  mode,
  setCurrentCellValue,
  toggleCurrentFilledCell,
  advanceCursor,
  reverseCursor,
}: KeyboardProps) {
  const renderKey = (key: string) => {
    switch (key) {
      case "BLACK":
        return mode === "editing" && <LogoSpace />;
      case "BACKSPACE":
        return <IconBackspace />;
      default:
        return key;
    }
  };

  const onClick = (key: string) => {
    switch (key) {
      case "BLACK": {
        toggleCurrentFilledCell();
        return;
      }
      case "BACKSPACE": {
        setCurrentCellValue(" ");
        reverseCursor();
        return;
      }
      default: {
        setCurrentCellValue(key);
        advanceCursor();
      }
    }
  };

  return (
    <div className={styles.keyboard}>
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((key) => {
            const keyElement = renderKey(key);
            return (
              keyElement && (
                <KeyButton key={key} value={key} onClick={onClick}>
                  {renderKey(key)}
                </KeyButton>
              )
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;
