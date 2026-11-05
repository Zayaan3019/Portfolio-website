"use client";

import { useSyncExternalStore } from "react";
import type { LensOrAll } from "@/content/types";

/*
 * The role lens lives in the URL (?for=quant), so a link can be sent per application
 * and back/forward navigation keeps working. React reads it as an external store:
 * the server renders the neutral view and the client upgrades after hydration.
 */

const LENS_EVENT = "portfolio:lens";
const VALID = new Set(["ml", "research", "swe", "ds", "quant"]);

function subscribeLens(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(LENS_EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(LENS_EVENT, cb);
  };
}

function readLens(): LensOrAll {
  const v = new URLSearchParams(window.location.search).get("for");
  return v && VALID.has(v) ? (v as LensOrAll) : "all";
}

export function useLens(): LensOrAll {
  return useSyncExternalStore(subscribeLens, readLens, () => "all");
}

export function setLens(lens: LensOrAll) {
  const url = new URL(window.location.href);
  if (lens === "all") url.searchParams.delete("for");
  else url.searchParams.set("for", lens);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(LENS_EVENT));
}

/* Theme: the attribute on <html> is the source of truth, set before paint by an inline script. */

export type Theme = "light" | "dark";

function subscribeTheme(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

export function useTheme(): Theme | null {
  return useSyncExternalStore(
    subscribeTheme,
    () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light"),
    () => null,
  );
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Storage can be unavailable (private mode); the attribute still applies.
  }
}

/** True only on the client after hydration. Used to keep simulation output out of SSR. */
const noop = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
