// Persistent reading list, stored in localStorage. No auth, no backend.
// One key per browser. SSR-safe (returns empty array on the server).

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fulcrum:reading-list:v1";
const EVENT = "fulcrum:reading-list:changed";

function readPmids(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function writePmids(pmids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pmids));
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // quota or disabled storage — silent.
  }
}

export function useReadingList() {
  const [pmids, setPmids] = useState<string[]>(() => readPmids());

  // Listen for changes from other tabs (storage event) and within the tab
  // (our custom event fired by writePmids).
  useEffect(() => {
    const refresh = () => setPmids(readPmids());
    window.addEventListener("storage", refresh);
    window.addEventListener(EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(EVENT, refresh);
    };
  }, []);

  const has = useCallback((pmid: string) => pmids.includes(pmid), [pmids]);

  const add = useCallback((pmid: string) => {
    const next = readPmids();
    if (!next.includes(pmid)) {
      next.unshift(pmid);
      writePmids(next);
    }
  }, []);

  const remove = useCallback((pmid: string) => {
    const next = readPmids().filter((p) => p !== pmid);
    writePmids(next);
  }, []);

  const toggle = useCallback((pmid: string) => {
    if (readPmids().includes(pmid)) {
      remove(pmid);
    } else {
      add(pmid);
    }
  }, [add, remove]);

  const clear = useCallback(() => writePmids([]), []);

  return { pmids, count: pmids.length, has, add, remove, toggle, clear };
}
