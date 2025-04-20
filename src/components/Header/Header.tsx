import { Play, Edit3, Settings, Link, HelpCircle } from "react-feather";
import { useDisclosure } from "@mantine/hooks";
import { Button, Tooltip } from "@mantine/core";

import Logo from "../Logo";
import SettingsModal, { SettingsProps } from "../SettingsModal";

import styles from "./Header.module.css";
import { Mode } from "../Game";

type HeaderProps = {
  settingsProps: SettingsProps;
  mode: Mode;
  setMode: (mode: Mode) => void;
};

function Header({ settingsProps, mode, setMode }: HeaderProps) {
  const [settingsOpen, { open, close }] = useDisclosure(false);

  const modeButtonTooltip =
    mode === "editing" ? "Solve crossword" : "Edit crossword";

  return (
    <>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={close}
        settingsProps={settingsProps}
      />
      <div className={styles.siteHeader}>
        <Logo />
        <div className={styles.iconGroup}>
          <Tooltip label={modeButtonTooltip} withArrow={true}>
            {mode === "editing" ? (
              <Button
                variant="subtle"
                color="black"
                size="compact-xl"
                onClick={() => setMode("solving")}
              >
                <Play />
              </Button>
            ) : (
              <Button
                variant="subtle"
                color="black"
                size="compact-xl"
                onClick={() => setMode("editing")}
              >
                <Edit3 />
              </Button>
            )}
          </Tooltip>
          <Tooltip label="Settings" withArrow={true}>
            <Button
              variant="subtle"
              color="black"
              size="compact-xl"
              onClick={open}
            >
              <Settings />
            </Button>
          </Tooltip>
          <Tooltip label="Share" withArrow={true}>
            <Button variant="subtle" color="black" size="compact-xl">
              <Link />
            </Button>
          </Tooltip>
          <Tooltip label="Help" withArrow={true}>
            <Button variant="subtle" color="black" size="compact-xl">
              <HelpCircle />
            </Button>
          </Tooltip>
        </div>
      </div>
    </>
  );
}

export default Header;
