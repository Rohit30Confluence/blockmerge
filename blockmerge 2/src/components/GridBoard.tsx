import React from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import { GRID_SIZE, Grid } from "../game/types";
import { colors, pieceColors, radius, spacing } from "../theme";

type Props = {
  grid: Grid;
  cellColors: (number | null)[][]; // parallel to grid, colorIndex per filled cell
  previewCells?: { row: number; col: number }[]; // ghost preview while dragging
  previewValid?: boolean;
  onLayout?: (cellSize: number, originX: number, originY: number) => void;
};

export default function GridBoard({ grid, cellColors, previewCells = [], previewValid = true, onLayout }: Props) {
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, x, y } = e.nativeEvent.layout;
    const cellSize = (width - spacing.xs * 2) / GRID_SIZE;
    onLayout?.(cellSize, x, y);
  };

  const isPreview = (row: number, col: number) =>
    previewCells.some((c) => c.row === row && c.col === col);

  return (
    <View style={styles.board} onLayout={handleLayout}>
      {grid.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((cell, c) => {
            const preview = isPreview(r, c);
            const filled = cell === 1;
            const colorIdx = cellColors[r]?.[c];
            let backgroundColor = colors.gridEmpty;
            if (filled && colorIdx !== null && colorIdx !== undefined) {
              backgroundColor = pieceColors[colorIdx];
            } else if (preview) {
              backgroundColor = previewValid ? colors.accent + "88" : colors.danger + "88";
            }
            return (
              <View
                key={c}
                style={[
                  styles.cell,
                  { backgroundColor },
                  filled && styles.cellFilled,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    aspectRatio: 1,
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    margin: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.gridBorder,
  },
  cellFilled: {
    borderColor: "transparent",
  },
});
