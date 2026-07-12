import { useEffect, useState } from "react";
import { KEYS, storage } from "@/lib/storage";

export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  useEffect(() => {
    const saved = storage.get<Theme>(KEYS.theme, "light");
    setThemeState(saved);
    applyTheme(saved);
  }, []);
  const setTheme = (t: Theme) => {
    setThemeState(t);
    storage.set(KEYS.theme, t);
    applyTheme(t);
  };
  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");
  return { theme, setTheme, toggle };
}
