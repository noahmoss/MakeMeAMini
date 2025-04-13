import styles from "./SettingsModal.module.css";

import { Modal, Select, Switch } from "@mantine/core";

export type SettingsProps = {
  rowCount: number;
  setRowCount: (count: number) => void;
  symmetry: boolean,
  setSymmetry: (symmetry: boolean) => void;
};

function Settings({ rowCount, setRowCount, symmetry, setSymmetry }: SettingsProps) {
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
      <Switch
        label="Rotational symmetry"
        checked={symmetry}
        onChange={(event) => setSymmetry(event.currentTarget.checked)}
      />
    </div>
  );
}

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  settingsProps: SettingsProps;
};

function SettingsModal({ isOpen, onClose, settingsProps }: SettingsModalProps) {
  return (
    <Modal opened={isOpen} onClose={onClose} title="Settings">
      <Settings {...settingsProps} />
    </Modal>
  );
}

export default SettingsModal;
