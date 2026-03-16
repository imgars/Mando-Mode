import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import type { GameProfile } from "@/context/OverlayContext";

interface ProfileCardProps {
  profile: GameProfile;
  isActive: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProfileCard({
  profile,
  isActive,
  onPress,
  onEdit,
  onDelete,
}: ProfileCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isActive && styles.cardActive,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.nameRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: isActive ? Colors.light.success : Colors.light.border },
            ]}
          />
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={onEdit}
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Feather name="edit-2" size={16} color={Colors.light.textSecondary} />
          </Pressable>
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Feather name="trash-2" size={16} color={Colors.light.danger} />
          </Pressable>
        </View>
      </View>
      <View style={styles.meta}>
        <Feather name="layers" size={13} color={Colors.light.textSecondary} />
        <Text style={styles.metaText}>
          {profile.zones.length} zona{profile.zones.length !== 1 ? "s" : ""}
        </Text>
        {isActive ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Activo</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 10,
  },
  cardActive: {
    borderColor: Colors.light.tint,
    backgroundColor: "#F0FDFF",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  activeBadge: {
    backgroundColor: Colors.light.overlay,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  activeBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
});
