import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface ToggleRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  value: boolean;
  onToggle: () => void;
}

export function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onToggle,
}: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={18} color={Colors.light.tint} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.light.border, true: Colors.light.tint }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={Colors.light.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
