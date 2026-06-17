import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme, THEMES, type ThemeId } from "@/lib/theme";

function getAccentRgb(id: ThemeId) {
  if (id === "dark") return "0, 212, 255";
  if (id === "sage") return "74, 124, 89";
  return "27, 58, 107";
}

export function ThemeSwitcherCompact() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = THEMES.find(t => t.id === theme)!;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
        style={{ background: "var(--t-surface)", border: `1px solid var(--t-border-medium)`, color: "var(--t-text-strong)" }}>
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ background: "var(--t-bg)", border: `1px solid var(--t-border-medium)`, minWidth: "220px" }}>
            <div className="p-2">
              <p className="text-xs font-medium px-3 pt-2 pb-1" style={{ color: "var(--t-text-muted)" }}>Choose theme</p>
              {THEMES.map(t => (
                <button key={t.id} onClick={() => { setTheme(t.id as ThemeId); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left"
                  style={{ background: theme === t.id ? `rgba(${getAccentRgb(t.id)}, 0.12)` : "transparent", color: "var(--t-text-strong)" }}>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm"
                    style={{ background: t.preview.bg, borderColor: theme === t.id ? t.preview.accent : "transparent" }}>
                    {t.emoji}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: "var(--t-text-muted)" }}>{t.description}</p>
                  </div>
                  {theme === t.id && <span className="ml-auto text-xs font-bold" style={{ color: t.preview.accent }}>✓</span>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
