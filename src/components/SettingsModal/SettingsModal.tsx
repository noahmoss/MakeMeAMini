import styles from "./SettingsModal.module.css";

import { Info } from "react-feather";
import { Modal, Select, Switch, Tooltip } from "@mantine/core";

export interface SettingsProps {
  rowCount: number;
  setRowCount: (count: number) => void;
  symmetry: boolean;
  setSymmetry: (symmetry: boolean) => void;
}

function Settings({
  rowCount,
  setRowCount,
  symmetry,
  setSymmetry,
}: SettingsProps) {
  return (
    <div className={styles.settingsContainer}>
      <Select
        label="Grid dimensions"
        value={`${rowCount}`}
        onChange={(value) => {
          value && setRowCount(parseInt(value));
        }}
        data={[
          { value: "5", label: "5x5" },
          { value: "6", label: "6x6" },
          { value: "7", label: "7x7" },
          { value: "8", label: "8x8" },
          { value: "9", label: "9x9" },
        ]}
      />
      <div className={styles.switchContainer}>
        <Switch
          label="Rotational symmetry"
          checked={symmetry}
          onChange={(event) => setSymmetry(event.currentTarget.checked)}
        />
        <Tooltip
          multiline
          label="When enabled, any black square you add or remove will be mirrored with 180° rotational symmetry. Existing grid squares won’t be changed."
          w={300}
          withArrow={true}
        >
          <Info size={"1.4rem"} color="gray" />
        </Tooltip>
      </div>
    </div>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsProps: SettingsProps;
}

function SettingsModal({ isOpen, onClose, settingsProps }: SettingsModalProps) {
  return (
    <Modal opened={isOpen} onClose={onClose} title="Settings">
      <Settings {...settingsProps} />
    </Modal>
  );
}

export default SettingsModal;
