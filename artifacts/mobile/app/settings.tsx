import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SliderRow } from "@/components/SliderRow";
import { ToggleRow } from "@/components/ToggleRow";
import Colors from "@/constants/colors";
import { useOverlay } from "@/context/OverlayContext";

const OVERLAY_COLORS = [
  { color: "#000000", name: "Negro" },
  { color: "#1A1A2E", name: "Azul oscuro" },
  { color: "#1E293B", name: "Pizarra" },
  { color: "#292524", name: "Gris oscuro" },
  { color: "#FFFFFF", name: "Blanco" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    opacity,
    autoDetectGamepad,
    overlayColor,
    setOpacity,
    toggleAutoDetect,
    setOverlayColor,
  } = useOverlay();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + webTopInset + 12 },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.headerBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Feather name="x" size={22} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + webBottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Overlay</Text>
        <View style={styles.section}>
          <SliderRow
            icon="eye"
            title="Opacidad"
            value={opacity}
            onValueChange={setOpacity}
          />
        </View>

        <Text style={styles.sectionTitle}>Color de cobertura</Text>
        <View style={styles.colorRow}>
          {OVERLAY_COLORS.map((c) => (
            <Pressable
              key={c.color}
              onPress={() => setOverlayColor(c.color)}
              style={({ pressed }) => [
                styles.colorOption,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c.color },
                  overlayColor === c.color && styles.colorSwatchActive,
                  c.color === "#FFFFFF" && {
                    borderWidth: 1,
                    borderColor: Colors.light.border,
                  },
                ]}
              >
                {overlayColor === c.color ? (
                  <Feather
                    name="check"
                    size={16}
                    color={c.color === "#FFFFFF" ? "#000" : "#FFFFFF"}
                  />
                ) : null}
              </View>
              <Text style={styles.colorName}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Vista previa</Text>
        <View style={styles.previewContainer}>
          <View style={styles.previewScreen}>
            <View style={styles.previewGame}>
              <View style={styles.previewControllerArea}>
                <View style={styles.previewDpad}>
                  <View style={styles.previewDpadBtn} />
                  <View style={[styles.previewDpadBtn, { marginLeft: 18, marginRight: 18 }]} />
                  <View style={styles.previewDpadBtn} />
                </View>
                <View style={styles.previewActionBtns}>
                  <View style={styles.previewActionBtn} />
                  <View style={styles.previewActionBtn} />
                </View>
              </View>
              <View
                style={[
                  styles.previewOverlay,
                  {
                    backgroundColor:
                      overlayColor +
                      Math.round(Math.max(0.05, opacity) * 255)
                        .toString(16)
                        .padStart(2, "0"),
                  },
                ]}
              />
            </View>
          </View>
          <Text style={styles.previewLabel}>
            Asi se veran las zonas cubierta con la opacidad y color actual
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Deteccion</Text>
        <View style={styles.section}>
          <ToggleRow
            icon="wifi"
            title="Auto-detectar mando"
            subtitle="Activar overlay automaticamente"
            value={autoDetectGamepad}
            onToggle={toggleAutoDetect}
          />
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>GamePad Overlay v1.0</Text>
          <Text style={styles.aboutText}>
            Oculta los botones tactiles de tus juegos cuando usas un mando.
            Configura zonas personalizadas para cada juego.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    textAlign: "center",
  },
  content: {
    gap: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  section: {
    gap: 10,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorOption: {
    alignItems: "center",
    gap: 6,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: Colors.light.tint,
  },
  colorName: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  previewContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
  },
  previewScreen: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  previewGame: {
    flex: 1,
    justifyContent: "flex-end",
    position: "relative",
  },
  previewControllerArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  previewDpad: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewDpadBtn: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  previewActionBtns: {
    flexDirection: "row",
    gap: 8,
  },
  previewActionBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  previewLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  aboutSection: {
    marginTop: 32,
    alignItems: "center",
    gap: 6,
    paddingBottom: 20,
  },
  aboutTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  aboutText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 20,
  },
});
