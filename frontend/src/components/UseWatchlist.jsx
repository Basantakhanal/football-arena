import { useSyncExternalStore } from "react";

/* Tiny shared store: the sidebar badge, the cards and the "My watchlist" button all stay in sync. */
const KEY = "fph-watchlist";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || localStorage.getItem("fph-favs") || "[]");
  } catch {
    return [];
  }
};

let ids = read();
const listeners = new Set();

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = () => ids;

export function toggleWatch(id) {
  ids = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn());
}

export default function useWatchlist() {
  const list = useSyncExternalStore(subscribe, getSnapshot);
  return [list, toggleWatch];
}2