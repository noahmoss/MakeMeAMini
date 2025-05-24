import styles from "./Controls.module.css";

import {
  IconEraser,
  IconLifebuoy,
  IconFlag,
  IconCheck,
} from "@tabler/icons-react";

import { Button, Combobox, Flex, Tooltip, useCombobox } from "@mantine/core";
import { Mode } from "../Game";
import { useEffect, useState } from "react";

export type CheckOption = "Auto" | "Square" | "Word" | "Puzzle";

export type RevealOption = "Square" | "Word" | "Puzzle";

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
            <IconEraser size="24" />
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

interface CheckControlsProps {
  autocheck: boolean;
  check: (option: CheckOption | null) => void;
}

function CheckControls({ autocheck, check }: CheckControlsProps) {
  const combobox = useCombobox();
  const options = ["Auto", "Square", "Word", "Puzzle"];

  return (
    <Combobox
      store={combobox}
      position="bottom"
      width={80}
      onOptionSubmit={(option: string) => {
        if (option === "Auto" && autocheck) {
          // Disable autocheck if already selected
          check(null);
        } else {
          check(option as CheckOption);
        }
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
            <IconLifebuoy size="24" />
          </Button>
        </Tooltip>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {options.map((option) => {
            const active = autocheck && option === "Auto";
            return (
              <Combobox.Option value={option} key={option} active={active}>
                <Flex align={"center"} gap={".2rem"}>
                  {active && <IconCheck size="16" />}
                  {option}
                </Flex>
              </Combobox.Option>
            );
          })}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

interface RevealControlsProps {
  reveal: (option: RevealOption) => void;
}

function RevealControls({ reveal }: RevealControlsProps) {
  const combobox = useCombobox();
  const options = ["Square", "Word", "Puzzle"];

  return (
    <Combobox
      store={combobox}
      position="bottom"
      width={80}
      onOptionSubmit={(option: string) => {
        reveal(option as RevealOption);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <Tooltip label="Reveal" withArrow={true}>
          <Button
            variant="subtle"
            color="black"
            size="compact-md"
            onClick={() => combobox.openDropdown()}
          >
            <IconFlag size="24" />
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
  autocheck: boolean;
  check: (option: CheckOption | null) => void;
  reveal: (option: RevealOption) => void;
}

function Controls({
  mode,
  clearPuzzle,
  clearTimer,
  autocheck,
  check,
  reveal,
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
      <CheckControls autocheck={autocheck} check={check} />
      <RevealControls reveal={reveal} />
    </div>
  );
}

export default Controls;
