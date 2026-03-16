import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
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

import { StatusCard } from "@/components/StatusCard";
import { ToggleRow } from "@/components/ToggleRow";
import Colors from "@/constants/colors";
import { useOverlay } from "@/context/OverlayContext";
import {
  hasOverlayPermission,
  requestOverlayPermission,
} from "@/modules/gamepad-overlay/src";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    overlayEnabled,
    gamepadConnected,
    autoDetectGamepad,
    activeProfileId,
    profiles,
    toggleOverlay,
    toggleAutoDetect,
    simulateGamepad,
    getActiveProfile,
    nativeAvailable,
  } = useOverlay();

  const activeProfile = getActiveProfile();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleToggleOverlay = () => {
    if (nativeAvailable && !hasOverlayPermission()) {
      requestOverlayPermission();
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleOverlay();
  };

  const handleSimulateGamepad = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(
        gamepadConnected
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success,
      );
    }
    simulateGamepad(!gamepadConnected);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: insets.bottom + webBottomInset + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>GamePad Overlay</Text>
            <Text style={styles.appSubtitle}>Modo Mando para tus juegos</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            style={({ pressed }) => [
              styles.settingsBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="settings" size={22} color={Colors.light.text} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleToggleOverlay}
          style={({ pressed }) => [
            styles.mainToggle,
            overlayEnabled && styles.mainToggleActive,
            pressed && { transform: [{ scale: 0.97 }] },
          ]}
        >
          <View
            style={[
              styles.mainToggleIcon,
              {
                backgroundColor: overlayEnabled
                  ? "rgba(255,255,255,0.2)"
                  : Colors.light.surfaceSecondary,
              },
            ]}
          >
            <Feather
              name={overlayEnabled ? "eye-off" : "eye"}
              size={28}
              color={overlayEnabled ? "#FFFFFF" : Colors.light.textSecondary}
            />
          </View>
          <Text
            style={[
              styles.mainToggleTitle,
              overlayEnabled && { color: "#FFFFFF" },
            ]}
          >
            {overlayEnabled ? "Overlay Activo" : "Overlay Inactivo"}
          </Text>
          <Text
            style={[
              styles.mainToggleSubtitle,
              overlayEnabled && { color: "rgba(255,255,255,0.7)" },
            ]}
          >
            {overlayEnabled
              ? "Los botones tactiles estan ocultos"
              : "Toca para activar el overlay"}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Estado</Text>
        <View style={styles.statusCards}>
          <StatusCard
            icon="bluetooth"
            title="Mando"
            subtitle={gamepadConnected ? "Conectado" : "Desconectado"}
            active={gamepadConnected}
            onPress={handleSimulateGamepad}
          />
          <StatusCard
            icon="layers"
            title="Perfil Activo"
            subtitle={activeProfile?.name ?? "Ninguno seleccionado"}
            active={!!activeProfile}
            onPress={() => router.push("/profiles")}
          />
        </View>

        <Text style={styles.sectionTitle}>Ajustes rapidos</Text>
        <View style={styles.settingsCards}>
          <ToggleRow
            icon="wifi"
            title="Auto-detectar mando"
            subtitle="Activar overlay al conectar"
            value={autoDetectGamepad}
            onToggle={toggleAutoDetect}
          />
        </View>

        <View style={styles.quickActions}>
          <Pressable
            onPress={() => router.push("/editor")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}>
              <Feather name="edit-3" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.actionTitle}>Editor de Zonas</Text>
            <Text style={styles.actionSubtitle}>
              Dibuja las areas a ocultar
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={Colors.light.textSecondary}
              style={styles.actionChevron}
            />
          </Pressable>

          <Pressable
            onPress={() => router.push("/profiles")}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#F0FDF4" }]}>
              <Feather name="folder" size={20} color="#22C55E" />
            </View>
            <Text style={styles.actionTitle}>Perfiles de Juego</Text>
            <Text style={styles.actionSubtitle}>
              {profiles.length} perfil{profiles.length !== 1 ? "es" : ""} guardado
              {profiles.length !== 1 ? "s" : ""}
            </Text>
            <Feather
              name="chevron-right"
              size={18}
              color={Colors.light.textSecondary}
              style={styles.actionChevron}
            />
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Feather
            name="info"
            size={16}
            color={Colors.light.tint}
          />
          <Text style={styles.infoText}>
            {nativeAvailable
              ? "Modulo nativo activo. La deteccion de gamepad y el overlay funcionan mientras la app esta en segundo plano. La app debe estar ejecutandose para detectar conexiones."
              : "Toca el boton \"Mando\" para simular la conexion de un gamepad. En un dispositivo con build nativo, la deteccion es automatica."}
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
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  appSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  mainToggle: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 24,
  },
  mainToggleActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tintDark,
  },
  mainToggleIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  mainToggleTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  mainToggleSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  statusCards: {
    gap: 10,
    marginBottom: 24,
  },
  settingsCards: {
    gap: 10,
    marginBottom: 24,
  },
  quickActions: {
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    marginLeft: 14,
  },
  actionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  actionChevron: {
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.light.overlay,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.tintDark,
    lineHeight: 19,
  },
});
