import styles from "./Controls.module.css";

import { LifeBuoy, RotateCw, Flag } from "react-feather";

import { Button, Combobox, Tooltip, useCombobox } from "@mantine/core";
import { Mode } from "../Game";
import { useEffect, useState } from "react";

export type CheckOption = "Auto" | "Square" | "Word" | "Puzzle";

function ClearControls({
  clearPuzzle,
  clearTimer,
}: {
  clearPuzzle: () => void;
  clearTimer: () => void;
}) {
  const combobox = useCombobox();
  const options = {
    Incorrect: () => {},
    Puzzle: clearPuzzle,
    "Puzzle + Timer": () => {
      clearPuzzle();
      clearTimer();
    },
  } as const;
  type ClearOption = keyof typeof options;

  return (
    <Combobox
      store={combobox}
      position="bottom-end"
      width={140}
      onOptionSubmit={(option: string) => {
        options[option as ClearOption]();
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Tooltip label="Clear" withArrow={true}>
          <Button
            variant="subtle"
            color="black"
            size="compact-md"
            onClick={() => combobox.openDropdown()}
          >
            <RotateCw size="20" />
          </Button>
        </Tooltip>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {Object.keys(options).map((option) => (
            <Combobox.Option value={option} key={option}>
              {option}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

type CheckControlsProps = {
  check: CheckOption;
  setCheck: (option: CheckOption | null) => void;
};

function CheckControls({ check, setCheck }: CheckControlsProps) {
  const combobox = useCombobox();
  const options = ["Auto", "Square", "Word", "Puzzle"];

  return (
    <Combobox
      store={combobox}
      position="bottom"
      width={80}
      onOptionSubmit={(option: string) => {
        setCheck(option as CheckOption);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Tooltip label="Check" withArrow={true}>
          <Button
            variant="subtle"
            color="black"
            size="compact-md"
            onClick={() => combobox.openDropdown()}
          >
            <LifeBuoy size="20" />
          </Button>
        </Tooltip>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {options.map((option) => (
            <Combobox.Option value={option} key={option} active>
              {option}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

function RevealControls() {
  const combobox = useCombobox();
  const options = ["Square", "Word", "Puzzle"];

  return (
    <Combobox store={combobox} position="bottom" width={80}>
      <Combobox.Target>
        <Tooltip label="Reveal" withArrow={true}>
          <Button
            variant="subtle"
            color="black"
            size="compact-md"
            onClick={() => combobox.openDropdown()}
          >
            <Flag size="20" />
          </Button>
        </Tooltip>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {options.map((option) => (
            <Combobox.Option value={option} key={option}>
              {option}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

interface ControlsProps {
  mode: Mode;
  clearPuzzle: () => void;
  clearTimer: () => void;
  check: CheckOption | null;
  setCheck: (option: CheckOption | null) => void;
}

function Controls({
  mode,
  clearPuzzle,
  clearTimer,
  check,
  setCheck,
}: ControlsProps) {
  // TODO: extract animation logic into a hook
  const [visible, setVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    if (mode === "solving") {
      setVisible(true);
      setAnimationClass(styles.fadeIn);
    } else {
      setAnimationClass(styles.fadeOut);
      const timeout = setTimeout(() => {
        setVisible(false);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [mode]);

  if (!visible) return;

  return (
    <div className={`${styles.controls} ${animationClass}`}>
      <ClearControls clearPuzzle={clearPuzzle} clearTimer={clearTimer} />
      <CheckControls check={check} setCheck={setCheck} />
      <RevealControls />
    </div>
  );
}

export default Controls;
