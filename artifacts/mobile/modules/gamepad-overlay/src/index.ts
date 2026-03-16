import { EventEmitter, NativeModule } from "expo-modules-core";
import { Platform } from "react-native";

interface GamepadOverlayModuleType extends NativeModule {
  hasOverlayPermission(): boolean;
  requestOverlayPermission(): void;
  isGamepadConnected(): boolean;
  startOverlayService(
    zones: Array<{ x: number; y: number; width: number; height: number }>,
    color: string,
    opacity: number,
  ): boolean;
  stopOverlayService(): void;
  updateOverlay(
    zones: Array<{ x: number; y: number; width: number; height: number }>,
    color: string,
    opacity: number,
  ): void;
}

let nativeModule: GamepadOverlayModuleType | null = null;

try {
  if (Platform.OS === "android") {
    const { requireNativeModule } = require("expo-modules-core");
    nativeModule = requireNativeModule("GamepadOverlay");
  }
} catch {
  nativeModule = null;
}

const isNativeAvailable = nativeModule !== null;

let emitter: EventEmitter | null = null;
if (nativeModule) {
  emitter = new EventEmitter(nativeModule);
}

export function hasOverlayPermission(): boolean {
  if (!isNativeAvailable) return false;
  return nativeModule!.hasOverlayPermission();
}

export function requestOverlayPermission(): void {
  if (!isNativeAvailable) return;
  nativeModule!.requestOverlayPermission();
}

export function isGamepadConnected(): boolean {
  if (!isNativeAvailable) return false;
  return nativeModule!.isGamepadConnected();
}

export function startOverlayService(
  zones: Array<{ x: number; y: number; width: number; height: number }>,
  color: string,
  opacity: number,
): boolean {
  if (!isNativeAvailable) return false;
  return nativeModule!.startOverlayService(zones, color, opacity);
}

export function stopOverlayService(): void {
  if (!isNativeAvailable) return;
  nativeModule!.stopOverlayService();
}

export function updateOverlay(
  zones: Array<{ x: number; y: number; width: number; height: number }>,
  color: string,
  opacity: number,
): void {
  if (!isNativeAvailable) return;
  nativeModule!.updateOverlay(zones, color, opacity);
}

export type GamepadEvent = {
  deviceId: number;
  name?: string;
};

export function addGamepadConnectedListener(
  callback: (event: GamepadEvent) => void,
): { remove: () => void } {
  if (!emitter) {
    return { remove: () => {} };
  }
  const subscription = emitter.addListener("onGamepadConnected", callback);
  return subscription;
}

export function addGamepadDisconnectedListener(
  callback: (event: GamepadEvent) => void,
): { remove: () => void } {
  if (!emitter) {
    return { remove: () => {} };
  }
  const subscription = emitter.addListener("onGamepadDisconnected", callback);
  return subscription;
}

export { isNativeAvailable };
