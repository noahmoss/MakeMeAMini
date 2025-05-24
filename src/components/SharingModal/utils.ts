import { Clues } from "../Clues";
import { Cell } from "../Grid";

interface SerializedCrossword {
  cells: Cell[][];
  clues: Clues;
  version: string;
}

export function serializeCrossword(cells: Cell[][], clues: Clues) {
  const data: SerializedCrossword = {
    cells,
    clues,
    version: "1.0",
  };

  return btoa(JSON.stringify(data));
}

export function deserializeCrossword(data: string) {
  const { cells, clues } = JSON.parse(atob(data)) as SerializedCrossword;
  return { cells, clues };
}
