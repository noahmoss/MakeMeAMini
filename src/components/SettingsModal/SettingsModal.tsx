import { AlertCircle, Info } from "react-feather";
import {
  Alert,
  Button,
  Flex,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Tooltip,
} from "@mantine/core";
import { useState } from "react";
import { Mode } from "../Game";

const RowCountChangeConfirmation = ({
  confirmRowCount,
}: {
  confirmRowCount: () => void;
}) => {
  return (
    <Alert variant="light" color="red" icon={<AlertCircle />}>
      <Flex justify={"space-between"}>
        Changing the grid size will reset the puzzle!
        <Button color="red" variant="light" onClick={confirmRowCount}>
          Confirm
        </Button>
      </Flex>
    </Alert>
  );
};

export interface Settings {
  rowCount: number;
  setRowCount: (count: number) => void;
  symmetry: boolean;
  setSymmetry: (symmetry: boolean) => void;
}

type SettingsProps = Settings & {
  closeSettings: () => void;
  setMode: (mode: Mode) => void;
};

function Settings({
  closeSettings,
  rowCount,
  setRowCount,
  symmetry,
  setSymmetry,
  setMode,
}: SettingsProps) {
  const [tentativeRowCount, setTentativeRowCount] = useState<
    number | undefined
  >();

  const confirmRowCount = () => {
    if (tentativeRowCount) {
      setRowCount(tentativeRowCount);
    }
    closeSettings();
    setMode("editing");
  };

  return (
    <Stack gap={"md"}>
      <Select
        label="Grid dimensions"
        value={`${tentativeRowCount || rowCount}`}
        onChange={(value) => {
          value && setTentativeRowCount(parseInt(value));
        }}
        data={[
          { value: "5", label: "5x5" },
          { value: "6", label: "6x6" },
          { value: "7", label: "7x7" },
          { value: "8", label: "8x8" },
          { value: "9", label: "9x9" },
        ]}
      />
      {tentativeRowCount && (
        <RowCountChangeConfirmation confirmRowCount={confirmRowCount} />
      )}

      <Group justify="space-between">
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
      </Group>
    </Stack>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  closeSettings: () => void;
  settingsProps: Settings;
  setMode: (mode: Mode) => void;
}

function SettingsModal({
  isOpen,
  closeSettings,
  setMode,
  settingsProps,
}: SettingsModalProps) {
  return (
    <Modal opened={isOpen} onClose={closeSettings} title="Settings">
      <Settings
        {...settingsProps}
        closeSettings={closeSettings}
        setMode={setMode}
      />
    </Modal>
  );
}

export default SettingsModal;
