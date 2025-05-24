import { Modal } from "@mantine/core";

interface SharingModalProps {
  isOpen: boolean;
  closeSharing: () => void;
}

function SharingModal({ isOpen, closeSharing }: SharingModalProps) {
  return (
    <Modal
      opened={isOpen}
      onClose={closeSharing}
      title="Share your crossword"
    ></Modal>
  );
}

export default SharingModal;
