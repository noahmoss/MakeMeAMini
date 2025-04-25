import { useState, useEffect } from "react";

export function useKeydownListener(key: string): boolean {
  const [keydown, setKeydown] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        setKeydown(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === key) {
        setKeydown(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [key]);

  return keydown;
}
