import styles from "./Controls.module.css";

import { LifeBuoy, RotateCw, Flag } from "react-feather";

import { Button, Tooltip } from "@mantine/core";
import { Mode } from "../Game";

type ControlsProps = {
  mode: Mode;
};

function Controls({ mode }: ControlsProps) {
  const visibilityClass = mode === "solving" ? styles.visible : styles.hidden;

  return (
    <div className={`${styles.controls} ${visibilityClass}`}>
      <Tooltip label="Clear grid" withArrow={true}>
        <Button variant="subtle" color="black" size="compact-md">
          <RotateCw size="20" />
        </Button>
      </Tooltip>
      <Tooltip label="Check" withArrow={true}>
        <Button variant="subtle" color="black" size="compact-md">
          <LifeBuoy size="20" />
        </Button>
      </Tooltip>
      <Tooltip label="Reveal" withArrow={true}>
        <Button variant="subtle" color="black" size="compact-md">
          <Flag size="20" />
        </Button>
      </Tooltip>
    </div>
  );
}

export default Controls;
