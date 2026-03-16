import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  addGamepadConnectedListener,
  addGamepadDisconnectedListener,
  isGamepadConnected as nativeIsGamepadConnected,
  isNativeAvailable,
  startOverlayService,
  stopOverlayService,
  updateOverlay,
} from "@/modules/gamepad-overlay/src";

export interface OverlayZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameProfile {
  id: string;
  name: string;
  zones: OverlayZone[];
  createdAt: number;
}

interface OverlayState {
  profiles: GameProfile[];
  activeProfileId: string | null;
  overlayEnabled: boolean;
  opacity: number;
  autoDetectGamepad: boolean;
  gamepadConnected: boolean;
  overlayColor: string;
}

interface OverlayContextType extends OverlayState {
  addProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setActiveProfile: (id: string | null) => void;
  updateProfileZones: (profileId: string, zones: OverlayZone[]) => void;
  toggleOverlay: () => void;
  setOpacity: (value: number) => void;
  toggleAutoDetect: () => void;
  simulateGamepad: (connected: boolean) => void;
  setOverlayColor: (color: string) => void;
  getActiveProfile: () => GameProfile | undefined;
  nativeAvailable: boolean;
}

const STORAGE_KEY = "@gamepad_overlay_state";

const defaultState: OverlayState = {
  profiles: [],
  activeProfileId: null,
  overlayEnabled: false,
  opacity: 0,
  autoDetectGamepad: true,
  gamepadConnected: false,
  overlayColor: "#000000",
};

const OverlayCtx = createContext<OverlayContextType | null>(null);

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<OverlayState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setState((prev) => ({ ...prev, ...parsed, gamepadConnected: false }));
        } catch {
          /* corrupted storage, use defaults */
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (isNativeAvailable) {
      const connected = nativeIsGamepadConnected();
      if (connected) {
        setState((prev) => {
          const next = { ...prev, gamepadConnected: true };
          if (prev.autoDetectGamepad) {
            next.overlayEnabled = true;
          }
          return next;
        });
      }
    }
  }, [loaded]);

  useEffect(() => {
    if (!isNativeAvailable) return;

    const connSub = addGamepadConnectedListener((event) => {
      setState((prev) => {
        const next = { ...prev, gamepadConnected: true };
        if (prev.autoDetectGamepad) {
          next.overlayEnabled = true;
        }
        return next;
      });
    });

    const disconnSub = addGamepadDisconnectedListener((event) => {
      setState((prev) => {
        const next = { ...prev, gamepadConnected: false };
        if (prev.autoDetectGamepad) {
          next.overlayEnabled = false;
        }
        return next;
      });
    });

    return () => {
      connSub.remove();
      disconnSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!loaded || !isNativeAvailable) return;

    const activeProfile = state.profiles.find(
      (p) => p.id === state.activeProfileId,
    );
    const zones = activeProfile?.zones ?? [];

    if (state.overlayEnabled && zones.length > 0) {
      const started = startOverlayService(
        zones,
        state.overlayColor,
        state.opacity,
      );
      if (!started) {
        setState((prev) => ({ ...prev, overlayEnabled: false }));
      }
    } else {
      stopOverlayService();
    }
  }, [
    loaded,
    state.overlayEnabled,
    state.activeProfileId,
    state.overlayColor,
    state.opacity,
    state.profiles,
  ]);

  const persist = useCallback((newState: OverlayState) => {
    const { gamepadConnected, ...toSave } = newState;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, []);

  const update = useCallback(
    (updater: (prev: OverlayState) => OverlayState) => {
      setState((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const addProfile = useCallback(
    (name: string) => {
      const newProfile: GameProfile = {
        id: generateId(),
        name,
        zones: [],
        createdAt: Date.now(),
      };
      update((prev) => ({
        ...prev,
        profiles: [...prev.profiles, newProfile],
        activeProfileId: prev.activeProfileId ?? newProfile.id,
      }));
    },
    [update],
  );

  const deleteProfile = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        profiles: prev.profiles.filter((p) => p.id !== id),
        activeProfileId:
          prev.activeProfileId === id ? null : prev.activeProfileId,
      }));
    },
    [update],
  );

  const renameProfile = useCallback(
    (id: string, name: string) => {
      update((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === id ? { ...p, name } : p,
        ),
      }));
    },
    [update],
  );

  const setActiveProfile = useCallback(
    (id: string | null) => {
      update((prev) => ({ ...prev, activeProfileId: id }));
    },
    [update],
  );

  const updateProfileZones = useCallback(
    (profileId: string, zones: OverlayZone[]) => {
      update((prev) => ({
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === profileId ? { ...p, zones } : p,
        ),
      }));
    },
    [update],
  );

  const toggleOverlay = useCallback(() => {
    update((prev) => ({ ...prev, overlayEnabled: !prev.overlayEnabled }));
  }, [update]);

  const setOpacity = useCallback(
    (value: number) => {
      update((prev) => ({ ...prev, opacity: value }));
    },
    [update],
  );

  const toggleAutoDetect = useCallback(() => {
    update((prev) => ({
      ...prev,
      autoDetectGamepad: !prev.autoDetectGamepad,
    }));
  }, [update]);

  const simulateGamepad = useCallback((connected: boolean) => {
    setState((prev) => {
      const next = { ...prev, gamepadConnected: connected };
      if (prev.autoDetectGamepad) {
        next.overlayEnabled = connected;
      }
      return next;
    });
  }, []);

  const setOverlayColor = useCallback(
    (color: string) => {
      update((prev) => ({ ...prev, overlayColor: color }));
    },
    [update],
  );

  const getActiveProfile = useCallback(() => {
    return state.profiles.find((p) => p.id === state.activeProfileId);
  }, [state.profiles, state.activeProfileId]);

  if (!loaded) return null;

  return (
    <OverlayCtx.Provider
      value={{
        ...state,
        addProfile,
        deleteProfile,
        renameProfile,
        setActiveProfile,
        updateProfileZones,
        toggleOverlay,
        setOpacity,
        toggleAutoDetect,
        simulateGamepad,
        setOverlayColor,
        getActiveProfile,
        nativeAvailable: isNativeAvailable,
      }}
    >
      {children}
    </OverlayCtx.Provider>
  );
}

export function useOverlay(): OverlayContextType {
  const ctx = useContext(OverlayCtx);
  if (!ctx) throw new Error("useOverlay must be used within OverlayProvider");
  return ctx;
}
