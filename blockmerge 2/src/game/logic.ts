import { GRID_SIZE, Grid, Piece, PieceShape } from "./types";
import { randomTray } from "./pieces";

export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

/** Can `shape` be placed with its origin at (row, col) on `grid`? */
export function canPlace(grid: Grid, shape: PieceShape, row: number, col: number): boolean {
  for (const cell of shape) {
    const r = row + cell.row;
    const c = col + cell.col;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    if (grid[r][c] === 1) return false;
  }
  return true;
}

/** Does at least one valid placement of `shape` exist anywhere on `grid`? */
export function hasAnyValidPlacement(grid: Grid, shape: PieceShape): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlace(grid, shape, r, c)) return true;
    }
  }
  return false;
}

/** Returns a NEW grid with `shape` stamped at (row, col). Caller must validate with canPlace first. */
export function placePiece(grid: Grid, shape: PieceShape, row: number, col: number): Grid {
  const next = grid.map((r) => [...r]);
  for (const cell of shape) {
    next[row + cell.row][col + cell.col] = 1;
  }
  return next;
}

export type ClearResult = {
  grid: Grid;
  rowsCleared: number;
  colsCleared: number;
};

/** Finds and clears any fully-filled rows/columns. Returns the new grid and counts. */
export function clearLines(grid: Grid): ClearResult {
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((cell) => cell === 1)) fullRows.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid.every((row) => row[c] === 1)) fullCols.push(c);
  }

  if (fullRows.length === 0 && fullCols.length === 0) {
    return { grid, rowsCleared: 0, colsCleared: 0 };
  }

  const next = grid.map((row, r) =>
    row.map((cell, c) => {
      if (fullRows.includes(r) || fullCols.includes(c)) return 0;
      return cell;
    })
  );

  return { grid: next, rowsCleared: fullRows.length, colsCleared: fullCols.length };
}

/**
 * Scoring:
 * - 1 point per filled cell placed
 * - Line clears: 10 points per line, scaled by lines cleared this move (bonus for multi-clears)
 * - Combo: consecutive placements (across turns) that each clear at least one line
 *   add a growing streak bonus.
 */
export function scoreForPlacement(cellsPlaced: number): number {
  return cellsPlaced;
}

export function scoreForClear(linesCleared: number, comboStreak: number): number {
  if (linesCleared === 0) return 0;
  const base = linesCleared * 10;
  const multiClearBonus = linesCleared > 1 ? (linesCleared - 1) * 15 : 0;
  const comboBonus = comboStreak > 0 ? comboStreak * 5 : 0;
  return base + multiClearBonus + comboBonus;
}

/** True if the game is over: none of the remaining tray pieces fit anywhere. */
export function isGameOver(grid: Grid, tray: (Piece | null)[]): boolean {
  const remaining = tray.filter((p): p is Piece => p !== null);
  if (remaining.length === 0) return false; // tray about to refill
  return remaining.every((p) => !hasAnyValidPlacement(grid, p.shape));
}

export function refillTrayIfEmpty(tray: (Piece | null)[]): (Piece | null)[] {
  if (tray.every((p) => p === null)) {
    return randomTray();
  }
  return tray;
}
