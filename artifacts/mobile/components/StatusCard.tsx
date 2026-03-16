import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface StatusCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  active: boolean;
  onPress?: () => void;
}

export function StatusCard({
  icon,
  title,
  subtitle,
  active,
  onPress,
}: StatusCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        active && styles.cardActive,
        pressed && onPress && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: active ? Colors.light.tint : Colors.light.surfaceSecondary },
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={active ? "#FFFFFF" : Colors.light.textSecondary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View
        style={[
          styles.indicator,
          { backgroundColor: active ? Colors.light.success : Colors.light.border },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardActive: {
    borderColor: Colors.light.tint,
    backgroundColor: "#F0FDFF",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 14,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
