import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import GridBoard from "../components/GridBoard";
import TrayPiece from "../components/PieceTray";
import {
  createEmptyGrid,
  canPlace,
  placePiece,
  clearLines,
  isGameOver,
  scoreForPlacement,
  scoreForClear,
} from "../game/logic";
import { randomTray } from "../game/pieces";
import { Grid, Piece } from "../game/types";
import { GRID_SIZE } from "../game/types";
import { loadBestScore, saveBestScore } from "../utils/storage";
import { colors, spacing } from "../theme";

type CellColors = (number | null)[][];

function emptyCellColors(): CellColors {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

export default function GameScreen() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [cellColors, setCellColors] = useState<CellColors>(emptyCellColors());
  const [tray, setTray] = useState<(Piece | null)[]>(randomTray());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [previewCells, setPreviewCells] = useState<{ row: number; col: number }[]>([]);
  const [previewValid, setPreviewValid] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const boardLayout = useRef({ cellSize: 0, originX: 0, originY: 0 });

  useEffect(() => {
    loadBestScore().then(setBest);
  }, []);

  useEffect(() => {
    if (isGameOver(grid, tray)) {
      setGameOver(true);
      if (score > best) {
        setBest(score);
        saveBestScore(score);
      }
    }
  }, [grid, tray]);

  const handleBoardLayout = useCallback((cellSize: number, originX: number, originY: number) => {
    boardLayout.current = { cellSize, originX, originY };
  }, []);

  const coordFromAbsolute = (absX: number, absY: number) => {
    const { cellSize } = boardLayout.current;
    // Board is laid out full-width near the top; using a fixed offset measured at runtime
    // via onLayout of the parent would be more precise in a production build. For this
    // MVP we approximate using the board's own layout callback with page coordinates.
    const col = Math.floor((absX - boardOffset.current.x) / cellSize);
    const row = Math.floor((absY - boardOffset.current.y) / cellSize);
    return { row, col };
  };

  const boardOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = (piece: Piece) => {
    setDraggingId(piece.id);
    Haptics.selectionAsync();
  };

  const handleDragMove = (piece: Piece, absX: number, absY: number) => {
    const { row, col } = coordFromAbsolute(absX, absY);
    const cells = piece.shape.map((c) => ({ row: row + c.row, col: col + c.col }));
    setPreviewCells(cells);
    setPreviewValid(canPlace(grid, piece.shape, row, col));
  };

  const handleDragEnd = (piece: Piece, absX: number, absY: number) => {
    const { row, col } = coordFromAbsolute(absX, absY);
    setDraggingId(null);
    setPreviewCells([]);

    if (!canPlace(grid, piece.shape, row, col)) {
      return;
    }

    // Commit placement
    let nextGrid = placePiece(grid, piece.shape, row, col);
    let nextColors = cellColors.map((r) => [...r]);
    for (const cell of piece.shape) {
      nextColors[row + cell.row][col + cell.col] = piece.colorIndex;
    }

    let gained = scoreForPlacement(piece.shape.length);

    const { grid: clearedGrid, rowsCleared, colsCleared } = clearLines(nextGrid);
    const linesCleared = rowsCleared + colsCleared;

    if (linesCleared > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const nextCombo = combo + 1;
      gained += scoreForClear(linesCleared, nextCombo);
      setCombo(nextCombo);

      // Clear colors for cleared cells too
      nextColors = nextColors.map((r, ri) =>
        r.map((c, ci) => (clearedGrid[ri][ci] === 0 ? null : c))
      );
      nextGrid = clearedGrid;
    } else {
      setCombo(0);
    }

    const nextTray = tray.map((p) => (p && p.id === piece.id ? null : p));
    const refilled = nextTray.every((p) => p === null) ? randomTray() : nextTray;

    setGrid(nextGrid);
    setCellColors(nextColors);
    setTray(refilled);
    setScore((s) => s + gained);
  };

  const handleRestart = () => {
    setGrid(createEmptyGrid());
    setCellColors(emptyCellColors());
    setTray(randomTray());
    setScore(0);
    setCombo(0);
    setGameOver(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>SCORE</Text>
          <Text style={styles.score}>{score}</Text>
        </View>
        <View>
          <Text style={styles.label}>BEST</Text>
          <Text style={styles.best}>{best}</Text>
        </View>
      </View>

      <View
        style={styles.boardWrap}
        onLayout={(e) => {
          boardOffset.current = { x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y };
        }}
      >
        <GridBoard
          grid={grid}
          cellColors={cellColors}
          previewCells={previewCells}
          previewValid={previewValid}
          onLayout={handleBoardLayout}
        />
      </View>

      <View style={styles.tray}>
        {tray.map((piece, i) => (
          <TrayPiece
            key={piece?.id ?? `empty-${i}`}
            piece={piece}
            disabled={gameOver}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          />
        ))}
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Game Over</Text>
          <Text style={styles.overlayScore}>Score: {score}</Text>
          <Pressable style={styles.restartBtn} onPress={handleRestart}>
            <Text style={styles.restartText}>Play Again</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
  },
  label: { color: colors.textSecondary, fontSize: 12, letterSpacing: 1, textAlign: "center" },
  score: { color: colors.accent, fontSize: 32, fontWeight: "700", textAlign: "center" },
  best: { color: colors.textPrimary, fontSize: 32, fontWeight: "700", textAlign: "center" },
  boardWrap: { paddingHorizontal: spacing.md },
  tray: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.lg,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0F1226EE",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayTitle: { color: colors.textPrimary, fontSize: 36, fontWeight: "800" },
  overlayScore: { color: colors.textSecondary, fontSize: 20, marginTop: spacing.sm },
  restartBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
  },
  restartText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
