import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "dark" | "sage" | "navy";

export interface Theme {
  id: ThemeId;
  name: string;
  emoji: string;
  description: string;
  preview: { bg: string; accent: string; text: string };
}

export const THEMES: Theme[] = [
  { id: "dark", name: "Dark Neon", emoji: "⚡", description: "Electric black", preview: { bg: "#0a0a0a", accent: "#00d4ff", text: "#ffffff" } },
  { id: "sage", name: "Sage Green", emoji: "🌿", description: "Calm & trustworthy", preview: { bg: "#F8FAF8", accent: "#4A7C59", text: "#1a2e24" } },
  { id: "navy", name: "Navy Blue", emoji: "🌊", description: "Confident & clean", preview: { bg: "#F7F8FC", accent: "#1B3A6B", text: "#0f1f3d" } },
];

const ThemeContext = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void }>({ theme: "dark", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try { return (localStorage.getItem("portfolio-theme") as ThemeId) || "dark"; } catch { return "dark"; }
  });

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    try { localStorage.setItem("portfolio-theme", t); } catch {}
  };

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
