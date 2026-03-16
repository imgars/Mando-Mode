import { Platform } from "react-native";

interface GamepadOverlayNativeModule {
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
  startBubbleService(): boolean;
  stopBubbleService(): void;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

let nativeModule: GamepadOverlayNativeModule | null = null;

try {
  if (Platform.OS === "android") {
    const ExpoModulesCore = require("expo-modules-core");
    nativeModule = ExpoModulesCore.requireNativeModule("GamepadOverlay");
  }
} catch {
  nativeModule = null;
}

const isNativeAvailable = nativeModule !== null;

type Subscription = { remove: () => void };

function createEventSubscription(
  eventName: string,
  callback: (event: GamepadEvent) => void,
): Subscription {
  if (!nativeModule) {
    return { remove: () => {} };
  }
  try {
    const ExpoModulesCore = require("expo-modules-core");
    const emitter = new ExpoModulesCore.EventEmitter(nativeModule);
    return emitter.addListener(eventName, callback);
  } catch {
    return { remove: () => {} };
  }
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

export function startBubbleService(): boolean {
  if (!isNativeAvailable) return false;
  return nativeModule!.startBubbleService();
}

export function stopBubbleService(): void {
  if (!isNativeAvailable) return;
  nativeModule!.stopBubbleService();
}

export type GamepadEvent = {
  deviceId: number;
  name?: string;
};

export function addGamepadConnectedListener(
  callback: (event: GamepadEvent) => void,
): Subscription {
  return createEventSubscription("onGamepadConnected", callback);
}

export function addGamepadDisconnectedListener(
  callback: (event: GamepadEvent) => void,
): Subscription {
  return createEventSubscription("onGamepadDisconnected", callback);
}

export { isNativeAvailable };
