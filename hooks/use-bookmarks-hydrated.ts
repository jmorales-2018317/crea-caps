"use client";

import { useEffect } from "react";
import { useBookmarksStore } from "@/hooks/use-bookmarks-store";

/** True only after localStorage rehydration — safe for bookmark UI state. */
export function useBookmarksHydrated() {
  const hasHydrated = useBookmarksStore((state) => state.hasHydrated);

  useEffect(() => {
    const markHydrated = () => {
      useBookmarksStore.getState().setHasHydrated(true);
    };

    if (useBookmarksStore.persist.hasHydrated()) {
      markHydrated();
    }

    return useBookmarksStore.persist.onFinishHydration(markHydrated);
  }, []);

  return hasHydrated;
}
