import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import type { OverlayZone } from "@/context/OverlayContext";

interface ZoneCanvasProps {
  zones: OverlayZone[];
  onZonesChange: (zones: OverlayZone[]) => void;
  opacity: number;
  overlayColor: string;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function ZoneCanvas({
  zones,
  onZonesChange,
  opacity,
  overlayColor,
}: ZoneCanvasProps) {
  const canvasRef = useRef<View>(null);
  const [canvasLayout, setCanvasLayout] = useState({ width: 0, height: 0 });
  const [drawing, setDrawing] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [mode, setMode] = useState<"draw" | "select">("draw");

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === "draw",
      onMoveShouldSetPanResponder: () => mode === "draw",
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setDrawing({
          startX: locationX,
          startY: locationY,
          currentX: locationX,
          currentY: locationY,
        });
        setSelectedZone(null);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setDrawing((prev) =>
          prev ? { ...prev, currentX: locationX, currentY: locationY } : null,
        );
      },
      onPanResponderRelease: (evt) => {
        if (!drawing) return;
        const { locationX, locationY } = evt.nativeEvent;
        const x = Math.min(drawing.startX, locationX);
        const y = Math.min(drawing.startY, locationY);
        const width = Math.abs(locationX - drawing.startX);
        const height = Math.abs(locationY - drawing.startY);

        if (width > 20 && height > 20 && canvasLayout.width > 0) {
          const newZone: OverlayZone = {
            id: generateId(),
            x: x / canvasLayout.width,
            y: y / canvasLayout.height,
            width: width / canvasLayout.width,
            height: height / canvasLayout.height,
          };
          onZonesChange([...zones, newZone]);
        }
        setDrawing(null);
      },
    }),
  ).current;

  const deleteZone = (id: string) => {
    onZonesChange(zones.filter((z) => z.id !== id));
    setSelectedZone(null);
  };

  const clearAll = () => {
    onZonesChange([]);
    setSelectedZone(null);
  };

  const drawingRect = drawing
    ? {
        left: Math.min(drawing.startX, drawing.currentX),
        top: Math.min(drawing.startY, drawing.currentY),
        width: Math.abs(drawing.currentX - drawing.startX),
        height: Math.abs(drawing.currentY - drawing.startY),
      }
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.modeButtons}>
          <Pressable
            onPress={() => setMode("draw")}
            style={[styles.modeBtn, mode === "draw" && styles.modeBtnActive]}
          >
            <Feather
              name="edit-3"
              size={16}
              color={mode === "draw" ? "#FFFFFF" : Colors.light.textSecondary}
            />
            <Text
              style={[
                styles.modeBtnText,
                mode === "draw" && styles.modeBtnTextActive,
              ]}
            >
              Dibujar
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("select")}
            style={[styles.modeBtn, mode === "select" && styles.modeBtnActive]}
          >
            <Feather
              name="mouse-pointer"
              size={16}
              color={mode === "select" ? "#FFFFFF" : Colors.light.textSecondary}
            />
            <Text
              style={[
                styles.modeBtnText,
                mode === "select" && styles.modeBtnTextActive,
              ]}
            >
              Seleccionar
            </Text>
          </Pressable>
        </View>
        {zones.length > 0 ? (
          <Pressable
            onPress={clearAll}
            style={({ pressed }) => [
              styles.clearBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="trash" size={14} color={Colors.light.danger} />
            <Text style={styles.clearBtnText}>Limpiar</Text>
          </Pressable>
        ) : null}
      </View>

      <View
        ref={canvasRef}
        style={styles.canvas}
        onLayout={(e) => {
          setCanvasLayout({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          });
        }}
        {...panResponder.panHandlers}
      >
        <View style={styles.gridOverlay}>
          {[...Array(4)].map((_, i) => (
            <View
              key={`h${i}`}
              style={[
                styles.gridLine,
                styles.gridLineH,
                { top: `${(i + 1) * 20}%` as any },
              ]}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <View
              key={`v${i}`}
              style={[
                styles.gridLine,
                styles.gridLineV,
                { left: `${(i + 1) * 20}%` as any },
              ]}
            />
          ))}
        </View>

        {zones.map((zone) => (
          <Pressable
            key={zone.id}
            onPress={() => {
              if (mode === "select") {
                setSelectedZone(selectedZone === zone.id ? null : zone.id);
              }
            }}
            style={[
              styles.zone,
              {
                left: `${zone.x * 100}%` as any,
                top: `${zone.y * 100}%` as any,
                width: `${zone.width * 100}%` as any,
                height: `${zone.height * 100}%` as any,
                backgroundColor:
                  overlayColor +
                  Math.round(Math.max(0.1, opacity) * 255)
                    .toString(16)
                    .padStart(2, "0"),
                borderColor:
                  selectedZone === zone.id
                    ? Colors.light.danger
                    : Colors.light.tint,
                borderWidth: selectedZone === zone.id ? 2 : 1,
              },
            ]}
          >
            {selectedZone === zone.id ? (
              <Pressable
                onPress={() => deleteZone(zone.id)}
                style={styles.deleteBtn}
              >
                <Feather name="x" size={14} color="#FFFFFF" />
              </Pressable>
            ) : null}
          </Pressable>
        ))}

        {drawingRect ? (
          <View
            style={[
              styles.drawingRect,
              {
                left: drawingRect.left,
                top: drawingRect.top,
                width: drawingRect.width,
                height: drawingRect.height,
              },
            ]}
          />
        ) : null}

        {zones.length === 0 && !drawing ? (
          <View style={styles.emptyHint}>
            <Feather
              name="plus-square"
              size={32}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.emptyText}>
              Dibuja rectangulos sobre las zonas{"\n"}donde estan los botones
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.zoneCount}>
        {zones.length} zona{zones.length !== 1 ? "s" : ""} definida
        {zones.length !== 1 ? "s" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  modeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  modeBtnActive: {
    backgroundColor: Colors.light.tint,
  },
  modeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  modeBtnTextActive: {
    color: "#FFFFFF",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  clearBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.danger,
  },
  canvas: {
    flex: 1,
    backgroundColor: "#1A1A2E",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  gridLineH: {
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineV: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  zone: {
    position: "absolute",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  drawingRect: {
    position: "absolute",
    borderWidth: 2,
    borderColor: Colors.light.tint,
    borderStyle: "dashed",
    backgroundColor: Colors.light.overlay,
    borderRadius: 4,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.light.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  zoneCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 10,
  },
});
