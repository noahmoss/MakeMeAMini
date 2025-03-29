import { Modal, Select } from "@mantine/core";

export type SettingsProps = {
  rowCount: number;
  setRowCount: (count: number) => void;
};

function Settings({ rowCount, setRowCount }: SettingsProps) {
  return (
    <Select
      label="Grid dimensions"
      value={`${rowCount}`}
      onChange={(value) => {
        console.log(value);
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
