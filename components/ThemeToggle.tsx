"use client";

import { setTheme, useTheme } from "./state";

export function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(next)}
      aria-label={theme ? `Switch to ${next} theme` : "Switch theme"}
    >
      {theme === null ? "Theme" : theme === "dark" ? "Light theme" : "Dark theme"}
    </button>
  );
}
