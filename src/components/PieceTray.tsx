import React from "react";
import { View, StyleSheet } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Piece } from "../game/types";
import { pieceDimensions } from "../game/pieces";
import { colors, pieceColors, radius, spacing } from "../theme";

const TRAY_CELL = 22;

type Props = {
  piece: Piece | null;
  disabled: boolean;
  onDragStart: (piece: Piece) => void;
  onDragMove: (piece: Piece, absoluteX: number, absoluteY: number) => void;
  onDragEnd: (piece: Piece, absoluteX: number, absoluteY: number) => void;
};

export default function TrayPiece({ piece, disabled, onDragStart, onDragMove, onDragEnd }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  if (!piece) {
    return <View style={styles.slot} />;
  }

  const { rows, cols } = pieceDimensions(piece.shape);
  const color = pieceColors[piece.colorIndex];

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onStart((e) => {
      scale.value = withSpring(1.3);
      startX.value = e.absoluteX;
      startY.value = e.absoluteY;
      runOnJS(onDragStart)(piece);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY - 60; // lift above finger
      runOnJS(onDragMove)(piece, e.absoluteX, e.absoluteY - 60);
    })
    .onEnd((e) => {
      runOnJS(onDragEnd)(piece, e.absoluteX, e.absoluteY - 60);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: scale.value > 1 ? 100 : 1,
  }));

  return (
    <View style={styles.slot}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.pieceWrap, animatedStyle, disabled && styles.disabled]}>
          {Array.from({ length: rows }).map((_, r) => (
            <View key={r} style={styles.pieceRow}>
              {Array.from({ length: cols }).map((_, c) => {
                const filled = piece.shape.some((cell) => cell.row === r && cell.col === c);
                return (
                  <View
                    key={c}
                    style={[
                      styles.pieceCell,
                      filled ? { backgroundColor: color } : { backgroundColor: "transparent" },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  pieceWrap: {
    padding: spacing.xs,
  },
  pieceRow: {
    flexDirection: "row",
  },
  pieceCell: {
    width: TRAY_CELL,
    height: TRAY_CELL,
    margin: 1.5,
    borderRadius: radius.sm,
  },
  disabled: {
    opacity: 0.35,
  },
});
