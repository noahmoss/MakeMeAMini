import {
  ActionIcon,
  CopyButton,
  Modal,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { Cell } from "../Grid";
import { Clues } from "../Clues";
import { serializeCrossword } from "./utils";
import { IconCopy, IconCheck } from "@tabler/icons-react";

interface SharingModalProps {
  isOpen: boolean;
  closeSharing: () => void;
  cells: Cell[][];
  clues: Clues;
}

function Copy({ url }: { url: string }) {
  return (
    <CopyButton value={url} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="right">
          <ActionIcon
            color={copied ? "teal" : "gray"}
            variant="subtle"
            onClick={copy}
          >
            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
}

function SharingModal({
  isOpen,
  closeSharing,
  cells,
  clues,
}: SharingModalProps) {
  const longUrl = `https://makemeamini.com/?puz=${serializeCrossword(cells, clues)}`;
  const longCopyButton = <Copy url={longUrl} />;

  return (
    <Modal
      opened={isOpen}
      onClose={closeSharing}
      title="Share your crossword"
      centered
    >
      <TextInput
        value={longUrl}
        readOnly
        variant="default"
        rightSection={longCopyButton}
      ></TextInput>
    </Modal>
  );
}

export default SharingModal;
