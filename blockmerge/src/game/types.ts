export const GRID_SIZE = 8;

export type Cell = 0 | 1; // 0 = empty, 1 = filled
export type Grid = Cell[][]; // Grid[row][col]

export type Coord = { row: number; col: number };

/** A piece is defined by its filled cells relative to a top-left origin. */
export type PieceShape = Coord[];

export type Piece = {
  id: string;
  shape: PieceShape;
  colorIndex: number;
};

export type GameState = {
  grid: Grid;
  tray: (Piece | null)[]; // 3 slots, null once placed
  score: number;
  best: number;
  combo: number; // consecutive clears without a non-clearing placement
  isGameOver: boolean;
};
