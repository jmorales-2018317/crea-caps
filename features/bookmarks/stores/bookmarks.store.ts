"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BOOKMARKS_STORAGE_KEY,
  type BookmarksStore,
} from "@/features/bookmarks/types/bookmarks.types";

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      hasHydrated: false,

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      addBookmark: (productId) => {
        const id = productId.trim();
        if (!id) return;
        set((state) => {
          if (state.productIds.includes(id)) {
            return state;
          }
          return { productIds: [...state.productIds, id] };
        });
      },

      removeBookmark: (productId) => {
        const id = productId.trim();
        if (!id) return;
        set((state) => ({
          productIds: state.productIds.filter((entry) => entry !== id),
        }));
      },

      toggleBookmark: (productId) => {
        const id = productId.trim();
        if (!id) return;
        const { productIds } = get();
        if (productIds.includes(id)) {
          get().removeBookmark(id);
        } else {
          get().addBookmark(id);
        }
      },

      isBookmarked: (productId) => {
        const id = productId.trim();
        if (!id) return false;
        return get().productIds.includes(id);
      },

      clearBookmarks: () => {
        set({ productIds: [] });
      },

      pruneMissingBookmarks: (existingIds) => {
        const existing = new Set(existingIds);
        set((state) => {
          const next = state.productIds.filter((id) => existing.has(id));
          if (next.length === state.productIds.length) {
            return state;
          }
          return { productIds: next };
        });
      },
    }),
    {
      name: BOOKMARKS_STORAGE_KEY,
      partialize: (state) => ({ productIds: state.productIds }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
