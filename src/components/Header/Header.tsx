import { MouseEventHandler, ReactNode } from "react";

import { Play, Edit3, Settings, Link, HelpCircle, Tool } from "react-feather";
import { useDisclosure } from "@mantine/hooks";
import { Button, Tooltip, Burger, Drawer } from "@mantine/core";

import Logo from "../Logo";
import SettingsModal, { SettingsProps } from "../SettingsModal";
import styles from "./Header.module.css";
import { Mode } from "../Game";

type ActionButtonProps = {
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>,
  children?: ReactNode,
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
  )
}

type HeaderActionsProps = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  openSettings: () => void;
};

function HeaderActions({ mode, setMode, openSettings }: HeaderActionsProps) {
  return (
    <div className={styles.iconGroup}>
      {mode === "editing" ? (
        <ActionButton label="Test solve" onClick={() => setMode("solving")} >
          <div className={styles.iconAndLabel}>
            <Edit3 />
            <div className={styles.actionButtonLabel}>
              Test solve
            </div>
          </div>
        </ActionButton>
      ) : (
        <ActionButton label="Edit grid" onClick={() => setMode("editing")} >
          <div className={styles.iconAndLabel}>
            <Tool />
            <div className={styles.actionButtonLabel}>
              Edit
            </div>
          </div>
        </ActionButton>
      )}
      <ActionButton label="Settings" onClick={openSettings} >
        <div className={styles.iconAndLabel}>
          <Settings />
          <div className={styles.actionButtonLabel}>
            Settings
          </div>
        </div>
      </ActionButton>
      <ActionButton label="Share">
        <div className={styles.iconAndLabel}>
          <Link />
          <div className={styles.actionButtonLabel}>
            Share
          </div>
        </div>
      </ActionButton>
      <ActionButton label="Help">
        <div className={styles.iconAndLabel}>
          <HelpCircle />
          <div className={styles.actionButtonLabel}>
            Help
          </div>
        </div>
      </ActionButton>
    </div>
  )
}

type HeaderProps = {
  settingsProps: SettingsProps;
  mode: Mode;
  setMode: (mode: Mode) => void;
};

function Header({ settingsProps, setMode, ...delegated }: HeaderProps) {
  const [burgerOpen, { toggle: toggleBurger }] = useDisclosure(false);
  const [settingsOpen, { open: openSettings, close: closeSettings }] = useDisclosure(false);

  return (
    <>
      <SettingsModal
        isOpen={settingsOpen}
        onClose={closeSettings}
        settingsProps={settingsProps}
      />
      <div className={styles.siteHeader}>
        <Logo />
        <Burger opened={burgerOpen} onClick={toggleBurger} className={styles.hamburgerMenu} />
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
            }
          }}
          className={styles.sidebar}
        >
          <div className={styles.mobileHeaderActionsWrapper}>
            <HeaderActions
              {...delegated}
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
            setMode={setMode}
            {...delegated}
          />
        </div>
      </div>
    </>
  );
}

export default Header;
