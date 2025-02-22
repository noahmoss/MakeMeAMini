import { Settings, Link, HelpCircle } from "react-feather";
import { useDisclosure } from "@mantine/hooks";
import { Button } from "@mantine/core";

import Logo from "../Logo";
import SettingsModal, { SettingsProps } from "../SettingsModal";

import styles from "./Header.module.css";

function Header({ settingsProps }: { settingsProps: SettingsProps }) {
  const [settingsOpen, { open, close }] = useDisclosure(false);

  return (
    <>
      <SettingsModal isOpen={settingsOpen} onClose={close} settingsProps={settingsProps} />
      <div className={styles.siteHeader}>
        <Logo />
        <div className={styles.iconGroup}>
          <Button variant="subtle" color="dark" onClick={open}>
            <Settings />
          </Button>
          <Button variant="subtle" color="dark">
            <Link />
          </Button>
          <Button variant="subtle" color="dark">
            <HelpCircle />
          </Button>
        </div>
      </div>
    </>
  );
}

export default Header;
