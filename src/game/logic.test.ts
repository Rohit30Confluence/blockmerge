import { GRID_SIZE } from "./types";
import {
  createEmptyGrid,
  canPlace,
  placePiece,
  clearLines,
  hasAnyValidPlacement,
  isGameOver,
  scoreForClear,
} from "./logic";

describe("canPlace", () => {
  it("allows placement on an empty grid within bounds", () => {
    const grid = createEmptyGrid();
    const shape = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    expect(canPlace(grid, shape, 0, 0)).toBe(true);
  });

  it("rejects placement that goes out of bounds", () => {
    const grid = createEmptyGrid();
    const shape = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    expect(canPlace(grid, shape, 0, GRID_SIZE - 1)).toBe(false);
  });

  it("rejects placement overlapping filled cells", () => {
    let grid = createEmptyGrid();
    grid = placePiece(grid, [{ row: 0, col: 0 }], 0, 0);
    const shape = [{ row: 0, col: 0 }];
    expect(canPlace(grid, shape, 0, 0)).toBe(false);
  });
});

describe("clearLines", () => {
  it("clears a fully filled row", () => {
    let grid = createEmptyGrid();
    for (let c = 0; c < GRID_SIZE; c++) {
      grid = placePiece(grid, [{ row: 0, col: 0 }], 0, c);
    }
    const result = clearLines(grid);
    expect(result.rowsCleared).toBe(1);
    expect(result.grid[0].every((cell) => cell === 0)).toBe(true);
  });

  it("clears a fully filled column without touching unrelated cells", () => {
    let grid = createEmptyGrid();
    for (let r = 0; r < GRID_SIZE; r++) {
      grid = placePiece(grid, [{ row: 0, col: 0 }], r, 3);
    }
    grid = placePiece(grid, [{ row: 0, col: 0 }], 0, 0);
    const result = clearLines(grid);
    expect(result.colsCleared).toBe(1);
    expect(result.grid[0][3]).toBe(0);
    expect(result.grid[0][0]).toBe(1); // untouched cell survives
  });

  it("clears simultaneous row and column intersecting correctly", () => {
    let grid = createEmptyGrid();
    for (let c = 0; c < GRID_SIZE; c++) grid = placePiece(grid, [{ row: 0, col: 0 }], 0, c);
    for (let r = 0; r < GRID_SIZE; r++) grid = placePiece(grid, [{ row: 0, col: 0 }], r, 0);
    const result = clearLines(grid);
    expect(result.rowsCleared).toBe(1);
    expect(result.colsCleared).toBe(1);
    expect(result.grid.flat().every((c) => c === 0)).toBe(true);
  });

  it("does nothing when no lines are full", () => {
    const grid = createEmptyGrid();
    const result = clearLines(grid);
    expect(result.rowsCleared).toBe(0);
    expect(result.colsCleared).toBe(0);
  });
});

describe("hasAnyValidPlacement / isGameOver", () => {
  it("detects a fully blocked grid as game over for a piece that can't fit", () => {
    let grid = createEmptyGrid();
    // Fill entire grid except leave no room for a domino.
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        grid = placePiece(grid, [{ row: 0, col: 0 }], r, c);
      }
    }
    const domino = [{ row: 0, col: 0 }, { row: 0, col: 1 }];
    expect(hasAnyValidPlacement(grid, domino)).toBe(false);
  });

  it("reports game over only when ALL tray pieces have nowhere to go", () => {
    const grid = createEmptyGrid();
    const tray = [
      { id: "a", shape: [{ row: 0, col: 0 }], colorIndex: 0 },
      null,
      null,
    ];
    expect(isGameOver(grid, tray)).toBe(false);
  });
});

describe("scoreForClear", () => {
  it("gives no points for zero lines", () => {
    expect(scoreForClear(0, 0)).toBe(0);
  });

  it("rewards multi-line clears more than the sum of single clears", () => {
    const twoLines = scoreForClear(2, 0);
    const oneLineTwice = scoreForClear(1, 0) * 2;
    expect(twoLines).toBeGreaterThan(oneLineTwice);
  });

  it("adds combo streak bonus", () => {
    const withCombo = scoreForClear(1, 3);
    const withoutCombo = scoreForClear(1, 0);
    expect(withCombo).toBeGreaterThan(withoutCombo);
  });
});
