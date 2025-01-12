import styles from "./Grid.module.css";

export interface Cell {
  filled: boolean;
  value: string;
}

type GridProps = {
  cells: Cell[][];
};

function Grid({ cells }: GridProps) {
  return <div />;
}

export default Grid;
