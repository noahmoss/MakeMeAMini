import { MouseEventHandler, ReactNode, useEffect, useRef } from "react";

import { Settings as SettingsIcon, Link, HelpCircle } from "react-feather";

import { useDisclosure } from "@mantine/hooks";
import {
  Button,
  Tooltip,
  Burger,
  Drawer,
  Modal,
  Flex,
  Title,
} from "@mantine/core";

import { Logo } from "../Logo";
import SettingsModal, { Settings } from "../SettingsModal";
import SharingModal from "../SharingModal";
import styles from "./Header.module.css";
import { Mode } from "../Game";
import { Clues } from "../Clues";
import { Cell } from "../Grid";

interface TimerProps {
  mode: Mode;
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
}

function Timer({ mode, seconds, setSeconds }: TimerProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (mode === "editing") {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        setSeconds((s: number) => s + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, setSeconds]);

  if (mode !== "solving") return null;

  const date = new Date(0);
  date.setSeconds(seconds);
  const timeStringStart = seconds < 3600 ? 14 : 11;
  const timeStringEnd = 19;
  const timeString = date
    .toISOString()
    .substring(timeStringStart, timeStringEnd);

  const pause = () => {
    open();
    isPausedRef.current = true;
  };

  const unpause = () => {
    close();
    isPausedRef.current = false;
  };

  return (
    <>
      <div className={styles.timerContainer}>
        <div className={styles.timer}>{timeString}</div>
        <Button
          variant="transparent"
          px="0px"
          onClick={pause}
          fz="1.2rem"
          lts=".1rem"
          color="black"
        >
          ||
        </Button>
      </div>
      <Modal
        opened={opened}
        onClose={unpause}
        overlayProps={{
          backgroundOpacity: 0.45,
          blur: 4,
        }}
        withCloseButton={false}
        yOffset={"250px"}
      >
        <Flex direction="column" gap="2rem" align={"center"}>
          <Title order={3}>Your game is paused.</Title>
          <Button
            onClick={unpause}
            style={{
              backgroundColor: "var(--dark-blue)",
              color: "white",
            }}
          >
            Resume
          </Button>
        </Flex>
      </Modal>
    </>
  );
}

interface ActionButtonProps {
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}

function ActionButton({ label, onClick, children }: ActionButtonProps) {
  return (
    <Tooltip label={label} withArrow={true} className={styles.tooltip}>
      <Button
        variant="subtle"
        color="black"
        size="compact-xl"
        className={styles.actionButton}
        onClick={onClick}
        fullWidth={true}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

interface HeaderActionsProps {
  openSettings: () => void;
  openSharing: () => void;
}

function HeaderActions({ openSettings, openSharing }: HeaderActionsProps) {
  return (
    <div className={styles.iconGroup}>
      <ActionButton label="Settings" onClick={openSettings}>
        <div className={styles.iconAndLabel}>
          <SettingsIcon />
          <div className={styles.actionButtonLabel}>Settings</div>
        </div>
      </ActionButton>
      <ActionButton label="Share" onClick={openSharing}>
        <div className={styles.iconAndLabel}>
          <Link />
          <div className={styles.actionButtonLabel}>Share</div>
        </div>
      </ActionButton>
      <ActionButton label="Help">
        <div className={styles.iconAndLabel}>
          <HelpCircle />
          <div className={styles.actionButtonLabel}>Help</div>
        </div>
      </ActionButton>
    </div>
  );
}

interface HeaderProps {
  settingsProps: Settings;
  mode: Mode;
  setMode: (mode: Mode) => void;
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  cells: Cell[][];
  clues: Clues;
}

function Header({
  settingsProps,
  setMode,
  mode,
  seconds,
  setSeconds,
  cells,
  clues,
}: HeaderProps) {
  const [burgerOpen, { toggle: toggleBurger }] = useDisclosure(false);
  const [settingsOpen, { open: openSettings, close: closeSettings }] =
    useDisclosure(false);
  const [sharingOpen, { open: openSharing, close: closeSharing }] =
    useDisclosure(false);

  return (
    <>
      <SettingsModal
        isOpen={settingsOpen}
        closeSettings={closeSettings}
        settingsProps={settingsProps}
        setMode={setMode}
      />
      <SharingModal
        isOpen={sharingOpen}
        closeSharing={closeSharing}
        cells={cells}
        clues={clues}
      />

      <div className={styles.siteHeader}>
        <Logo />
        <Timer mode={mode} seconds={seconds} setSeconds={setSeconds} />
        <Burger
          opened={burgerOpen}
          onClick={toggleBurger}
          className={styles.hamburgerMenu}
        />
        {/* Small screens - use a drawer */}
        <Drawer
          position="right"
          opened={burgerOpen}
          withOverlay={false}
          withCloseButton={false}
          onClose={toggleBurger}
          size="xs"
          shadow="0"
          styles={{
            inner: {
              marginTop: "calc(var(--small-header-height) - 4px)",
            },
          }}
          className={styles.sidebar}
        >
          <div className={styles.mobileHeaderActionsWrapper}>
            <HeaderActions
              openSettings={() => {
                toggleBurger();
                openSettings();
              }}
              openSharing={() => {
                toggleBurger();
                openSharing();
              }}
            />
          </div>
        </Drawer>
        {/* Large screens - actions are in the header */}
        <div className={styles.desktopHeaderActionsWrapper}>
          <HeaderActions
            openSettings={openSettings}
            openSharing={openSharing}
          />
        </div>
      </div>
    </>
  );
}

export default Header;
