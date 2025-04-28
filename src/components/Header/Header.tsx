import { MouseEventHandler, ReactNode, useEffect, useState } from "react";

import { Edit3, Settings, Link, HelpCircle, Tool } from "react-feather";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import { Button, Tooltip, Burger, Drawer } from "@mantine/core";

import Logo from "../Logo";
import SettingsModal, { SettingsProps } from "../SettingsModal";
import styles from "./Header.module.css";
import { Mode } from "../Game";

interface TimerProps {
  mode: Mode;
}

function Timer({ mode }: TimerProps) {
  const [visible, setVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (mode === "editing") {
      setSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  useEffect(() => {
    if (mode === "solving") {
      setVisible(true);
      setAnimationClass("fadeIn");
    } else {
      setAnimationClass("fadeOut");
      // delay hiding until fade-out finishes
      const timeout = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [mode]);

  if (!visible) return null;

  const date = new Date(0);
  date.setSeconds(seconds);
  const timeStringStart = seconds < 3600 ? 14 : 11;
  const timeStringEnd = 19;
  const timeString = date
    .toISOString()
    .substring(timeStringStart, timeStringEnd);

  return (
    <div className={`${styles.timer} ${animationClass}`}>{timeString}</div>
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
  mode: Mode;
  setMode: (mode: Mode) => void;
  openSettings: () => void;
}

function HeaderActions({ mode, setMode, openSettings }: HeaderActionsProps) {
  const debouncedSetMode = useDebouncedCallback((mode: Mode) => {
    setMode(mode);
  }, 200)

  return (
    <div className={styles.iconGroup}>
      {mode === "editing" ? (
        <ActionButton label="Solve" onClick={() => debouncedSetMode("solving")}>
          <div className={styles.iconAndLabel}>
            <Edit3 />
            <div className={styles.actionButtonLabel}>Test solve</div>
          </div>
        </ActionButton>
      ) : (
        <ActionButton label="Edit" onClick={() => debouncedSetMode("editing")}>
          <div className={styles.iconAndLabel}>
            <Tool />
            <div className={styles.actionButtonLabel}>Edit</div>
          </div>
        </ActionButton>
      )}
      <ActionButton label="Settings" onClick={openSettings}>
        <div className={styles.iconAndLabel}>
          <Settings />
          <div className={styles.actionButtonLabel}>Settings</div>
        </div>
      </ActionButton>
      <ActionButton label="Share">
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
  settingsProps: SettingsProps;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

function Header({ settingsProps, setMode, mode }: HeaderProps) {
  const [burgerOpen, { toggle: toggleBurger }] = useDisclosure(false);
  const [settingsOpen, { open: openSettings, close: closeSettings }] =
    useDisclosure(false);

  return (
    <>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={closeSettings}
        settingsProps={settingsProps}
      />
      <div className={styles.siteHeader}>
        <Logo />
        <Timer mode={mode} />
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
          styles={{
            inner: {
              marginTop: "calc(var(--header-height) - 4px)",
            },
          }}
          className={styles.sidebar}
        >
          <div className={styles.mobileHeaderActionsWrapper}>
            <HeaderActions
              mode={mode}
              setMode={(mode: Mode) => {
                toggleBurger();
                setMode(mode);
              }}
              openSettings={() => {
                toggleBurger();
                openSettings();
              }}
            />
          </div>
        </Drawer>
        {/* Large screens - actions are in the header */}
        <div className={styles.desktopHeaderActionsWrapper}>
          <HeaderActions
            openSettings={openSettings}
            mode={mode}
            setMode={setMode}
          />
        </div>
      </div>
    </>
  );
}

export default Header;
