import styles from "./Controls.module.css";

import { LifeBuoy, RotateCw, Flag } from "react-feather";

import { Button, Tooltip } from "@mantine/core";
import { Mode } from "../Game";
import { useEffect, useState } from "react";

type ControlsProps = {
  mode: Mode;
};

function Controls({ mode }: ControlsProps) {
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
