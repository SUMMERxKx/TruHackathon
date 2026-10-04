"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setMuted } from "./sounds";

export interface Settings {
  speed: 1 | 2;
  presentation: boolean;
  muted: boolean;
  systemOverride: string;
  drawerOpen: boolean;
}

interface SettingsCtx extends Settings {
  update: (patch: Partial<Settings>) => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    speed: 1,
    presentation: false,
    muted: false,
    systemOverride: "",
    drawerOpen: false,
  });

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  // Keep side effects in sync
  useEffect(() => {
    setMuted(settings.muted);
  }, [settings.muted]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "presentation",
      settings.presentation
    );
  }, [settings.presentation]);

  // Hidden drawer: Cmd/Ctrl + Shift + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSettings((s) => ({ ...s, drawerOpen: !s.drawerOpen }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ ...settings, update }), [settings, update]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings outside SettingsProvider");
  return ctx;
}
