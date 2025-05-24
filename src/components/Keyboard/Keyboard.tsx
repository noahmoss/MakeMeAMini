import { IconBackspace } from "@tabler/icons-react";
import styles from "./Keyboard.module.css";
import { ReactNode } from "react";
import { LogoSpace } from "../Logo";
import { Mode } from "../Game";

interface KeyButtonProps {
  value: string;
  children: ReactNode;
  onClick: (value: string) => void;
  clickToFill: boolean;
}

function KeyButton({ value, children, onClick, clickToFill }: KeyButtonProps) {
  const isFunctionKey = value === "BLACK" || value === "BACKSPACE";
  const clickToFillEnabled = value === "BLACK" && clickToFill;

  return (
    <button
      className={`${styles.letter}
                  ${isFunctionKey && styles.functionKey}
                  ${clickToFillEnabled && styles.clickToFillEnabled}`}
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
  advanceCursor: () => void;
  reverseCursor: () => void;
  clickToFill: boolean;
  setClickToFill: (enabled: boolean) => void;
}

const KEYBOARD_LAYOUT = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["BLACK", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
] as const;

export function Keyboard({
  mode,
  setCurrentCellValue,
  advanceCursor,
  reverseCursor,
  clickToFill,
  setClickToFill,
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
        setClickToFill(!clickToFill);
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
                <KeyButton
                  key={key}
                  value={key}
                  onClick={onClick}
                  clickToFill={clickToFill}
                >
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
