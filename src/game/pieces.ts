import { Piece, PieceShape } from "./types";

/**
 * All shapes are defined as [row, col] offsets from an implicit (0,0) origin.
 * Kept deliberately varied (1..5 cells) so the tray always presents
 * meaningful placement decisions rather than trivial ones.
 */
const SHAPES: PieceShape[] = [
  // Single
  [{ row: 0, col: 0 }],
  // Domino
  [{ row: 0, col: 0 }, { row: 0, col: 1 }],
  [{ row: 0, col: 0 }, { row: 1, col: 0 }],
  // Tromino - line
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
  [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }],
  // Tromino - L
  [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }],
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }],
  [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
  // Square (2x2)
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
  // Tetromino - line
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }],
  [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }],
  // Tetromino - T
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }],
  // Tetromino - S/Z
  [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
  // Pentomino - plus
  [
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 2, col: 1 },
  ],
  // Big L (5 cells)
  [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ],
  // 3x3 corner block
  [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
  ],
];

export const COLOR_COUNT = 6;

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `piece_${idCounter}_${Date.now()}`;
}

export function randomPiece(): Piece {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const colorIndex = Math.floor(Math.random() * COLOR_COUNT);
  return { id: nextId(), shape, colorIndex };
}

export function randomTray(): Piece[] {
  return [randomPiece(), randomPiece(), randomPiece()];
}

export function pieceDimensions(shape: PieceShape): { rows: number; cols: number } {
  const maxRow = Math.max(...shape.map((c) => c.row));
  const maxCol = Math.max(...shape.map((c) => c.col));
  return { rows: maxRow + 1, cols: maxCol + 1 };
}
