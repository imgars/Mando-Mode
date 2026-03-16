import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ZoneCanvas } from "@/components/ZoneCanvas";
import Colors from "@/constants/colors";
import { useOverlay, type OverlayZone } from "@/context/OverlayContext";

export default function EditorScreen() {
  const insets = useSafeAreaInsets();
  const {
    profiles,
    activeProfileId,
    opacity,
    overlayColor,
    updateProfileZones,
    getActiveProfile,
  } = useOverlay();

  const activeProfile = getActiveProfile();
  const [localZones, setLocalZones] = useState<OverlayZone[]>(
    activeProfile?.zones ?? [],
  );
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleSave = () => {
    if (activeProfile) {
      updateProfileZones(activeProfile.id, localZones);
      router.back();
    } else {
      if (Platform.OS === "web") {
        alert("Crea un perfil primero en la seccion de Perfiles");
      } else {
        Alert.alert(
          "Sin perfil activo",
          "Crea un perfil primero en la seccion de Perfiles",
          [{ text: "OK" }],
        );
      }
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + webTopInset + 12,
          paddingBottom: insets.bottom + webBottomInset + 12,
        },
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Editor de Zonas</Text>
          {activeProfile ? (
            <Text style={styles.headerSubtitle}>{activeProfile.name}</Text>
          ) : null}
        </View>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { opacity: 0.85 },
            !activeProfile && { opacity: 0.4 },
          ]}
          disabled={!activeProfile}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Guardar</Text>
        </Pressable>
      </View>

      {!activeProfile ? (
        <View style={styles.noProfileWarn}>
          <Feather name="alert-triangle" size={18} color={Colors.light.warning} />
          <Text style={styles.noProfileText}>
            Selecciona o crea un perfil primero
          </Text>
          <Pressable
            onPress={() => {
              router.back();
              setTimeout(() => router.push("/profiles"), 300);
            }}
            style={({ pressed }) => [
              styles.goProfileBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.goProfileBtnText}>Ir a Perfiles</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.canvasWrap}>
        <ZoneCanvas
          zones={localZones}
          onZonesChange={setLocalZones}
          opacity={opacity}
          overlayColor={overlayColor}
        />
      </View>

      <View style={styles.instructions}>
        <View style={styles.instructionRow}>
          <View style={[styles.instructionDot, { backgroundColor: "#3B82F6" }]} />
          <Text style={styles.instructionText}>
            Modo Dibujar: arrastra para crear zonas
          </Text>
        </View>
        <View style={styles.instructionRow}>
          <View style={[styles.instructionDot, { backgroundColor: "#22C55E" }]} />
          <Text style={styles.instructionText}>
            Modo Seleccionar: toca una zona para eliminarla
          </Text>
        </View>
      </View>
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
    marginBottom: 16,
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  noProfileWarn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  noProfileText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#92400E",
  },
  goProfileBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.warning,
    borderRadius: 8,
  },
  goProfileBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  canvasWrap: {
    flex: 1,
    marginBottom: 12,
  },
  instructions: {
    gap: 6,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  instructionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  instructionText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
});
