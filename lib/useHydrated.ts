"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "./store";

/** True once the persisted stores have been read from localStorage. */
export function useHydrated() {
  return useSyncExternalStore(
    (cb) => useAuth.persist.onFinishHydration(cb),
    () => useAuth.persist.hasHydrated(),
    () => false,
  );
}
