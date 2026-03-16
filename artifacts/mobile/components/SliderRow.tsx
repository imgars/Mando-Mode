import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";

interface SliderRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  value: number;
  min?: number;
  max?: number;
  formatValue?: (v: number) => string;
  onValueChange: (v: number) => void;
}

export function SliderRow({
  icon,
  title,
  value,
  min = 0,
  max = 1,
  formatValue,
  onValueChange,
}: SliderRowProps) {
  const displayValue = formatValue
    ? formatValue(value)
    : `${Math.round(value * 100)}%`;

  const trackRef = useRef<View>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (trackWidth > 0) {
          const ratio = clamp(evt.nativeEvent.locationX / trackWidth, 0, 1);
          const newVal = min + ratio * (max - min);
          onValueChange(Math.round(newVal * 20) / 20);
        }
      },
      onPanResponderMove: (evt) => {
        if (trackWidth > 0) {
          const ratio = clamp(evt.nativeEvent.locationX / trackWidth, 0, 1);
          const newVal = min + ratio * (max - min);
          onValueChange(Math.round(newVal * 20) / 20);
        }
      },
    }),
  ).current;

  const fraction = max > min ? (value - min) / (max - min) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Feather name={icon} size={18} color={Colors.light.tint} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>
      <View
        ref={trackRef}
        style={styles.track}
        onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBg} />
        <View style={[styles.trackFill, { width: `${fraction * 100}%` as any }]} />
        <View
          style={[
            styles.thumb,
            { left: `${fraction * 100}%` as any },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    marginLeft: 12,
  },
  value: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  track: {
    height: 36,
    justifyContent: "center",
    marginTop: 8,
    position: "relative",
  },
  trackBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 14,
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
  },
  trackFill: {
    position: "absolute",
    left: 0,
    top: 14,
    height: 8,
    backgroundColor: Colors.light.tint,
    borderRadius: 4,
  },
  thumb: {
    position: "absolute",
    top: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.tint,
    marginLeft: -11,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
